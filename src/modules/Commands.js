var DeBot = require('../core/Module');

// When loaded as a group module, bot will be null.
module.exports = new (DeBot.module(function (bot, group) {
	if (bot) {
		throw "This module can only be used by a BoGroup";
	}

	var command_prefix = group.settings.CommandPrefix;

	// Command management:
	group.addCommand(
		command_prefix + "addcmd", 
		{"level":3, "timer":0, "persist":false}, 
		function(server, channel, msg) {
			bot = group.passer;

			if (channel.isChannel && !group.botIsExecutor(server.alias, bot.Nick, channel.Display)) {
				return;
			}

			var cmd = (msg.Parts[4] || "").toLowerCase();
			var code = msg.Parts.splice(5).join(" ");

			if (!cmd) {
				return bot.say("[Error] Please specify a command, or help");
			}

			if ("help" == cmd) {
				return bot.say("[Error] Help is a reserved word");
			}

			if (group.commands[cmd]) {
				return bot.say("[Error] " + cmd + " already exists");
			}
			// Attempt to validate the code without executing it.
			try {
				var lines = [];
				console.log = Core.createLogWrapper(lines,  channel.Display);
				global.echo = console.log;
				console.tmp("CODE", code);

				new Function(code);

				console.log = console.tmp;
				bot.sockets[server.alias].Write(lines);
			}
			catch(ex) {
				return bot.say("[Error] Syntax error in command: " + ex);
			}

			group.addCommand(cmd, function (botnick, cod) { 
				var bot = group.bots[botnick];

				return function(server, channel, msg) {
					if (channel.isChannel && !group.botIsExecutor(server.alias, bot.Nick, channel.Display)) {
						return;
					}
					
					var lines = [];
					console.log = Core.createLogWrapper(lines,  channel.Display);
					global.echo = console.log;

					eval(cod);

					console.log = console.tmp;
					bot.sockets[server.alias].Write(lines);
				}
			}(bot.Nick, code));

			bot.say("[Success] " + cmd + " has been added");
		}
	);

	group.addCommand(
		command_prefix + "setcmd", 
		{"level":3, "timer":0, "persist":false},
		function(server, channel, msg) {
			bot = group.passer;

			if (channel.isChannel && !group.botIsExecutor(server.alias, bot.Nick, channel.Display)) {
				return;
			}

			var cmd = (msg.Parts[4] || "").toLowerCase();
			var key = (msg.Parts[5] || "").toLowerCase();

			if (!cmd) {
				return bot.say("[Error] Please provide a valid command name");
			}

			if ("help" == cmd) {
				var keys = Object.keys(Core.defaultOptions).join(", ");

				if (!key || keys.indexOf(key) == -1) {
					bot.say("[Info] Possible command keys: " + keys);
					return bot.say("[Info] You can use setcmd help key for more info. For array based options, you can use list/delete/add");
				}

				var helpmsg = Core.defaultOptionsHelp[key];
				return bot.say("[Info] " + key + " help: " + helpmsg);
			}

			if (!group.commands[cmd]) {
				return bot.say("[Error] Command does not exist");
			}
/*
	"channelbind" : [],
	"serverbind" : [],
	"exception": [],
	*/
			if ("code" == key) {
				var code = msg.Parts.splice(6).join(" ");

				group.setCommand(cmd, function (botnick) { 
				var bot = group.bots[botnick];

				return function(server, channel, msg) {
						if (channel.isChannel && !group.botIsExecutor(server.alias, bot.Nick, channel.Display)) {
							return;
						}
						var lines = [];
						console.log = Core.createLogWrapper(lines,  channel.Display);
						global.echo = console.log;

						eval(msg.Parts.splice(4).join(" "));

						console.log = console.tmp;
						bot.sockets[server.alias].Write(lines);
					}
				}(bot.Nick));

				bot.say("[Success] " + cmd + "'s option " + key + " has been updated!");
			}
			else if ("serverbind" == key) {
				var action = msg.Parts[6].toLowerCase();
				switch(action) {
					case "list":
						var chanbinds = group.listServerbind(cmd);
						for(var i = 0; i < chanbinds.length; i++) {
							bot.say((i+1) + " " + chanbinds[i]);
						}
					break;
					case "add":
						var value = msg.Parts[7].toLowerCase();


						if (group.addServerbind(cmd, value)) {
							bot.say("[Success] Serverbind added");
						}
						else {
							bot.say("[Error] Serverbind was not added");
						}

					break;
					case "remove":
					case "delete":
						var value = msg.Parts[7].toLowerCase();
						if (group.removeServerbind(cmd, value)) {
							bot.say("[Success] Serverbind removed");
						}
						else {
							bot.say("[Error] Serverbind was not removed");
						}
					break;
					case "help":

					break;
					default:
							bot.say("[Error] Exception was not removed");
					break;

				}
			}
			else if ("exception" == key) {
				var action = (msg.Parts[6] || "").toLowerCase();
				switch(action) {
					case "list":
						var chanbinds = group.listException(cmd);
						for(var i = 0; i < chanbinds.length; i++) {
							bot.say((i+1) + " " + chanbinds[i]);
						}
					break;
					case "add":
						// Possible exception inputs: 
						//mode:seconds (ie: @:4), level:seconds (ie: 1:5), nick:2 (ie: nick:sec or [*!*@*]:5), and #channel:sec
						// "exception": {"channels":[], "users":[], "chanmodes":[], "levels":[] },
						var value = msg.Parts[7].toLowerCase();
						if (group.addException(cmd, value)) {
							bot.say("[Success] Serverbind added");
						}
						else {
							bot.say("[Error] Serverbind was not added");
						}
					break;
					case "remove":
					case "delete":
						var value = msg.Parts[7].toLowerCase();
						if (group.removeException(cmd, value)) {
							bot.say("[Success] Exception removed");
						}
						else {
							bot.say("[Error] Exception was not removed");
						}
					break;
					case "help":

					break;
					default:
							bot.say("[Error] Exception was not removed");
					break;
				}
			}
			else {
				var opt = {};
				opt[key] = msg.Parts[6];
				group.setCommand(cmd, opt);

				bot.say("[Success] " + cmd + "'s option " + key + " has been updated!");
			}

		}
	);
	group.addCommand(
		command_prefix + "delcmd", 
		{"level":3, "timer":0, "persist":false}, 
		function(server, channel, msg) {
			bot = group.passer;

			if (channel.isChannel && !group.botIsExecutor(server.alias, bot.Nick, channel.Display)) {
				return;
			}

			var cmd = (msg.Parts[4] || "").toLowerCase();

			if (!cmd) {
				return bot.say("[Error] You need to specify a command to delete");
			}

			if (!group.commands[cmd]) {
				return bot.say("[Error] " + cmd + " does not exist");
			}

			group.delCommand(cmd);

			bot.say("[Success] " + cmd + " has been deleted");

		}
	);
	group.addCommand(
		command_prefix + "getcmd", 
		{"level":3, "timer":0, "persist":false}, 
		function(server, channel, msg) {
			bot = group.passer;

			if (channel.isChannel && !group.botIsExecutor(server.alias, bot.Nick, channel.Display)) {
				return;
			}

			var cmd = (msg.Parts[4] || "").toLowerCase();
			var key = (msg.Parts[5] || "").toLowerCase();

			if (!cmd) {
				return bot.say("[Error] Please provide a valid command name");
			}

			if ("help" == cmd) {
				var keys = Object.keys(Core.defaultOptions).join(", ");

				if (!key || keys.indexOf(key) == -1) {
					bot.say("[Info] Possible command keys: " + keys);
					return bot.say("[Info] You can use setcmd help key for more info.");
				}

				var helpmsg = Core.defaultOptionsHelp[key];
				return bot.say("[Info] " + key + " help: " + helpmsg);
			}
		}
	);
}))();