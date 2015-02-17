var DeBot = require('../core/Module');

// When loaded as a group module, bot will be null.
module.exports = new (DeBot.module(function (bot, group) {
	if (bot) {
		throw "This module can only be used by a BotGroup";
	}

	var command_prefix = group.settings.CommandPrefix;

	// Command management:
	group.addCommand(
		command_prefix + "addcmd", 
		{"level":3, "timer":0, "persist":false}, 
		function(server, channel, msg) {
			bot = group.passer;

			if (channel.isChannel && !group.botIsExecutor(server.alias, bot.alias, channel)) {
				return;
			}
			var msgCopy = JSON.parse(JSON.stringify(msg));

			var cmd = (msg.Parts[4] || "").toLowerCase();
			var code = msgCopy.Parts.splice(5).join(" ");

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
				global.echo = Core.createLogWrapper(lines,  channel.Display);

				new Function(code);

				bot.sockets[server.alias].Write(lines);
			}
			catch(ex) {
				return bot.say("[Error] Syntax error in command: " + ex);
			}

			group.addCommand(cmd, function (cod) {
				return new Function("server", "channel", "msg", "bot", "group", "{\r\n" + 
"					if (!group.botIsExecutor(server.alias, bot.Nick, channel)) {\r\n" + 
"						return;\r\n" +
"					}\r\n\r\n" +
					
"					var lines = [];\r\n" + 
"					global.echo = Core.createLogWrapper(lines, channel.Display);\r\n\r\n" +
					cod + "\r\n\r\n" + 
"					bot.sockets[server.alias].Write(lines);\r\n" + 
"				}\r\n") 
			}(code));

			bot.say("[Success] " + cmd + " has been added");
		}
	);

	group.addCommand(
		command_prefix + "setcmd", 
		{"level":3, "timer":0, "persist":false},
		function(server, channel, msg) {
			bot = group.passer;

			if (channel.isChannel && !group.botIsExecutor(server.alias, bot.alias, channel)) {
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
				return bot.say("[Error] Command " + cmd + " does not exist");
			}

			if ("code" == key) {

				var msgCopy = JSON.parse(JSON.stringify(msg));

				var code = msgCopy.Parts.splice(6).join(" ");

				try {
					var fnc = new Function("server", "channel", "msg", "bot", "group", "{\r\n" + 
"					if (!group.botIsExecutor(server.alias, bot.Nick, channel)) {\r\n" + 
"						return;\r\n" +
"					}\r\n\r\n" +
					
"					var lines = [];\r\n" + 
"					global.echo = Core.createLogWrapper(lines, channel.Display);\r\n\r\n" +
					code + "\r\n\r\n" + 
"					bot.sockets[server.alias].Write(lines);\r\n" + 
"				}\r\n");
					group.setCommand(cmd, fnc);

					bot.say("[Success] " + cmd + "'s option " + key + " has been updated!");
				} catch( ex) {
					return bot.say("[Error] Couldn't update command's code. " + ex);
				}
			}
			else if ("locationbind" == key) {
				// ^([A-z*]+)[/]{0,1}((?<=/).*){0,1}$ matches server/mode#channel
				/*
				ggxy
				* /~#dab
				ggxy/#dab.beta
				ggxy/~#dab.beta
				ggxy/*#da*
				*/

				var action = msg.Parts[6].toLowerCase();
				switch(action) {
					case "list":
						var chanbinds = group.listServerbind(cmd);
						for(var i = 0; i < chanbinds.length; i++) {
							bot.say((i) + " " + chanbinds[i]);
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
						bot.say("[Error] Exception was not removed");
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
						bot.say("Use add to add an exception. Remove to remove an exception. List to view current exceptions.");
					break;
					default:
						bot.say("[Error] Exception was not removed");
					break;
				}
			}
			else {
				var opt = {};
				opt[key] = msg.Parts[6];
				if (group.setCommand(cmd, opt))
					bot.say("[Success] " + cmd + "'s option " + key + " has been updated!");
				else
					bot.say("[Error] " + cmd + "'s option " + key + " was not updated");
			}

		}
	);
	group.addCommand(
		command_prefix + "delcmd", 
		{"level":3, "timer":0, "persist":false}, 
		function(server, channel, msg) {
			bot = group.passer;

			if (channel.isChannel && !group.botIsExecutor(server.alias, bot.alias, channel)) {
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

			if (channel.isChannel && !group.botIsExecutor(server.alias, bot.alias, channel)) {
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