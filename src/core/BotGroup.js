var events = require('events');
var util = require('util');
var Bot = require('./Bot');
var Network = require('./Network');
var Commandable = require('./Commandable');

function BotGroup(name, settings) {
	events.EventEmitter.call(this);
	Commandable.call(this);

	settings = settings || Core.defaultGroupSetting;
	var self = this;
	this.bots = {};

	this.passer = undefined;
	this.networks = {};
	this.settings = settings;


	this.tick = function() {
		for(var i in self.bots) {
			self.bots[i].tick();
		}
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

	// Condiition of a group not being added to the groups before we were adding bots to it
	this.init = function() {
		var command_prefix = settings.CommandPrefix;

		for(var botKey in settings.Bots) {
			
			self.addBot(botKey, settings.Bots[botKey]);
			self.bots[botKey].on("OnConnectionEstablished", function(server, msg) {
				var bot = String(botKey);
				for(var chan in self.settings.Channels) {
					self.bots[bot].sockets[server.alias].Write("JOIN " + settings.Channels[chan]);
				}
			});

			self.bots[botKey].addCommand(settings.RawCommandPrefix || (command_prefix + command_prefix), {"level":3}, function(bot) {
				bot = self.bots[bot];
				var group = bot.group;

				return function(server, channel, msg) {
					var indx = 0;

					if (channel.isChannel) {
						//channel = server.Channels[msg.Parts[2]];

						var firstbot = Object.keys(self.bots)[0];
						while(!self.networks[server.alias].nickIsInChannel(self.bots[firstbot].Nick, msg.Parts[2]) && indx + 1 < Object.keys(self.bots).length) firstbot = Object.keys(self.bots)[++indx];

						if (bot.alias != firstbot) {
							return;
						}
					}

					var lines = [];
					console.log = Core.createLogWrapper(lines,  channel.Display);
					global.echo = console.log;

					eval(msg.Parts.splice(4).join(" "));

					console.log = console.tmp;
					delete global.echo;
					bot.sockets[server.alias].Write(lines);
				}
			}(botKey));


			self.bots[botKey].addCommand("login", {"allowpm":true},(function(bot) {
				bot = self.bots[bot];
				var group = bot.group;

				return function(server, channel, msg) { 
					if (self.attemptLogin(server, name, channel, msg)) {
						bot.say("Success! Logged in");
					}
					else {
						bot.say("Error! Invalid host/password/botgroup");
					}
				}
			})(botKey) );
		}
		for(var network in settings.Networks) {
			self.addNetwork(settings.Networks[network]);
		}
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

}
util.inherits(Bot, events.EventEmitter);
util.inherits(BotGroup, events.EventEmitter);
util.inherits(BotGroup, Commandable);

BotGroup.prototype.addBot = function(botOrName, options) {
		// createBot will call this function again once the bot is created.
		// We don't need to add the bot if we aren't passed one yet.
		if (!(botOrName instanceof Bot)) {
			botOrName = Core.createBot(botOrName, this.name, options);
		}
		else
		{
			this.bots[botOrName.alias] = botOrName;
		}

	}

module.exports = BotGroup;