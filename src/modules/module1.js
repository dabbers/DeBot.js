var DeBot = require('../core/Module');

module.exports = new (DeBot.module(function (bot, group) {
	bot.addCommand("!hello", function(server, channel, msg) { 
		bot.say("Hello there " + msg.From.Parts[0] );
	});
}))();