var Bot = require('./Bot');
var util = require('util');
var Reflect = require('harmony-reflect');

function Module(callback) { 

	return function() {
		var fakebot = undefined;
		var self = this;
		this.init = function(realBot) {
			self.fakebot = new fakeBot(realBot, realBot.settings);
			self.fakebot = Proxy(self.fakebot, {
				// FIXME: don't know why I need to provide this method,
				// JS complains if getPropertyDescriptor is left out, or returns undefined
				// Apparently, this method is called twice: once for '_noSuchMethod_' and once for 'foo'
				get: function(rcvr, name) {

					if (name === '__noSuchMethod__') {
						return function(nm, args) {
							if (!nm || ! realBot[nm]) {
								return;

							}
							return realBot[nm].apply(realBot, args);
						};
					} else {
						return function() {
							var args = Array.prototype.slice.call(arguments);
							return this.__noSuchMethod__(name, args);
						}
					}
				}
			});
			callback(self.fakebot);
		}

		this.uninit = function() {
			self.fakebot.cleanupMethods();
		}
	};

};

exports.module = Module;

function fakeBot(realBot)
{
	this.RealBot = realBot; 
	var self = this;
	this.callbacks = [];

	this.on = function(event, cb) {
		self.callbacks.push({"event":event, "cb":cb});
		self.RealBot.on(event, cb);
		return self;
	}

	this.cleanupMethods = function() {
		self.callbacks.forEach(function(cb) { self.RealBot.removeListener(cb.event, cb.cb); } );
	}
}
util.inherits(fakeBot, Bot);