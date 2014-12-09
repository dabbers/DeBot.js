var events = require('events');
var util = require('util');
var fs = require('fs');

global.Core = require('./src/core/Core');
Core.config = {};

var Module = require('./src/core/Module');
var bot = require ('./src/core/Bot');
var Group = require('./src/core/BotGroup');

var grp = new Group("DeBot");
grp.init();

var b = new bot("debot", grp, {"Nick":"DeBot", "Ident":"d", "name":"a"});

// http://stackoverflow.com/a/9924463/486058
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '')
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
  if(result === null)
     result = []
  return result
}

/*** 
 * 
 *   FAKE BOT COMPILATION
 * 
 ***/

var output = "/*** THIS FILE HAS BEEN AUTO-GENERATED. ANY MODIFICATIONS TO THIS FILE MAY BE LOST ***/" +"\r\n" +
	"var fakeEventsEmitter = require('./FakeEventsEmitter');" + "\r\n" +
	"var util = require('util');" + "\r\n" + "\r\n" + 
	"function fakeBot(realBot) {" + "\r\n" +
	"\t" + "this.realBot = realBot;" + "\r\n";

for(var i in b) {
	if (b.hasOwnProperty(i)) {
		if ("function" != typeof b[i]) {
			output += "\t" + "this.__defineGetter__('" + i + "', function(){" + "\r\n" +
			"\t\t" + "return realBot." + i + ";" + "\r\n" +
			"\t" + "});" + "\r\n";
			// Create setter
			output += "\t" + "this.__defineSetter__('" + i + "', function(val){" + "\r\n" +
			"\t\t" + "return realGroup." + i + " = val;" + "\r\n" +
			"\t" + "});" + "\r\n";
		}
	}
}

output += "\t" + "fakeEventsEmitter.call(this);" + "\r\n" +
		  "}" + "\r\n" + 
		  "util.inherits(fakeBot, fakeEventsEmitter);" +"\r\n" + 
		  "module.exports = fakeBot;" + "\r\n" + "\r\n";

for(var i in b) {
	if ("function" == typeof b[i]) {
		var params = getParamNames(b[i]).toString()
		output += "fakeBot.prototype." + i + " = function(" + params + ") {" + "\r\n" +
		"\t" + "return this.realBot." + i + "(" + params + ");" + "\r\n" +
		"}" + "\r\n";
	}
}

fs.writeFile("./src/core/FakeBot.js", output, function (err) {
	if (err) {
		console.log("[compile.js] There was an issue saving the config: ", err);
	}
});

/*** 
 * 
 *   FAKE BOT GROUP COMPILATION
 * 
 ***/


var output2 = "/*** THIS FILE HAS BEEN AUTO-GENERATED. ANY MODIFICATIONS TO THIS FILE MAY BE LOST ***/" +"\r\n" +
	"var util = require('util');" + "\r\n" + "\r\n" + 
	"function fakeGroup(realGroup) {" + "\r\n" +
	"\t" + "this.realGroup = realGroup;" + "\r\n";

// Creating the properties
for(var i in grp) {
	if (grp.hasOwnProperty(i)) {
		if ("function" != typeof grp[i]) {
			// Create getter
			output2 += "\t" + "this.__defineGetter__('" + i + "', function(){" + "\r\n" +
			"\t\t" + "return realGroup." + i + ";" + "\r\n" +
			"\t" + "});" + "\r\n";

			// Create setter
			output2 += "\t" + "this.__defineSetter__('" + i + "', function(val){" + "\r\n" +
			"\t\t" + "return realGroup." + i + " = val;" + "\r\n" +
			"\t" + "});" + "\r\n";
		}
	}
}

output2 += "\t" + "fakeEventsEmitter.call(this);" + "\r\n" +
		  "}" + "\r\n" + 
		  "util.inherits(fakeGroup, fakeEventsEmitter);" +"\r\n" + 
		  "module.exports = fakeGroup;" + "\r\n" + "\r\n";

// Creating the methods
for(var i in grp) {
	if ("function" == typeof grp[i]) {
		var params = getParamNames(grp[i]).toString()
		output2 += "fakeGroup.prototype." + i + " = function(" + params + ") {" + "\r\n" +
		"\t" + "return this.realGroup." + i + "(" + params + ");" + "\r\n" +
		"}" + "\r\n";
	}
}

fs.writeFile("./src/core/FakeGroup.js", output2, function (err) {
	if (err) {
		console.log("[compile.js] There was an issue saving the config: ", err);
	}
});