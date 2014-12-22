var Watchable = require( "overload" ).Watchable;
var Reflect = require('harmony-reflect');

var tmp = "(function () { return 1; })";
var a = eval(tmp);

console.log(a());
