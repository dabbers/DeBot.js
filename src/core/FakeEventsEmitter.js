function fakeEventsEmitter() {
	this.oldFakeOn = this.on;
	this.oldAddCommand = this.addCommand;
}
fakeEventsEmitter.prototype.callbacks = [];

fakeEventsEmitter.prototype.on = function(event, cb) {
		this.callbacks.push({"event":event, "cb":cb});
		this.oldFakeOn(event, cb);
		return this;
	}
fakeEventsEmitter.prototype.on = function(event, cb) {
		this.callbacks.push({"event":event, "cb":cb});
		this.oldFakeOn(event, cb);
		return this;
	}

fakeEventsEmitter.prototype.cleanupMethods = function() {
		this.callbacks.forEach(function(cb) { this.RealBot.removeListener(cb.event, cb.cb); } );
	}

module.exports = fakeEventsEmitter;