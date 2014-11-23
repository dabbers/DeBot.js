var DeBot = require('./Module');

module.exports = new (DeBot.module(function (bot) {
	bot.on("hi", function() { 
		console.log("Hello from module1"); 
		bot.on("hi", function() { 
			console.log("Hello2 from module1");
			console.log("Core value", Core.GetTesting());
		});

	});
	bot.SayHi();
}))();