var DeBot = require('../core/Module');

module.exports = new (DeBot.module(function (bot) {
	bot.on("command_!hello", function(svr, msg) { 
		bot.say("Hello there " + msg.From.Parts[0] );

	});
}))();