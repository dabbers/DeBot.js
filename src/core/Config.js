var fs = require('fs');

exports.load = function(path) {

	var confg = JSON.parse(fs.readFileSync(path));

	var isDirty = false;

	confg.save = function() {
		fs.writeFile(path, JSON.stringify(confg, null, 4), function (err) {
			if (err) {
				console.log("[Config.js] There was an issue saving the config: ", err);
			}
			isDirty = false;
		});
	};

	// Setup an auto-saving config. Use the isDirty flag to prevent saving multiple times.
   var obj = new Proxy(confg, {
        set: function( proxy, property, value ) {
        	if (!isDirty) {
        		isDirty = true;
        		process.nextTick(proxy.save);
        	}
        }
    });

	return obj;
}