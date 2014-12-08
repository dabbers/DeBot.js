var path = require('path');

exports.init = function(dbg) {

	if (dbg)
		return {"log": log, "debug": debug};
	else
		return {"log": log, "debug": no_debug};

}

function log(file, message) {

	if (!message) {
		message = file;
		var line = new Error().stack.split("\n")[2];
		var start = line.indexOf('(') + 1;
		line = line.substring(start);
		var end = line.indexOf(':', 4);
		file = path.basename(line.substring(0, end), ".js");
	}

	console.log("[" + file + "] " + message);
}

function debug(file, message) {

	if (!message) {
		message = file;
		var line = new Error().stack.split("\n")[2];
		var start = line.indexOf('(') + 1;
		line = line.substring(start);
		var end = line.indexOf(':', 4);
		file = path.basename(line.substring(0, end), ".js");
	}
	console.log("<DEBUG> [" + file + "] " + message);
}

function no_debug() {}