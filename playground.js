var events = require('events');
var util = require('util');
global.Core = require('./core');

function Bot(nick) {
	events.EventEmitter.call(this);
	var self = this;

	var modules = {};

	this.LoadModule = function() {
		var module1 = require('./module1');
		var module2 = require('./module2');
		modules.module1 = module1;
		modules.module2 = module2;
		//module1 = new module1();
		module1.init(self);
		//module2 = new module2();
		module2.init(self);
	}

	this.UnloadModule = function() {
		modules.module1.uninit();
	}


	this.SayHi = function()
	{
		console.log("This is bot saying Hello");
	}
}
util.inherits(Bot,events.EventEmitter);
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
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      if (listeners[i].apply(this, args) === -1) break;

	  if (this.domain && this !== process)
	    this.domain.exit();
  }

  return true;
};


var bot = new Bot("hi");
console.log("PRE-Core value", Core.GetTesting());
Core.SetTesting(false);
console.log("Post-Core Value", Core.GetTesting());
bot.LoadModule();
console.log(bot.listeners("command_hi").length > 0);
bot.emit("hi");
bot.emit("hi");
bot.UnloadModule();
bot.emit("hi");