//var Proxy = require('proxy');

exports.NoSuchMethodTrap = Proxy.create({
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