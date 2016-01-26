/*** THIS FILE HAS BEEN AUTO-GENERATED. ANY MODIFICATIONS TO THIS FILE MAY BE LOST ***/
var util = require('util');
var fakeEventsEmitter = require('./FakeEventsEmitter');
var reflect = require('harmony-reflect');
var fakeBot = require('./FakeBot');

function fakeGroup(realGroup) {
	this.realGroup = realGroup;
	fakeEventsEmitter.call(this);
}
util.inherits(fakeGroup, fakeEventsEmitter);

function createFakeGroup(realGroup) {
	var tmpgroup = new fakeGroup(realGroup);
	var commandsToRemove = [];
	var callbacksToRemove = [];
	var newbots = {};
	var self = this;

	return Proxy(tmpgroup, {
		get:function(proxy, name) {
			if ("addCommand" == name) {
				return function(cmdName, options, fn) {
					realGroup.addCommand(cmdName, options, fn);
					commandsToRemove.push(cmdName);
				}
			}
			else if ("cleanupMethods" == name) {
				return function() {
					callbacksToRemove.forEach(function(cb) { realGroup.removeListener(cb.event, cb.cb); } );
					for(var i = 0; i < commandsToRemove.length; i++) {
						realGroup.delCommand(commandsToRemove[i]);
					}
				}
			}
			else if ("on" == name) {
				return function(evnt, fnc) { 
					realGroup.on(evnt, fnc); 
					callbacksToRemove.push({"event":evnt, "cb":fnc});
					return fakeBot;
				};
			}
			else if ("bots" == name) {
				for(var i in realGroup.bots) {
					// prevent overwriting old bots that might have callbacks created
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
