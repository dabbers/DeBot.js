var Group = require('./BotGroup');
var Bot = require('./Bot');
var Config = require('./Config');
var path = require('path');
var contx = require('./NodeContext');

console.tmp = console.log;

function Core() {

}
Core.prototype.context = new contx();
Core.prototype.bots = [];
Core.prototype.groups = {};
Core.prototype.settings = {};
Core.prototype.config = undefined; 

Core.prototype.defaultGroupSetting = {"Networks":[], "Bots":{}, "Channels":[], "Modules":[], "CommandPrefix":"!"};
Core.prototype.defaultBotSetting = {"Ident":"dbt", "Networks":[], "Bots":{}, "Channels":[], "Modules":[]};

Core.prototype.addGroup = function(groupName, settings) {
	for(var key in this.defaultGroupSetting) {
		if (!settings[key]) settings[key] = this.defaultGroupSetting[key];
	}
	var grp = new Group(groupName, settings);
	this.groups[groupName] = grp;
	grp.init();
	return grp;
}

Core.prototype.delGroup = function(botOrGroupName) {
	delete this.groups[groupName];
}

// Possible inputs:
// string, string, {} name, group, settings   (defaults merged to unset)
// string, string     name, group    		  (default bot settings)
// string, {}         name, settings          (group is name with default group settings)
// string			  name                    (group is name with default group settings, settings is bot default)
Core.prototype.createBot = function(botName, groupName, settings) {
	var group = this.groups[groupName];

	// If we didn't specify a groupName, see if we need to make a group
	// named after the bot. Weird scenario if we don't really.
	if (!settings) {
		if ("string" == typeof groupName) {
			settings = this.defaultBotSetting;
		}
		else
		{
			settings = groupName || this.defaultBotSetting;
			groupName = botName;
		}
	}

	if (!settings["Nick"]) {
		settings.Nick = botName;
	}

	for(var key in this.defaultBotSetting) {
		if (!settings[key]) settings[key] = this.defaultBotSetting[key];
	}

	// Check if group is undefined, if so, create an empty group.
	if (!group) {
		group = this.addGroup(groupName, this.defaultGroupSetting);
	}

	var bot = new Bot(botName, group, settings);
	this.bots[botName] = bot;
	group.addBot(bot);
}
	
Core.prototype.destroyBot = function(botOrBotName) {
	if (botOrBotName instanceof Bot) {
		botOrBotName.group.delBot(botOrBotName);
	}
}

Core.prototype.relativeToAbsolute = function(pathOrFile) {
	return path.join(__dirname, "../", pathOrFile);
}

Core.prototype.init = function(configPath) {
	this.config = Config.load( this.relativeToAbsolute(configPath) );

	var botgroups = this.config.BotGroups;

	for(var botgroup in botgroups) {
		this.addGroup(botgroup, botgroups[botgroup]);
	}
}

// Expects an array of strings in host:+port format (+ and :port optional)
Core.prototype.setNetwork = function(name, connectionStrings) {
	this.config.Networks[name] = connectionStrings;
}

Core.prototype.randomServer = function(name) {
	var ran = this.config.Networks[name][Math.floor((Math.random() * this.config.Networks[name].length))];
	var parts = ran.split(':');
	
	var port = (parts[1] ? (parts[1][0] == "+" ? parts[1].substring(1) : parts[1]) : 6667);

	var ssl = (parts[1] ? (parts[1].length !== port.length) : false);;

	return {"host":parts[0], "port":port, "ssl":ssl };
}

Core.prototype.tick = function() {
	for(var group in this.groups) {
		this.groups[group].tick();
	}
}

Core.prototype.createLogWrapper = function(lineRef, channel) {
	return function(lines, chann) {
		return function () {
			var ar = Object.values(arguments);
			for(var i = 0; i < ar.length; i++) {
				var stringified = (ar[i] || "undefined").toString().replace(/\r/g, "");

				if (stringified.indexOf("\n") != -1) {
					stringified.split("\n").map(function(k) { return lines.push("PRIVMSG " + chann + " :" + k); });

				}
				else {
					lines.push("PRIVMSG " + chann + " :" + ar[i]);
				}
			}
			
		}
	}(lineRef, channel);
}

// The compliment to Object.keys
Object.values = function(obj) { return Object.keys(obj).map(function (key) { return obj[key];});}

//var process = require('process');

module.exports = new Core();