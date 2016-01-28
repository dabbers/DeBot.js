var events = require('events');
var util = require('util');
var irc = require('dabbit.base');
var socket = require('./NodeSocket');
var commandable = require('./Commandable');
var moduleHandler = require('./ModuleHandler');
var ConnectionType = irc.ConnectionType;

function Bot(nick, group, settings) {
	this.isBot = true;
	
	var self = this;
	var al = nick;

	this.__defineGetter__('alias', function() {
		return al;
	});

	this.__defineGetter__('group', function() {
		group.passer = self;
		return group;
	});

	irc.User.call(this);
	events.EventEmitter.call(this);

	this.lastChannel = "#lastchannel";
	this.lastNetwork = "lastnetwork";

	moduleHandler(this);


	var lastChannelUpdate = function(serv, msg) {
		// If the destination is client, it is us meaning a PM. Use that as the reply instead of own bot.
		self.lastChannel = (msg.To ? (msg.To.Type == "Client" ? msg.From.Parts[0] : msg.To.Parts[0]) : msg.Parts[2]);
	}

	var lastNetworkUpdate = function(serv, msg) {
		self.lastNetwork = serv.alias;
	}

	// To let the scriptor have an easier time sending a message to the corresponding 
	// network/channel, 
	this.on('OnRawMessage', lastNetworkUpdate );

	this.on('OnJoin',       lastChannelUpdate );
	this.on('OnPart',       lastChannelUpdate );
	this.on('OnKick',       lastChannelUpdate );
	this.on('OnModeChange', lastChannelUpdate );
	this.on('OnInvite',     lastChannelUpdate );

	commandable.call(this);

	this.sockets = {};


	this.tick = function() {
		for(var i in self.sockets) {
			self.sockets[i].tick();
		}
	}

	var usableSettings = (settings || group);

	this.Nick = usableSettings.Nick;
	this.Hosts = {}; // Nick, Ident, Host for each network.
	this.Ident = usableSettings.Ident;
	this.Name = Core.config.OwnerNicks + "'s bot";

	for(var modIdx = 0; modIdx < usableSettings.Modules.length; modIdx++) {
		this.loadModule(usableSettings.Modules[modIdx]);
	}

	this.on("OnConnectionEstablished", function (server, msg) {
		for(var chan in usableSettings.Channels[server.alias]) {
			self.sockets[server.alias].Write("JOIN " + usableSettings.Channels[server.alias][chan]);
		}

		for(var cmd in usableSettings.Commands[server.alias]) {
			if (typeof usableSettings.Commands[server.alias][cmd] == "string") {
				self.sockets[server.alias].Write(usableSettings.Commands[server.alias][cmd]);
			}
			else if (usableSettings.Commands[server.alias][cmd].delay) {
				setTimeout(function(cmd) { return function() {
					self.sockets[server.alias].Write(cmd);
				}}(usableSettings.Commands[server.alias][cmd].command), usableSettings.Commands[server.alias][cmd].delay);
			}
		}
	});

	this.on("OnQueryCtcp", function (server, msg) {
		if (msg.Parts[3] == ":\001VERSION") {
			this.ctcp(msg.From.Parts[0], "NOTICE", "VERSION", "DeBot.js v" + Core.version);
		}
	});

	this.on("OnNewChannelJoin", function (server, msg) {
		// Is this channel already a channel the bot is trying to join?
		if (usableSettings.Channels[server.alias] && usableSettings.Channels[server.alias].filter(function (ch) { return ch == msg.Channel; }).length != 0 ) {
			return;
		}

		// If this was group requested, it would be saved in the settings before being dispursed to all the bots.
		var groupNetworkSetting = group.settings.Networks.filter(function (net) { return net.Network == server.alias; });
		if (groupNetworkSetting.length !=0 && groupNetworkSetting[0].Channels.filter(function (ch) { return ch == msg.Channel; }).length != 0) {
			return;
		}

		// It isn't a channel already joined, and isn't a channel being synced by the group, add it to our config.
		/// Not sure if the auto-save function will work with the above ^
		usableSettings.Channels[server.alias].push(msg.Channel);
		Core.config.save();
	});


	this.on("OnPart", function (server, msg) {
		if (msg.From.Parts[0] != self.Nick) {
			return;
		}

		for(var i = 0; i < usableSettings.Channels[server.alias].length; i++) {
			if (usableSettings.Channels[server.alias][i] == msg.Parts[2]) {
				Core.config.BotGroups[group.alias].Bots[self.alias].Channels[server.alias].splice(i,1);
				Core.config.save();
			}
		}
	});


	// NEVER call this function yourself. Use BotGroup's addNetwork function.
	this.connect = function(name, connectInfo) {
		if (!name) throw "Name is required (first param)";
		if (!connectInfo || !connectInfo.host) throw "connectInfo object is required. Keys: host (required), port (6667 default), ssl (false default)";

		// New network and/or new bot instance not yet saved to the config
		if (!usableSettings.Channels[name]) usableSettings.Channels[name] = [];

		self.sockets[name] = Core.context.CreateConnection(
			ConnectionType.Direct, 
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
		return usableSettings;
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
				chan = self.lastChannel;
				net = self.lastNetwork;
			}
			else {
				msg = chan;
				chan = net;
				net = self.lastNetwork;
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
				chan = self.lastChannel;
				net = self.lastNetwork;
			}
			else {
				msg = chan;
				chan = net;
				net = self.lastNetwork;
			}
		}
		self.raw(net, "NOTICE " + chan + " :" + msg);
	}

	/*
	 * Either .raw(message)
	 * or     .raw(network, msg)
	 */
	this.raw = function(net, msg) {
		if (!msg) {
			msg = net;
			net = self.lastNetwork;
		}

		self.sockets[net].Write(msg);
	}

	this.me = function(net, chan, msg) {
		if (!msg) {
			if (!chan) {
				msg = net;
				chan = self.lastChannel;
				net = self.lastNetwork;
			}
			else {
				msg = chan;
				chan = net;
				net = self.lastNetwork;
			}
		}

		self.ctcp(net, chan, "PRIVMSG", "ACTION", msg);
	}

	this.action = this.me;

	/*
	 * All parameters are required and cannot be assumed, minus network
	 */
	this.ctcp = function(net, destination, action, command, text) {
		if (!text) {
			text = command;
			command = action;
			action = destination;
			destination = net;
			net = self.lastNetwork;
		}

		self.raw(net, action + " " + destination + " :\001" + command + " " + text + "\001");
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
				chan = net || group.passer.lastChannel;
				net = group.passer.lastNetwork;
			}
		}

		self.raw(net, "JOIN " + chan + " " + pass);
	}

	/*
	 * Either .part()
	 * Or 	  .part(channel)
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
				chan = net || self.lastChannel;
				net = self.lastNetwork;
			}
		}

		self.raw(net, "PART " + chan + " :" + (reason|| "") );
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