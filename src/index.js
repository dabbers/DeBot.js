global.Core = require('./core/Core');
var request = require("request");


global.die = function() { 
	for(var gr in global.Core.groups) {
		for(var b in global.Core.groups[gr].bots) {
			for( var n in global.Core.groups[gr].bots[b].sockets) {
				global.Core.groups[gr].bots[b].disconnect(n, "DeBot.js Framework v" + Core.version);
			}
		}
	}
	setTimeout(function() { process.exit(); }, 100); 
}

global.download = function(url, cb) {
	request({
		uri: url,
		method: "GET",
		timeout: 5000,
		followRedirect: true,
		maxRedirects: 5
	}, function(error, response, body) {

		if (error) {
			cb(undefined);
		}
		else {
			if (response.headers['content-type'].toLowerCase().indexOf("json") != -1) {
				cb(JSON.parse(body));
			}
			else {
				cb(body);
			}
		}
		
	});

}

Core.init('config.json');
setInterval( function() {Core.tick();}, 120);

