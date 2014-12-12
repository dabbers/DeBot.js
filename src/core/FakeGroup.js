/*** THIS FILE HAS BEEN AUTO-GENERATED. ANY MODIFICATIONS TO THIS FILE MAY BE LOST ***/
var util = require('util');
var fakeEventsEmitter = require('./FakeEventsEmitter');
var reflect = require('harmony-reflect');

function fakeGroup(realGroup) {
	this.realGroup = realGroup;
	fakeEventsEmitter.call(this);
}
util.inherits(fakeGroup, fakeEventsEmitter);

function createFakeGroup(realGroup) {
	var tmpgroup = new fakeGroup(realGroup);
	var commandsToRemove = [];
	var newbots = {};
	var self = this;

	return Proxy(tmpbot, {
		get:function(proxy, name) {
			if ("addCommand" == name) {
				return function(cmdName, options, fn) {
					realGroup.addCommand(cmdName, options, fn);
					commandsToRemove.push(cmdName);
				}
			}
			else if ("cleanupMethods" == name) {
				return function() {
					tmpbot.cleanupMethods();
					for(var i = 0; i < commandsToRemove.length; i++) {
						realGroup.delCommand(commandsToRemove[i]);
					}
				}
			}
			else if ("on" == name) {
				return tmpbot.on;
			}
			else if ("bot" == name) {
				for(var i in realGroup.bots) {
					// prevent overwriting old bots that might have had 
					if (!newbots[i])
						newbots[i] = fakeBot(realGroup.bots[i], self);
				}
				for(var i in newbots) {
					if (!realGroup.bots[i]) {
						delete newbots[i];
					}
				}
				return newbots;
			}
			else {
				return realGroup[name];
			}
		}
	});
}
module.exports = createFakeGroup;
