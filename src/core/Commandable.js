var Command = require('./Command');
var path = require('path');
var fs = require('fs');

function Commandable() {
	var self = this;
	this.commands = {};
	this.loggedin = {};
	var isDirty = false;

	var storagePath = "storage";
	// Determine if botgroup, or bot
	if (this.isBot) {
		// bot
		storagePath = path.join(storagePath, self.group.alias);

		if (!fs.existsSync(storagePath)) {
			fs.mkdirSync(storagePath);
		}
	}

	storagePath = path.join(storagePath, self.alias);
	if (!fs.existsSync(storagePath)) {
		fs.mkdirSync(storagePath);
	}

	storagePath = path.join(storagePath, "commands.json");
	storagePath = Core.relativeToAbsolute(storagePath);

	this.on('tick', function() {
		if (isDirty) {
			var cmds = {};

			for(var i in self.commands) {
				if (self.commands[i].options.persist) {
					cmds[i] = {};
				    for (var attr in self.commands[i]) {
				    	console.tmp(attr);
        				if (self.commands[i].hasOwnProperty(attr)) cmds[i][attr] = self.commands[i][attr];
					}

					cmds[i].callback = cmds[i].callback.toString();
				}
			}


			fs.writeFile(storagePath, JSON.stringify(cmds, null, 4), function (err) {
				if (err) {
					console.log("[Commandable.js] There was an issue saving the config: ", err);
				}
				
			});

			isDirty = false;
		}
	});

	// Can't always tell who sent this function call. In BotGroup multiple bots could execute this call.
	this.functionCanExecute = function(server, command, message) {
		var timerOverridden = false;
		
		console.tmp("fce", 1);
		var curdate = message.Timestamp.getTime();

		console.log(command);

		// Check for channel exceptions
		for(var i = 0; i < command.exceptions.channels.length; i++) {
			if (i == message.To.Parts[0]) {
				timerOverridden = true;

				if (curdate - command.exceptions.channels[i].time < command.options.timer) {
					return false;
				}
				command.exceptions.channels[i].time = new Date().getTime();
				break;
			}
		}
		console.tmp("fce", 2);
		// Check for channel exceptions
		for(var i = 0; i < command.exceptions.users.length; i++) {
			if (i.test(message.Parts[0])) {
				timerOverridden = true;

				if (new Date().getTime() - command.exceptions.users[i].time < command.options.timer) {
					return false;
				}
				command.exceptions.users[i].time = new Date().getTime();
				break;
			}
		}

		var diff = curdate - command.time;
		console.tmp("fce", 3, diff, command.options.timer);		
		if (command.options.timer != 0 && !timerOverridden && diff <= command.options.timer) {
		console.tmp("fce", message.Parts[3], 1);
		console.tmp("fce", message.Parts[4]);
		console.tmp("fce", message.From.Parts[0]);
		console.tmp("fce", command.options);
			return false;
		}
		console.tmp("fce", 4);
		var level = 1;
		if (self.loggedin[server.alias] && self.loggedin[server.alias][message.From.Parts[0]]) {
			level = self.loggedin[server.alias][message.From.Parts[0]].level;
		}
		console.tmp("fce", 5);
		if (command.options.level > level) {
			return false;
		}
		console.tmp("fce", 6);


		command.time = curdate;
		return true;
	}


	if (this.on) {
		this.on("OnPrivmsg", function(server, msg, sender) {
			var cmd = msg.Parts[3].substring(1).toLowerCase();

			if (self.commands[cmd] && this.functionCanExecute(server, self.commands[cmd], msg)) {
				var lines = [];
				var channel = server.isChannel(msg.To.Parts[0]) ? 
					server.Channels[msg.To.Parts[0]] : 
					{"isChannel":false, "Display":msg.From.Parts[0], "Parts":["", "", msg.To.Parts[0]]};

				global.echo = Core.createLogWrapper(lines,  channel.Display);
				
				var bot = self;
				var group = self;
				if (!bot.isBot) {
					bot = group.getBotExecutor(server.alias, group.passer.Nick, channel.Display);
				}
				else {
					group = self.group;
				}

				self.commands[cmd].callback(server, channel, msg, bot, group);

				bot.sockets[server.alias].Write(lines);
			}

		});
	}

	this.addCommand = function(string, options, fn) {
		if (!fn) {
			fn = options;
			options = JSON.parse(JSON.stringify(Core.defaultOptions));;
		}
		string = string.toLowerCase();

		if (typeof fn != "function") {
			throw {"message":"Invalid data type passed for function parameter.", "stack":new Error().stack};
		}
		var defaultopt = JSON.parse(JSON.stringify(Core.defaultOptions));

		for(var key in defaultopt) {

			if (defaultopt.hasOwnProperty(key) && undefined === options[key]) 
				options[key] = defaultopt[key];
		} 

		options["timer"] = options["timer"] * 1000;
		if (options["persist"]) {
			isDirty = true;
		}

		self.commands[string] = { 
			"command":string,
			"options":options,
			"time":0,
			"exceptions":{"type":"blacklist", "channels":{}, "users":{}, "chanmodes":{}, },
			"callback":fn
		};
	}

	this.setCommand = function(string, options, fn) {
		if ("function" == typeof options) {
			fn = options;
			options = {};
		}
		string = string.toLowerCase();

		// merge user supplied options to our command
		for(var i in options) {
			if (options.hasOwnProperty(i) && self.commands[string].options[i]) {
				self.commands[string].options[i] = options[i];
			}
		}

		if (options["timer"])
			self.commands[string].options["timer"] *= 1000;

		if (fn) {
			self.commands[string].callback = fn;
		}

		self.commands[string].time = 0;
	}

	this.delCommand = function(string) {
		string = string.toLowerCase();
		if (self.commands[string]) {
			delete self.commands[string];
			isDirty = true;
		}
	}

	this.addException = function(string, on, to) {
		var exceptionEntry = {
			"type":"", // channel, user, chanmode
			"time":0
		};
		string = string.toLowerCase();
		return true;
	}

	this.listExceptions = function(string) {

	}

	this.removeException = function(string, on) {

		return true;
	}

	this.addChanbind = function(string, on, to) {
		var exceptionEntry = {
			"type":"", // channel, user, chanmode
			"time":0
		};
		string = string.toLowerCase();
		return true;
	}

	this.listChanbind = function(string) {

	}

	this.removeChanbind = function(string, on) {

		return true;
	}

	this.addServerbind = function(string, on, to) {
		var exceptionEntry = {
			"type":"", // channel, user, chanmode
			"time":0
		};
		string = string.toLowerCase();
		return true;
	}

	this.listServerbind = function(string) {

	}

	this.removeServerbind = function(string, on) {

		return true;
	}

	var USER_REGEX = /[!@]/;

	this.attemptLogin = function(server, groupname, channel, msg) {
		var indx = 0;
		if (!self.networks[server.alias].isChannel(msg.Parts[2])) {
			var auths = Core.config.Auth;

			for(var i = 0; i < auths.length; i++) {
				if (auths[i].BotGroup) {
					if (auths[i].BotGroup.indexOf(groupname) == -1) {
						continue;
					}
				}

				var parts = auths[i].login.replace(/\./g,"\\.").replace(/\*/g, ".*").split(USER_REGEX);

				if (new RegExp(parts[0]).test(msg.From.Parts[0]) && new RegExp(parts[1]).test(msg.From.Parts[1]) &&
						new RegExp(parts[2]).test(msg.From.Parts[2])) {
					
					eval("function enc(pw) " + auths[i].encryption);
					
					if (enc(msg.Parts[4]) == auths[i].password) {
						if (!self.loggedin[server.alias]) self.loggedin[server.alias] = {}

						self.loggedin[server.alias][msg.From.Parts[0]] = {"nick":msg.From.Parts[0], "level":auths[i].level};
						return true;
					}
				}
			}
		}

		return false;
	}

	fs.readFile(storagePath, {"encoding":"utf8"}, function (err, data) {
		var svrs = JSON.parse(data);
		console.log(svrs);
		for(var i in svrs) {
			self.commands[i] = svrs[i];
			var newcallback = self.commands[i].callback.replace(/function\s*[A-z\-0-9]*\(\s*(server\s*,\s*channel\s*,\s*msg\s*)*\)\s*{(.*)\s*}/, "$2");
			self.commands[i].callback = new Function(['server', 'channel', 'msg', 'bot', 'group'], newcallback);
		}
	});
}

/*
Command{} +Commands 
Command +AddCommand(string, {}, fn) 
+DelCommand(Command | string) 
Commandable +SetCommand(string, {}, fn)
*/

module.exports = Commandable;