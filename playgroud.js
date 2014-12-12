var Watchable = require( "overload" ).Watchable;
var Reflect = require('harmony-reflect');


function DictionaryArray(propertyKey) {

    var lists = [];
    var dict = {};

    var obj = new Proxy({}, {
        get: function( proxy, property ){
            //check the type of the object contained by value
            //undefined if no value, or number if using []'s with a number
            //var property = ArgInfo.property;
            if ("push" == property) {
                return function(ob) {
                        lists.push(ob);
                        dict[ob[propertyKey || "key"]] = ob;
                    }
            }
            else if ("length" == property) {
                return lists.length;
            }
            else if ("splice" == property) {
                return function(start, end, extra) {
                    var removed = lists.splice(start, end);
                    
                    for(var i = 0; i < removed.length; i++) {
                        delete dict[removed[i][propertyKey]];
                    }

                    return removed;
                }
            }
            else if ("inspect" == property) {
                console.log("INSPECT");
                return function() { return lists; };
            }
            else if ("toJSON" == property) {
                console.log("TOJSON");
                return function () { return JSON.stringify(lists); };
            }
            else if ("sort" == property) {
                return function(fn) {
                    lists.sort(fn);
                }
            }
            else if ("indexOf" == property) {
                return function(ob) {
                    return lists.indexOf(ob);
                }
            }
            else if (isNaN(property)) {
                return dict[property];
            }
            else {
                return lists[property];
            }
                
        },
        set: function( proxy, property, value ) {
           // var property = ArgInfo.property
            //var value = ArgInfo.value;

            if (isNaN(property)) {
                if (!dict[property]) {

                    lists.push(value);
                }
                dict[property] = value;
            }

            return dict[property];
        },
        enumerate: function() {
            console.log("ITERATE");
            return (function () {
                var index = 0;
                var keys = Object.keys(lists);
                this.next = function() {
                    if (index >= keys.length) return {done:true};
                    else
                        return {value: lists[keys[index++]][propertyKey], done:false};
                };
                return this;
            }) ()
        },
        keys: function() {
            console.log("KEYS");    
            return Object.keys(dict);
        } }
    );

    /*var obj = Watchable(
        function getter( ArgInfo ){
            //check the type of the object contained by value
            //undefined if no value, or number if using []'s with a number
            var property = ArgInfo.property;

            if ("push" == property) {
                return function(ob) {
                        lists.push(ob);
                        dict[ob[propertyKey || "key"]] = ob;
                    }
            }
            else if ("length" == property) {
                return lists.length;
            }
            else if ("splice" == property) {
                return function(start, end, extra) {
                    var removed = lists.splice(start, end);
                    
                    for(var i = 0; i < removed.length; i++) {
                        delete dict[removed[i][propertyKey]];
                    }

                    return removed;
                }
            }
            else if ("inspect" == property) {
                return 1;
            }
            else if ("toJSON" == property) {
                return 1;
            }
            else if ("sort" == property) {
                return function(fn) {
                    lists.sort(fn);
                }
            }
            else if ("indexOf" == property) {
                return function(ob) {
                    return lists.indexOf(ob);
                }
            }
            else if (isNaN(property)) {
                return dict[property];
            }
            else {

                return lists[property];
            }
                
        }
        , function setter( ArgInfo ) {
            var property = ArgInfo.property
            var value = ArgInfo.value;

            if (isNaN(property)) {
                if (!dict[property]) {

                    lists.push(value);
                }
                dict[property] = value;
            }

            return dict[property];
        },
        function query() {
            console.log("QUERY CALLED");
            return Object.keys(lists);
        }
    );*/

    return obj;
}



var users = DictionaryArray("Nick");

users.push({"Nick":"dab", "level":1, toString:function() { return "{level 1 dab}"; } });
users.push({"Nick":"dab1", "level":7, toString:function() { return "{level 7 dab1}"; }});
users.push({"Nick":"dab2", "level":4, toString:function() { return "{level 4 dab2}"; }});
users.push({"Nick":"dab3", "level":2, toString:function() { return "{level 2 dab3}"; }});

users.sort(function(a,b) { return a.level - b.level; } );

for( var i = 0; i < users.length; i++) {
	console.log(users[i]);
}

users.splice(1,1);
console.log();

for( var i = 0; i < users.length; i++) {
	console.log("User" + i, users[i]);
}

for( var i in users) {
    console.log("User" + i, i, users[i]);
}

console.log();
console.log(users);
console.log();
console.log(JSON.stringify(users));
console.log();