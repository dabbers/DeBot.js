var events = require('events');
var util = require('util');
var irc = require('dabbit.base');
var socket = require('./NodeSocket');
var commandable = require('./Commandable');
var moduleHandler = require('./ModuleHandler');

function Bot(nick, group, settings) {
	irc.User.call(this);
	events.EventEmitter.call(this);

	var lastchan = "#lastchannel";
	var lastnet = "lastnetwork";

	moduleHandler(this);

	// We want to set our last net/chan stuff before the commandable interface
	// tries making calls out. So we register our onPrivmsg first.
	this.on('OnPrivmsg', function(serv, msg) {
		lastchan = (msg.To.Type == "Client" ? msg.From.Parts[0] : msg.To.Parts[0]);
		lastnet = serv.alias;
	});

	commandable.call(this);

	var self = this;
	var al = nick;

	this.sockets = {};

	this.__defineGetter__('alias', function(){
		return al;
	});

	this.__defineGetter__('group', function(){
		group.passer = self;
		return group;

	})

	this.tick = function() {
		for(var i in self.sockets) {
			self.sockets[i].tick();
		}
	}

	var usableSettings = (settings || group);

	this.Nick = usableSettings.Nick;
	this.Nicks = {};
	this.Ident = usableSettings.Ident;
	this.Name = Core.config.OwnerNicks + "'s bot";

	this.on("OnConnectionEstablished", function(server, msg) {
		for(var chan in usableSettings.Channels) {
			self.sockets[server.alias].Write("JOIN " + usableSettings.Channels[chan]);
		}
	});

	// NEVER call this function yourself. Use BotGroup's addNetwork function.
	this.connect = function(name, connectInfo) {
		if (!name) throw "Name is required (first param)";
		if (!connectInfo || !connectInfo.host) throw "connectInfo object is required. Keys: host (required), port (6667 default), ssl (false default)";

		self.sockets[name] = Core.context.CreateConnection(
			"Direct", 
			Core.context.CreateSocket(
				connectInfo.host, 
				connectInfo.port || 6667, 
				connectInfo.ssl || false
			)
		);
	}

	this.disconnect = function(name, quitmsg) {
		if (!name) throw "Name is required (first param)";

		self.sockets[name].Socket().Writer.write("QUIT :" + (quitmsg || "") + "\r\n");
	}

	this.settings = function() {
		return settings;
	}

	/*
	 * Either .say(message)
	 * Or     .say(channel, msg)
	 * or     .say(network, channel, msg)
	 */
	this.say = function(net, chan, msg) {
		if (!msg) {
			if (!chan) {
				msg = net;
				chan = lastchan;
				net = lastnet;
			}
			else {
				msg = chan;
				chan = net;
				net = lastnet;
			}
		}
		self.sockets[net].Write("PRIVMSG " + chan + " :" + msg);
	}

	/*
	 * Either .say(message)
	 * Or     .say(channel, msg)
	 * or     .say(network, channel, msg)
	 */
	this.notice = function(net, chan, msg) {
		if (!msg) {
			if (!chan) {
				msg = net;
				chan = lastchan;
				net = lastnet;
			}
			else {
				msg = chan;
				chan = net;
				net = lastnet;
			}
		}
		self.sockets[net].Write("NOTICE " + chan + " :" + msg);
	}

	/*
	 * Either .say(message)
	 * Or     .say(channel, msg)
	 * or     .say(network, channel, msg)
	 */
	this.raw = function(net, msg) {
		if (!msg) {
			msg = net;
			net = lastnet;
		}

		self.sockets[net].Write(msg);
	}

	this.me = function(net, chan, msg) {
		if (!msg) {
			if (!chan) {
				msg = net;
				chan = lastchan;
				net = lastnet;
			}
			else {
				msg = chan;
				chan = net;
				net = lastnet;
			}
		}

		self.say(net, chan, "\001ACTION " + msg + "\001");
	}

	/*
	 * Either .join(channel)
	 * Or 	  .join(channel, pass)
	 * Or 	  .join(net, channel)
	 * Or 	  .join(net, channel, pass)
	 */
	this.join = function(net, chan, pass) {
		// Check if pass provided because that means the other 2 aren't what they
		// are supposed to be if no pass is provided
		if (!pass) {

			// verify if net is actually a network
			if (!self.sockets[net]) {
				// net is a channel. Check if password provided
				if (chan) {
					pass = chan;
				}
				chan = net;
				net = lastnet;
			}
		}

		self.sockets[net].Write("JOIN " + chan + " " + pass);
	}

	/*
	 * Either .part(channel)
	 * Or 	  .part(channel, reason)
	 * Or 	  .part(net, channel)
	 * Or 	  .part(net, channel, reason)
	 */
	this.part = function(net, chan, reason) {
		// Check if reason provided because that means the other 2 aren't what they
		// are supposed to be if no reason is provided
		if (!reason) {

			// verify if net is actually a network
			if (!self.sockets[net]) {
				// net is a channel. Check if password provided
				if (chan) {
					reason = chan;
				}
				chan = net;
				net = lastnet;
			}
		}
		self.sockets[net].Write("PART " + chan + " :" + reason);
	}
}
util.inherits(Bot, 			  irc.User);
util.inherits(Bot, events.EventEmitter);


// Overwrite .emit to allow cancelling 
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
    args = new Array(len + 1);
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


module.exports = Bot;