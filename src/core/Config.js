var fs = require('fs');

exports.load = function(path) {
	var isDirty = false;

	var confg = JSON.parse(fs.readFileSync(path));

	confg.save = function() {
			fs.writeFile(path, JSON.stringify(confg, null, 4), function (err) {
			if (err) {
				console.log("[Config.js] There was an issue saving the config: ", err);
			}
			isDirty = false;
		});
	};
	return confg;
}