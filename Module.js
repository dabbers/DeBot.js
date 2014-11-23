
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

var NoSuchMethodTrap = Proxy.create({
  // FIXME: don't know why I need to provide this method,
  // JS complains if getPropertyDescriptor is left out, or returns undefined
  // Apparently, this method is called twice: once for '_noSuchMethod_' and once for 'foo'
  getPropertyDescriptor: function(n){ return undefined; }, 
  get: function(rcvr, name) {
    if (name === '__noSuchMethod__') {
      throw new Error("receiver does not implement __noSuchMethod__ hook");
    } else {
      return function() {
        var args = Array.prototype.slice.call(arguments);
        return this.__noSuchMethod__(name, args);
      }
    }
  }
});

function fakeBot(realBot)
{
	this.RealBot = realBot; 
	var self = this;
	this.callbacks = [];

	this.on = function(event, cb) {
		self.callbacks.push({"event":event, "cb":cb});
		self.RealBot.on(event, cb);
	}

	this.cleanupMethods = function() {
		self.callbacks.forEach(function(cb) { self.RealBot.removeListener(cb.event, cb.cb); } );
	}
	this.__noSuchMethod__ = function(methName, args) {
  		return self.RealBot[methName].call(self.RealBot, args);
	};
}
fakeBot.prototype = Object.create(NoSuchMethodTrap);

module.exports = {"module":Module};
