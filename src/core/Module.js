var Bot = require('./Bot');
var BotGroup = require('./Bot');
var util = require('util');

var fakeBot = require('./FakeBot');

var fakeGroup = require('./FakeGroup');

function Module(callback, uninitCallback) { 

	return function() {
		var self = this;
		this.init = function(realBotOrGroup) {
			var group = realBotOrGroup;
			var fakebot = null;
			var lines = [];

			if (realBotOrGroup instanceof Bot) {
				group = realBotOrGroup.group;
				fakebot = fakeBot(realBotOrGroup, group);
			}
			else {
				realBotOrGroup = null;
			}

			var fakegroup = new fakeGroup(group);

			self.uninit = function() {
				if (fakebot)
					fakebot.cleanupMethods();
				
				for(var i in fakegroup.bots) {
					fakegroup.bots[i].cleanupMethods();
				}

				fakegroup.cleanupMethods();

				for(var i = 0; i < lines.length; i++) {
					clearInterval(lines[i]);
				}

				if (uninitCallback)
					uninitCallback(fakebot, fakegroup);
			}

			global.oldInterval = global.setInterval;

			global.setInterval = function() {
				console.log(arguments);

				var cb = arguments[0];
				var args = Array.prototype.splice.call(arguments, 1);

				console.log(cb);
				console.log(args);

				var tmrobj = oldInterval(cb, args);
				
				tmrobj.unref(); // prevent from keeping the event loop open

				lines.push(tmrobj);
				return tmrobj;
			}

			callback(fakebot, fakegroup);

			global.setInterval = global.oldInterval;
		}
	};

};

exports.module = Module;
