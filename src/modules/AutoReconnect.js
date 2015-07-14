var DeBot = require('../core/Module');

// When loaded as a group module, bot will be null.
module.exports = new (DeBot.module(function (bot, group) {
	if (!bot) {
		throw "This module can only be used by a Bot";
	}
	var lastPongs = {};

	bot.on('OnPong', function(svr, msg) {
		lastPongs[svr.alias] = new Date().getTime();
	});

	bot.on('OnError', function(svr, msg) {
		attemptRetry(bot, { "network": svr.alias, "host": bot.sockets[svr.alias].Host, "port": bot.sockets[svr.alias].Port, "ssl": bot.sockets[svr.alias].Secure, "attempts": 1});
	});

	/*setInterval(function() {
		var now = new Date().getTime();

		for(var i in bot.sockets) {
			if (lastPongs[i] && lastPongs[i] - now > 100000) {
				setImmediate(attemptRetry, bot, { "network":i, "host": bot.sockets[i].Host, "port": bot.sockets[i].Port, "ssl": bot.sockets[i].Secure, "attempts": 1});
			}

			bot.raw(i, "PING :debot.js")
		}
		
	}, 50000); // Every 50 seconds send a ping request to check for any connection loss.*/
}))();


function attemptRetry(bot, network) {
	try {
		bot.connect(network.network, network);
	}
	catch (ex) {
		network.attempts++;
		if (network.attempts < 3) {
			setTimeout(attemptRetry, (15000 * network.attempts), bot, network); // Reconnect 15 seconds increasing each try
		}
	}
}