function fakeEventsEmitter() {
	this.oldFakeOn = this.on;
}
fakeEventsEmitter.prototype.callbacks = [];

fakeEventsEmitter.prototype.on = function(event, cb) {
		this.callbacks.push({"event":event, "cb":cb});
		this.oldFakeOn(event, cb);
		return self;
	}

fakeEventsEmitter.prototype.cleanupMethods = function() {
		self.callbacks.forEach(function(cb) { self.RealBot.removeListener(cb.event, cb.cb); } );
	}

module.exports = fakeEventsEmitter;