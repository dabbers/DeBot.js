var DeBot = require('../core/Module');
module.exports = new (DeBot.module(function (bot) {
	bot.on("OnNewChannelJoin", function(svr, msg) { console.log(bot.alias, msg);});
}))();