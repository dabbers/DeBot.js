var events = require('events');
var util = require('util');

function BotGroup(name, settings) {
	events.EventEmitter.call(this);

	var self = this;
	this.bots = {};

	this.passer = undefined;
	
	this.sendTick = function() {
		for(var i in self.bots) {
			self.bots[i].sendTick();
		}
	}

	this.__defineGetter__('events', function(){
		return self.passer || self.bots[0];
	})
}
util.inherits(Bot,events.EventEmitter);


/*
BotGroup : Commandable, Emitter
Bot[] +Bots
int +AddBot(Bot|string)
Network : Server, Emitter
{} +Settings
+DelGroup(BotGroup | string) Bot +CreateBot(string, {}) +DestroyBot(Bot|string)
BotGroup +Group
Bot +Controller string +Name
+DelBot(Bot|string)
{} +Settings
Network +AddNetwork(string, string, int, bool)
Module{} +Modules
Module +LoadModule(string, {}) +UnloadModule(Module | string)
+DelNetwork(Network | string

*/