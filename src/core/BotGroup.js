var events = require('events');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Bot = require('./Bot');
var Network = require('./Network');
var Commandable = require('./Commandable');
var moduleHandler = require('./ModuleHandler');

function BotGroup(name, settings) {
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

	this.tick = function() {
		for(var i in self.bots) {
			self.bots[i].tick();
		}
	}

	this.addBot = function(botOrName, options) {
		// createBot will call this function again once the bot is created.
		// We don't need to add the bot if we aren't passed one yet.
		if (!(botOrName instanceof Bot)) {
			botOrName = Core.createBot(botOrName, this.name, options);
		}
		else
		{
			this.bots[botOrName.alias] = botOrName;

			if (loaded) {
				botOrName.on("OnConnectionEstablished", function(server, msg) {
					for(var chan in self.settings.Channels) {
						botOrName.sockets[server.alias].Write("JOIN " + settings.Channels[chan]);
					}
				});
				botOrName.on("OnPrivmsg", function(server, msg) {
					self.emit("OnPrivmsg", server, msg);
				});

				for(var networkName in settings.Networks) {

					botOrName.connect(settings.Networks[networkName], Core.randomServer(settings.Networks[networkName]));
					this.networks[settings.Networks[networkName]].PerformConnect(botOrName);
				}
			}
		}

		return botOrName;
	}

	this.delBot = function(botOrName) {
		if (botOrName instanceof Bot) {
			botOrName = botOrName.alias;
		}
		delete self.bots[botOrName];
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
	}

	this.delNetwork = function(networkOrName) {

	}
	
	var command_prefix = settings.CommandPrefix;

	// Condiition of a group not being added to the groups before we were adding bots to it
	this.init = function() {

		for(var botKey in settings.Bots) {
			
			self.addBot(botKey, settings.Bots[botKey]);
			self.bots[botKey].on("OnConnectionEstablished", function (bot) {
				bot = self.bots[bot];
				return function(server, msg) {
					for(var chan in self.settings.Channels) {
						bot.sockets[server.alias].Write("JOIN " + settings.Channels[chan]);
					}
				}
			}(botKey));

			// Make all bots forward their PRIVMSG events to the botgroup just in case a botgroup command is called
			self.bots[botKey].on("OnPrivmsg", function(server, msg) {
				self.emit("OnPrivmsg", server, msg);
			});
		}
		
		for(var network in settings.Networks) {
			self.addNetwork(settings.Networks[network]);
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

	this.botIsExecutor = function(serverAlias, botNick, channel) {
		var indx = 0;

		var firstbot = Object.keys(self.bots)[0];

		while(
			!self.networks[serverAlias].nickIsInChannel(self.bots[firstbot].Nick, channel) 
			&& indx + 1 < Object.keys(self.bots).length
		) {
			firstbot = Object.keys(self.bots)[++indx];
		}

		return botNick == firstbot;
	}


	// These commands will be invoked for EVERY bot in the group, in the network, in the channel.
	// Or will be invoked by a single bot not in a channel.
	// Bot gets message, sets group.passer to itself, parsers the message through the group-shared network,
	// calls OnPrivmsg on itself, which in turn calls onprivmsg to the group.
	// Bot -> Group Network -> Bot ->Group
	// Not a pretty data flow, but effective.

	// Raw eval command.
	self.addCommand(settings.RawCommandPrefix || (command_prefix + command_prefix), {"level":3, "timer":0}, function(server, channel, msg) {
		bot = self.passer;
		var group = self; // alias/shortcut

		if (channel.isChannel && !self.botIsExecutor(server.alias, bot.Nick, channel.Display)) {
			//channel = server.Channels[msg.Parts[2]];
			return;
		}

		var lines = [];
		console.log = Core.createLogWrapper(lines,  channel.Display);
		global.echo = console.log;

		eval(msg.Parts.splice(4).join(" "));

		console.log = console.tmp;
		bot.sockets[server.alias].Write(lines);
	});

	// a handy clear buffer command in case you start spamming the channel.
	self.addCommand(command_prefix + "clearbuffer", {"level":3, "timer":0}, function(server, channel, msg) {
		bot = self.passer;
		var group = self; // alias/shortcut

		for(var i in bot.sockets) {
			bot.sockets[i].Socket().clearQueue();
		}
	});

	// Logging in. Can use any bot to login really
	self.addCommand("login", {"allowpm":true, "timer":0}, function(server, channel, msg) {

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
			if (!self.sockets[net]) {
				// net is a channel. Check if password provided
				if (chan) {
					pass = chan;
				}
				chan = net;
				net = lastnet;
			}
		}

		for(var bot in self.bots) {
			self.bots[bot].sockets[net].Write("JOIN " + chan + " " + pass);
		}
	}


}
util.inherits(BotGroup, Commandable);
util.inherits(BotGroup,EventEmitter);
util.inherits(Bot, 	  moduleHandler);
util.inherits(Bot,     EventEmitter);

module.exports = BotGroup;