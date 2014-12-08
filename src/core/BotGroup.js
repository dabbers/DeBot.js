var events = require('events');
var util = require('util');
var Bot = require('./Bot');
var Network = require('./Network');

function BotGroup(name, settings) {
	events.EventEmitter.call(this);

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
		for(var botKey in settings.Bots) {
			
			self.addBot(botKey, settings.Bots[botKey]);
			self.bots[botKey].on("OnConnectionEstablished", function(server, msg) {
				var bot = String(botKey);
				for(var chan in self.settings.Channels) {
					self.bots[bot].sockets[server.alias].Write("JOIN " + settings.Channels[chan]);
				}

			});

			self.bots[botKey].on("command_!!", function(bot) {
				
				bot = self.bots[bot];
				return function(server, msg) {
					var firstbot = Object.keys(self.bots)[0];

					if (self.networks[server.alias].isChannel(msg.Parts[2])) {

						if (bot.alias == firstbot || !self.networks[server.alias].nickIsInChannel(self.bots[firstbot].Nick, msg.Parts[2])) {
							console.tmp = console.log;
							var lines = [];
							console.log = function(line) {
								lines.push("PRIVMSG " + msg.Parts[2] + " :" + Object.values(arguments).join(" "));
							}

								eval(msg.Parts.splice(4).join(" "));


							
							console.log = console.tmp;
							bot.sockets[server.alias].Write(lines);

							return;
						}
					}
				}
			}(botKey)
			);
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
util.inherits(Bot,events.EventEmitter);

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