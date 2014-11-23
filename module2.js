var DeBot = require('./Module');
module.exports = new (DeBot.module(function (bot) {
	bot.on("hi", function() { console.log("Hello from module2");});
}))();