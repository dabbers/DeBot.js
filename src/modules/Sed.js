var DeBot = require('../core/Module');


var _history = {};
var _bot = {};
var _group = {};
var _regx = new RegExp(/^s([^A-z0-9])(.*?)\1(.*?)\1(.*)*/);

function performSedThing(server, msg) {
	if (!_history[msg.Channel]) _history[msg.Channel] = [];


	var res = msg.MessageLine.match(_regx);
	if (res) {
		var rg = new RegExp(res[2]);
		for(var i = _history[msg.Channel].length - 1; i >= 0; i--) {
			if (rg.test(_history[msg.Channel][i])) {
				_bot.say(server.alias, msg.Channel, "<" + _history[msg.Channel][i].From.Parts[0] + "> " + _history[msg.Channel][i].MessageLine.replace(rg, res[3]));
				break;
			}
		}

		return;
	}

	if (_history[msg.Channel].length >= 50) _history[msg.Channel].shift();
	_history[msg.Channel].push(JSON.parse(JSON.stringify(msg)));
}

module.exports = new (DeBot.module(function (bot, group) {
	_bot = bot;
	_group = group;

	bot.on('OnChannelMessage', performSedThing);
}))();