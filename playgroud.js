var Watchable = require( "overload" ).Watchable;
var Reflect = require('harmony-reflect');

var a = {
	"group": { 
		"bot": { 
			"a": {
				"Channel": ["a","b","c"]
			}
		}
	}
};


function omg(chns) {
	chns.push("e");
	this.ShowChns = function() {
		console.log(chns);
	}
}


var o = new omg(a.group.bot.a.Channel);
console.log(a);
o.ShowChns();
a.group.bot.a.Channel.push("d");
o.ShowChns();
console.log(a.group.bot.a.Channel);