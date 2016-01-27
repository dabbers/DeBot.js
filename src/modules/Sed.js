var DeBot = require('../core/Module');


var _history = {};
var _bot = {};
var _group = {};
var _regx = new RegExp(/^s([^A-z0-9])(.*?)\1(.*?)\1(.*)*/);

function performSedThing(server, msg) {

	if (!_history[msg.To.Parts[0]]) _history[msg.To.Parts[0]] = [];

	try {
		var res = msg.MessageLine.match(_regx);

		if (res) {
			var rg = new RegExp(res[2]);
			for(var i = _history[msg.To.Parts[0]].length - 1; i >= 0; i--) {
				if (rg.test(_history[msg.To.Parts[0]][i].MessageLine)) {
					_bot.say(server.alias, msg.To.Parts[0], "<" + _history[msg.To.Parts[0]][i].From.Parts[0] + "> " + _history[msg.To.Parts[0]][i].MessageLine.replace(rg, res[3]));
					break;
				}
			}

			return;
		}
	}
	catch(ex) {
		_bot.say(server.alias, msg.To.Parts[0], "[Sed Error] " + ex);
	}

	if (_history[msg.To.Parts[0]].length >= 50) _history[msg.To.Parts[0]].shift();

	_history[msg.To.Parts[0]].push(JSON.parse(JSON.stringify(msg)));
}

module.exports = new (DeBot.module(function (bot, group) {
	_bot = bot;
	_group = group;

	bot.on('OnChannelMessage', performSedThing);
}))();