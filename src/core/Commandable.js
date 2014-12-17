var Command = require('./Command');

function Commandable() {
	var self = this;
	this.commands = {};
	this.loggedin = {};


	// Can't always tell who sent this function call. In BotGroup multiple bots could execute this call.
	this.functionCanExecute = function(server, command, message) {
		var timerOverridden = false;
		
console.tmp("fce", 1);
		var curdate = message.Timestamp.getTime();
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
		this.on("OnPrivmsg", function(server, msg) {
			var cmd = msg.Parts[3].substring(1).toLowerCase();

			if (self.commands[cmd] && this.functionCanExecute(server, self.commands[cmd], msg)) {
				self.commands[cmd].callback(server, server.isChannel(msg.To.Parts[0]) ? server.Channels[msg.To.Parts[0]] : {"isChannel":false, "Display":msg.From.Parts[0], "Parts":["", "", msg.To.Parts[0]]}, msg);
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
		if (self.commands[string])
			delete self.commands[string];
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
}

/*
Command{} +Commands 
Command +AddCommand(string, {}, fn) 
+DelCommand(Command | string) 
Commandable +SetCommand(string, {}, fn)
*/

module.exports = Commandable;