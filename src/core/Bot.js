var events = require('events');
var util = require('util');
var irc = require('irc');

function Bot(nick, group, settings) {
	events.EventEmitter.call(this);
	irc.User.call(this);

	var self = this;

	var modules = {};
	this.sockets = [];

	this.loadModule = function(modname) {
		try {
			var module1 = require('../modules/' + modname);
			modules[modname] = module1;
			module1.init(self);
		}
		catch(ex) {
			console.log("Failed to load module. ", ex);
			return false;
		}

		return modules[modname];
	}

	this.unloadModule = function(modname) {
		if (modules[modname]) {
			modules[modname].uninit();
			delete modules[modname];
		}
	}

	this.__defineGetter__('group', function(){
		group.passer = self;
		return group;

	})

	this.sendTick = function() {
		for(var i in self.sockets) {
			self.sockets[i].sendTick();
		}
	}
}
util.inherits(Bot, events.EventEmitter);
util.inherits(Bot, 			  irc.User);

Bot.prototype.base_emit = Bot.prototype.emit;
Bot.prototype.emit = function emit(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  if (type == "error") {
  	return this.base_emit.apply(this, arguments);
  }

  handler = this._events[type];

  if (!handler)
    return false;

  if (typeof handler === 'function') {
  	return this.base_emit.apply(this, arguments);
  } else if (typeof handler === 'object') {
	if (this.domain && this !== process)
	    this.domain.enter();

    len = arguments.length;
    args = new Array(len);
    var e = {"handled":false};

    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

  	args[len] = e;

    listeners = handler.slice();
    len = listeners.length;

    for (i = 0; i < len; i++) {
    	listeners[i].apply(this, args);
    	if (e.handled) break;
    }

	  if (this.domain && this !== process)
	    this.domain.exit();
  }

  return true;
};

function fakeBot(realBot)
{
	Bot.call(this);

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
	this.__noSuchMethod__ = function(methName, args) {
		try
		{
  			return self.RealBot[methName].call(self.RealBot, args);	
		}
		catch(ex)
		{
			console.log("Exception caught", ex);
		}
	};
}
fakeBot.prototype = Object.create(NoSuchMethodTrap);
util.inherits(fakeBot, Bot);