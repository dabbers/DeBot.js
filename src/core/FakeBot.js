/*** THIS FILE HAS BEEN AUTO-GENERATED. ANY MODIFICATIONS TO THIS FILE MAY BE LOST ***/
var fakeEventsEmitter = require('./FakeEventsEmitter');
var util = require('util');
var reflect = require('harmony-reflect');

function fakeBot(realBot, fakeGrup) {
	this.realBot = realBot;
	fakeEventsEmitter.call(this);
}
util.inherits(fakeBot, fakeEventsEmitter);

function createFakeBot(realBot) {
	var tmpbot = new fakeBot(realBot);
	var commandsToRemove = [];

	return Proxy(tmpbot, {
		get:function(proxy, name) {
			console.tmp("PROXYBOT ", name);

			if ("addCommand" == name) {
				return function(cmdName, options, fn) {
					realBot.addCommand(cmdName, options, fn);
					commandsToRemove.push(cmdName);
				}
			}
			else if ("cleanupMethods" == name) {
				return function() {
					tmpbot.cleanupMethods();
					for(var i = 0; i < commandsToRemove.length; i++) {
						realBot.delCommand(commandsToRemove[i]);
					}
				}
			}
			else if ("group" == name) {
				fakeGrup.passer = realBot;
				return fakeGrup;
			}
			else if ("on" == name) {
				return tmpbot.on;
			}
			else {
				return realBot[name];
			}
		}
	});
}
module.exports = createFakeBot;