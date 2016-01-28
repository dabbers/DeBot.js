var events = require('events');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Bot = require('./Bot');
var Network = require('./Network');
var Commandable = require('./Commandable');
var moduleHandler = require('./ModuleHandler');

function BotGroup(name, settings) {
	this.isBot = false;

	this.__defineGetter__('alias', function(){
		return name;
	});

	events.EventEmitter.call(this);
	Commandable.call(this);
	moduleHandler(this);

	settings = settings || JSON.parse(JSON.stringify(Core.defaultGroupSetting));
	var self = this;
	this.bots = {};
	var loaded = false;
	this.passer = undefined;
	this.networks = {};
	this.settings = settings;

	this.on('tick', function() {
		for(var i in self.bots) {
			self.bots[i].tick();
		}
	});


	this.addBot = function(botOrName, options) {
		// createBot will call this function again once the bot is created.
		// We don't need to add the bot if we aren't passed one yet.
		if (!(botOrName instanceof Bot)) {
			if (self.bots[botOrName]) return false;
			botOrName = Core.createBot(botOrName, this.name, options);
		}
		else
		{
			this.bots[botOrName.alias] = botOrName;

			if (loaded) {
				// This case happens when we add a bot AFTER everything is loaded. 
				// This means we added a bot manually, so we need to save the bot into the settings.
				Core.config.BotGroups[self.alias].Bots[botOrName.alias] = botOrName.settings();
				Core.config.save();

				botOrName.on("OnConnectionEstablished", function(server, msg) {
					for(var networkIndex = 0; networkIndex < settings.Networks.length; networkIndex++) {

						if (settings.Networks[networkIndex].Network == server.alias) {

							for(var chanIdx = 0; chanIdx < settings.Networks[networkIndex].Channels.length; chanIdx++) {
								botOrName.sockets[server.alias].Write("JOIN " + settings.Networks[networkIndex].Channels[chanIdx]);
							}
							break;
						}
					}
				});

				botOrName.on("OnPrivmsg", function(bk) { return function(server, msg) {
					self.emit("OnPrivmsg", server, msg, bk);
				}; }(botOrName));

				for(var networkIndex = 0; networkIndex < settings.Networks.length; networkIndex++) {
					botOrName.connect(settings.Networks[networkIndex].Network, Core.randomServer(settings.Networks[networkIndex].Network));
					self.networks[settings.Networks[networkIndex].Network].PerformConnect(botOrName);
				}
			}
		}

		return botOrName;
	}

	this.delBot = function(botOrName) {
		if (botOrName instanceof Bot) {
			botOrName = botOrName.alias;
		}

		delete Core.config.BotGroups[self.alias].Bots[botOrName.alias];
		Core.config.save();

		for(var networkIndex = 0; networkIndex < settings.Networks.length; networkIndex++) {
			self.bots[botOrName].disconnect(settings.Networks[networkIndex].Network, "DeBot.js Framework v" + Core.version);
		}

		delete self.bots[botOrName];

		return self;
	}

	this.addNetwork = function(networkName, connectionStringOrStrings) {
		if (connectionStringOrStrings) {
			if ("string" == typeof connectionStringOrStrings) {
				connectionStringOrStrings = [ connectionStringOrStrings ];
			}

			Core.setNetwork(networkName, connectionStringOrStrings);
		}

		this.networks[networkName] = new Network(self, Core.context, networkName);

		for(var bot in self.bots) {
			// Try and connect each bot to a random server for redundancy. 
			self.bots[bot].connect(networkName, Core.randomServer(networkName));
			this.networks[networkName].PerformConnect(self.bots[bot]);
		}
		
		return self;
	}

	this.delNetwork = function(networkOrName) {
		
	}
	
	var command_prefix = settings.CommandPrefix;

	// Condiition of a group not being added to core.groups before we were adding bots to it
	this.init = function() {

		for(var botKey in settings.Bots) {
			
			self.addBot(botKey, settings.Bots[botKey]);
			self.bots[botKey].on("OnConnectionEstablished", function (bot) {
				bot = self.bots[bot];
				return function(server, msg) {
					for(var networkIndex = 0; networkIndex < settings.Networks.length; networkIndex++) {

						if (settings.Networks[networkIndex].Network == server.alias) {

							for(var chanIdx = 0; chanIdx < settings.Networks[networkIndex].Channels.length; chanIdx++) {
								bot.sockets[server.alias].Write("JOIN " + settings.Networks[networkIndex].Channels[chanIdx]);
							}
							break;
						}
					}
				}
			}(botKey));

			// Make all bots forward their PRIVMSG events to the botgroup just in case a botgroup command is called
			self.bots[botKey].on("OnPrivmsg", function(bk) { return function(server, msg) {
				self.emit("OnPrivmsg", server, msg, self.bots[bk]);
			}; }(botKey));
		}
		
		for(var network in settings.Networks) {
			self.addNetwork(settings.Networks[network].Network);
		}
		for(var i in settings.Modules) {
			self.loadModule(settings.Modules[i]);
		}
		loaded = true;
	}

	this.__defineGetter__('events', function(){
		return self.passer || self.bots[0];
	})
	this.__defineGetter__('Events', function(){
		return this.events;
	})

	this.__defineGetter__('name', function(){
		return name;
	})

	this.__defineGetter__('settings', function(){
		return settings;
	})


	/*
	 * Returns a Bot object that can execute in this environment
	 * Converts the botNick into a bot instance if in a PM/Query.
	 */
	this.getBotExecutor = function(serverAlias, botNick, channel) {
		if (!channel.isChannel) return self.bots[botNick];

		var indx = 0;
		var botkeys = Object.keys(self.bots);
		var firstbot = botkeys[0];


		// Loop while not in the channel, and we've not reached the last item (without going past it)
		while(
			!self.networks[serverAlias].nickIsInChannel(self.bots[firstbot].Hosts[serverAlias].Nick, channel.Display) 
			&& indx + 1 < botkeys.length
		) {
			self.bots[firstbot].lastNetwork = serverAlias;
			firstbot = botkeys[++indx];
		}
		
		self.bots[firstbot].lastNetwork = serverAlias;
		self.bots[firstbot].lastChannel = channel.Display;

		return self.bots[firstbot];
	}

	/*
	 * Determines if this bot can execute in this environment. 
	 */
	this.botIsExecutor = function(serverAlias, botAlias, channel) {
		return botAlias == self.getBotExecutor(serverAlias, botAlias, channel).alias;
	}


	// These commands will be invoked for EVERY bot in the group, in the network, in the channel.
	// Or will be invoked by a single bot not in a channel.
	// Bot gets message, sets group.passer to itself, parsers the message through the group-shared network,
	// calls OnPrivmsg on itself, which in turn calls onprivmsg to the group.
	// Bot -> Group Network -> Bot ->Group
	// Not a pretty data flow, but effective.

	// Raw eval command.
	self.addCommand(settings.RawCommandPrefix || (command_prefix + command_prefix), {"level":3, "timer":0, "persist":false}, function(server, channel, msg) {
		bot = self.passer;
		var group = self; // alias/shortcut

		if (!self.botIsExecutor(server.alias, bot.alias, channel)) {
			//channel = server.Channels[msg.Parts[2]];
			return;
		}

		var msgCopy = JSON.parse(JSON.stringify(msg));

		try {
			eval(msgCopy.Parts.splice(4).join(" "));
		}
		catch(exception) {
			bot.say(server.alias, channel.Display, "[RAWERR] " + exception);
		}
	});

	// a handy clear buffer command in case you start spamming the channel.
	self.addCommand(command_prefix + "clearbuffer", {"level":3, "timer":0, "persist":false}, function(server, channel, msg) {
		bot = self.passer;
		var group = self; // alias/shortcut

		for(var i in bot.sockets) {
			bot.sockets[i].Socket().clearQueue();
		}
	});

	// Logging in. Can use any bot to login really
	self.addCommand("login", {"allowpm":true, "timer":0, "persist":false}, function(server, channel, msg) {

		bot = self.passer;
		if (self.attemptLogin(server, name, channel, msg)) {
			bot.say("Success! Logged in");
		}
		else {
			bot.say("Error! Invalid host/password/botgroup");
		}
	});

	self.join = function(net, chan, pass) {
		// Check if pass provided because that means the other 2 aren't what they
		// are supposed to be if no pass is provided
		if (!pass) {

			// verify if net is actually a network
			if (!self.networks[net]) {
				// net is a channel. Check if password provided
				if (chan) {
					pass = chan;
				}
				chan = net;
				net = self.passer.lastNetwork;
			}
		}


		// Todo: Clean this up, less loops maybe?
		var netz = settings.Networks.filter(function (n) { return n.Network == net;});
		if (netz.length != 0 && netz[0].Channels.filter(function (c) { return c == chan; }).length == 0) {
			for(var i = 0; i < Core.config.BotGroups[self.alias].Networks.length; i++) {
				if (Core.config.BotGroups[self.alias].Networks[i].Network == net) {
					Core.config.BotGroups[self.alias].Networks[i].Channels.push(chan);
					Core.config.save();
					break;
				}
			}
			
		}


		for(var bot in self.bots) {
			self.bots[bot].join(net, chan, pass);
		}

		return self;
	}


	/*
	 * Mass part all bots, and remove from config a channel.
	 * Either .part()
	 * Or 	  .part(channel)
	 * Or 	  .part(channel, reason)
	 * Or 	  .part(net, channel)
	 * Or 	  .part(net, channel, reason)
	 */
	this.part = function(net, chan, reason) {
		// Check if reason provided because that means the other 2 aren't what they
		// are supposed to be if no reason is provided
		if (!reason) {

			// verify if net is actually a network
			if (!self.networks.hasOwnProperty(net)) {
				// net is a channel. Check if password provided
				if (chan) {
					reason = chan;
				}

				chan = net || self.passer.lastChannel;
				net = self.passer.lastNetwork;
			}
		}


		// Todo: Clean this up, less loops maybe?
		var netz = settings.Networks.filter(function (n) { return n.Network == net;});
		if (netz.length != 0 && netz[0].Channels.filter(function (c) { return c == chan; }).length != 0) {

			for(var i = 0; i < Core.config.BotGroups[self.alias].Networks.length; i++) {
				if (Core.config.BotGroups[self.alias].Networks[i].Network == net) {
					for(var j = 0; j < Core.config.BotGroups[self.alias].Networks[i].Channels.length; j++) {
						if (Core.config.BotGroups[self.alias].Networks[i].Channels[j] == chan) {
							Core.config.BotGroups[self.alias].Networks[i].Channels.splice(j, 1);
							Core.config.save();
							break;
						}

					}

					break;
				}
			}			
		}

		for(var bot in self.bots) {
			self.bots[bot].part(net, chan, reason);
		}

		return self;
	}

}
util.inherits(BotGroup, Commandable);
util.inherits(BotGroup,EventEmitter);
util.inherits(Bot, 	  moduleHandler);
util.inherits(Bot,     EventEmitter);

module.exports = BotGroup;