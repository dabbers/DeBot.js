/*** THIS FILE HAS BEEN AUTO-GENERATED. ANY MODIFICATIONS TO THIS FILE MAY BE LOST ***/
var fakeEventsEmitter = require('./FakeEventsEmitter');
var util = require('util');
var reflect = require('harmony-reflect');

function fakeBot(realBot, fakeGrup) {
	this.realBot = realBot;
}

function createFakeBot(realBot) {
	var tmpbot = new fakeBot(realBot);
	var commandsToRemove = [];
	var callbacksToRemove = [];

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
					callbacksToRemove.forEach(function(cb) { realBot.removeListener(cb.event, cb.cb); } );
					
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
				return function(evnt, fnc) { 
					realBot.on(evnt, fnc); 
					callbacksToRemove.push({"event":evnt, "cb":fnc});
					return fakeBot;
				};
			}
			else {
				return realBot[name];
			}
		}
	});
}
module.exports = createFakeBot;