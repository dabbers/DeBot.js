var Watchable = require( "overload" ).Watchable;
var Reflect = require('harmony-reflect');

var config = {
	"a":"b",
	"c":["a","b","c"]
};

var obj = new Proxy(config, {
    set: function( proxy, property, value ) {
    	console.log(proxy);
    }
});

console.log(obj);
obj.a = "abc";
obj.c.push("hi");

console.log();

console.log (obj);


