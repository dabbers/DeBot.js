var Group = require('./Group');
var Bot = require('./Bot');
var Config = require('./Config');

exports.bots = [];
exports.groups = {};
exports.settings = {};
exports.config = Config.load('../config.json');

exports.addGroup = function(groupName, settings) {
	return exports.Groups[groupName] = new Group(settings);
}

exports.delGroup = function(botOrGroupName) {
	delete exports.Groups[groupName];
}

exports.createBot = function(botName, settings) {
	var group = exports.groups[settings.group.name];
	if (!group) {
		group = exports.addGroup(botName);
	}
	else {
		group = exports.addGroup(settings.group.name, settings.group);
	}
	var bot = new Bot(settings);
	bot.group = group;
	group.addBot(bot);
}
	
exports.destroyBot = function(botOrBotName) {
	if (botOrBotName instanceof Bot) {
		botOrBotName.group.delBot(botOrBotName);

	}
}