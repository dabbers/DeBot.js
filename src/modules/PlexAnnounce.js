var PlexAPI = require("plex-api");


function performCheck(bot) {
	var client = new PlexAPI({
		hostname: Core.config.Modules.PlexAnnounce.hostname,
		port: 	  Core.config.Modules.PlexAnnounce.port,
		username: Core.config.Modules.PlexAnnounce.username,
		password: Core.config.Modules.PlexAnnounce.password,
		options: {
			identifier: "6BC406D9-AB71-48B4-B5C1-90C2458E5396",
			product: "DeBot.js Module"
		}
	});

	client.query("/library/recentlyAdded").then(function (result) {

	    // array of children, such as Directory or Server items
	    // will have the .uri-property attached
	    var res = result._children.map(function (it) {
			
			var added = it.addedAt;

			if (it._elementType == 'Directory') {
				return { title: it.parentTitle + " " + it.title + " (1 or more episodes)", added: added  }
			}
			else {
				return { title: it.title, added: added  }
			}

	    });

	    var last_detected = -1;
	    var encountered = {};

	    for(var i in res) {

	    	if (res[i].added > Core.config.Modules.PlexAnnounce.lastSeen && ! encountered.hasOwnProperty(res[i].title)) {
	    		bot.say(
	    			Core.config.Modules.PlexAnnounce.network, 
	    			Core.config.Modules.PlexAnnounce.channel, 
	    			"[0,1PLE7,1X] Added media: " + res[i].title
	    		);

	    		encountered[res[i].title] = true;
	    		
	    		if (res[i].added > last_detected)
	    			last_detected = res[i].added;
	    	}
	    }
	    encountered = {};
	    
	    if (last_detected != -1) {
	    	Core.config.Modules.PlexAnnounce.lastSeen = last_detected;
	    	Core.config.save();
	    }

	}, function (err) {
	    console.log("[PlexAnnounce] failed to connect to plex server....");
	});
}


function performUserList(bot) {
	var client = new PlexAPI({
		hostname: "plex.tv",
		port: 80,
		username: Core.config.Modules.PlexAnnounce.username,
		password: Core.config.Modules.PlexAnnounce.password,
		options: {
			identifier: "6BC406D9-AB71-48B4-B5C1-90C2458E5396",
			product: "DeBot.js Module"
		}
	});

	client.query("/pms/friends/all").then(function (result) {
		var users = Core.config.Modules.PlexAnnounce.username + ", ";
		var homeUsers = 0;
		var total = 0;

		for(var user in result.MediaContainer.User) {
			var usr = result.MediaContainer.User[user];
			total++;
			if (usr.attributes.username) {
				users += usr.attributes.title + ", ";
			}
			else {
				homeUsers++;
			}
		}

		users += "And " + homeUsers + " home users";
		console.log(users);

		bot.say(
			Core.config.Modules.PlexAnnounce.network, 
			Core.config.Modules.PlexAnnounce.channel, 
			"[0,1PLE7,1X] Shared users (" + total + "): " + users
		);

	}, function (err) {
	    console.log("[PlexAnnounce] failed to connect to plex server....", err);
	});
}

var DeBot = require('../core/Module');

module.exports = new (DeBot.module(function (bot, group) {

	performCheck(bot);

	setInterval(function() {
		performCheck(bot);
	}, 600000);

	bot.addCommand(
    	"!listplexusers", 
    	{"timer":10, "persist":false}, // Requires level 3 to use, can be used over and over with no delay, and do not store for later use.
    	function(server, channel, msg, bot, group) {
    		if (channel == Core.config.Modules.PlexAnnounce.channel) {
    			performUserList(bot);
    		}
    	});
}))();