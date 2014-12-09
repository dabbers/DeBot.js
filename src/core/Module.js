var Bot = require('./Bot');
var BotGroup = require('./Bot');
var util = require('util');

var fakeBot = require('./FakeBot');

var fakeGroup = require('./FakeGroup');

function Module(callback) { 

	var self = this;
	return function() {
		this.init = function(realBot) {

			var fakegroup = new fakeGroupOverrides(realBot.group);
			var fakebot = new fakeBotOverrides(realBot, fakegroup);

			self.uninit = function() {
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


function fakeBotOverrides(realBot, fakegroup) {
	fakeBot.call(this, realBot);

	this.__defineGetter__('group', function(){
		fakegroup.passer = realBot;
		return fakegroup;
	});
}
util.inherits(fakeBotOverrides, fakeBot);

function fakeGroupOverrides(realgroup) {
	fakeGroup.call(this, realgroup);

	var newbots = {};
	var self = this;

	this.__defineGetter__('bots', function(){
		for(var i in realgroup.bots) {
			newbots[i] = new fakeBotOverrides(realgroup.bots[i], self);
		}

		return newbots;
	});
}
util.inherits(fakeGroupOverrides, fakeGroup);