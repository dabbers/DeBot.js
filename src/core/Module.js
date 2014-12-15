var Bot = require('./Bot');
var BotGroup = require('./Bot');
var util = require('util');

var fakeBot = require('./FakeBot');

var fakeGroup = require('./FakeGroup');

function Module(callback) { 

	return function() {
		var self = this;
		this.init = function(realBotOrGroup) {
			var group = realBotOrGroup;
			var fakebot = null;

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
			}

			callback(fakebot, fakegroup);
		}
	};

};

exports.module = Module;
