
function Module(callback) { 

	return function() {
		var fakebot = undefined;
		var self = this;
		this.init = function(realBot) {
			self.fakebot = new fakeBot(realBot);
			callback(self.fakebot);
		}

		this.uninit = function() {
			self.fakebot.cleanupMethods();
		}
	};

};

exports.module = Module;
