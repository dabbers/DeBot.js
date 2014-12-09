global.Core = require('./core/Core');

global.die = function() { 
	for(var gr in global.Core.groups) {
		for(var b in global.Core.groups[gr].bots) {
			for( var n in global.Core.groups[gr].bots[b].sockets) {
				global.Core.groups[gr].bots[b].disconnect(n, "DeBot.js Framework v.1");
			}
			
		}
	}
	setTimeout(function() { process.exit(); }, 100); 
}

Core.init('config.json');
setInterval( function() {Core.tick();}, 200);

