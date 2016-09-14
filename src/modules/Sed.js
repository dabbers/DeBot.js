var DeBot = require('../core/Module');


var _history = {};
var _bot = {};
var _group = {};
var _regx = new RegExp(/^s([^A-z0-9])(.*?)\1(.*?)\1([a-z]{0,3})(.*)*/);

function performSedThing(server, msg) {

	var chan = msg.Parts[2].toLowerCase();

	if (!_group.botIsExecutor(server.alias, _group.passer.alias, server.Channels[chan] || {"isChannel":false, "Display":chan})) {
	    return;
	}
	_bot = _group.passer;

	if (!_history[chan]) _history[chan] = [];

	try {
		var res = msg.MessageLine.match(_regx);

		if (res) {
			var rg = new RegExp(res[2], res[4]);
			for(var i = _history[chan].length - 1; i >= 0; i--) {

				if (rg.test(_history[chan][i].MessageLine)) {
					
					_bot.say(server.alias, chan, "<" + _history[chan][i].From.Parts[0] + "> " + _history[chan][i].MessageLine.replace(rg, res[3]));
					break;
				}
			}

			return;
		}
	}
	catch(ex) {
		_bot.say(server.alias, chan, "[Sed Error] " + ex);
		return;
	}

	if (_history[chan].length >= 50) _history[chan].shift();

	_history[chan].push(JSON.parse(JSON.stringify(msg)));
}

module.exports = new (DeBot.module(function (bot, group) {
	_bot = bot;
	_group = group;

	_group.on('OnPrivmsg', performSedThing);
}))();