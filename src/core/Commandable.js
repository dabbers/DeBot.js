var Command = require('./Command');

var defaultOptions = {
	"channelbind" : [],
	"serverbind" : [],
	"level" : 1,
	"allowpm" : false,
	"hidden" : false,
	"exception": [],
	"timer":5, // 5 seconds between command calls.
	"code": function() { }
};

function Commandable() {
	var self = this;
	this.commands = {};
	this.loggedin = {};


	// Can't always tell who sent this function call. In BotGroup multiple bots could execute this call.
	this.functionCanExecute = function(server, command, message) {
		var timerOverridden = false;
		
console.log(1);
		
		// Check for channel exceptions
		for(var i = 0; i < command.exceptions.channels.length; i++) {
			if (i == message.To.Parts[0]) {
				timerOverridden = true;

				if (new Date().getTime() - command.exceptions.channels[i].time < command.options.timer) {
					return false;
				}
				command.exceptions.channels[i].time = new Date().getTime();
				break;
			}
		}
console.log(2);
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
console.log(3);		
		if (command.options.timer != 0 && !timerOverridden && new Date().getTime() - command.time <= command.options.timer) {
			return false;
		}
console.log(4);
		var level = 1;
		if (self.loggedin[server.alias] && self.loggedin[server.alias][message.From.Parts[0]]) {
			level = self.loggedin[server.alias][message.From.Parts[0]].level;
		}
console.log(5);
		if (command.options.level > level) {
			return false;
		}
console.log(6);


		command.time = new Date().getTime();
		return true;
	}


	if (this.on) {
		this.on("OnPrivmsg", function(server, msg) {
			var cmd = msg.Parts[3].substring(1);

			if (self.commands[cmd] && this.functionCanExecute(server, self.commands[cmd], msg)) {
				self.commands[cmd].callback(server, server.isChannel(msg.To.Parts[0]) ? server.Channels[msg.To.Parts[0]] : {"isChannel":false, "Display":msg.From.Parts[0], "Parts":["", "", msg.To.Parts[0]]}, msg);
			}

		});
	}

	this.addCommand = function(string, options, fn) {

		if (!fn) {
			fn = options;
			options = defaultOptions;
		}

		if (typeof fn != "function") {
			throw {"message":"Invalid data type passed for function parameter.", "stack":new Error().stack};
		}

		for(var key in defaultOptions) {
			if (!options[key]) options[key] = defaultOptions[key];
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

		// merge user supplied options to our command
		for(var i in options) {
			if (options.hasOwnProperty(i) && self.commands[string].options[i]) {
				self.commands[string].options[i] = options[i];
			}
		}

		if (fn) {
			self.commands[string].callback = fn;
		}

		self.commands[string].time = 0;
	}

	this.delCommand = function(string) {
		if (self.commands[string])
			delete self.commands[string];
	}

	this.addException = function(string, on, to) {
		var exceptionEntry = {
			"type":"", // channel, user, chanmode
			"time":0
		};
	}

	this.listExceptions = function(string) {

	}

	this.removeException = function(string, on) {

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
					console.log(self.loggedin);
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