var DeBot = require('../core/Module');


var _history = {};
var _bot = {};
var _group = {};
var _regx = new RegExp(/^s([^A-z0-9])(.*?)\1(.*?)\1([a-z]{0,3})(.*)*/);

function performSedThing(server, msg) {


	if (!_group.botIsExecutor(server.alias, _group.passer.alias, server.Channels[msg.Parts[2]] || {"isChannel":false, "Display":msg.Parts[2]})) {
	    return;
	}
	_bot = _group.passer;

	if (!_history[msg.Parts[2]]) _history[msg.Parts[2]] = [];

	try {
		var res = msg.MessageLine.match(_regx);

		if (res) {
			console.log(res);
			var rg = new RegExp(res[2], res[4]);
			for(var i = _history[msg.Parts[2]].length - 1; i >= 0; i--) {
				if (rg.test(_history[msg.Parts[2]][i].MessageLine)) {
					_bot.say(server.alias, msg.Parts[2], "<" + _history[msg.Parts[2]][i].From.Parts[0] + "> " + _history[msg.Parts[2]][i].MessageLine.replace(rg, res[3]));
					break;
				}
			}

			return;
		}
	}
	catch(ex) {
		_bot.say(server.alias, msg.Parts[2], "[Sed Error] " + ex);
		return;
	}

	if (_history[msg.Parts[2]].length >= 50) _history[msg.Parts[2]].shift();

	_history[msg.Parts[2]].push(JSON.parse(JSON.stringify(msg)));
}

module.exports = new (DeBot.module(function (bot, group) {
	_bot = bot;
	_group = group;

	_group.on('OnPrivmsg', performSedThing);
}))();