var Watchable = require( "overload" ).Watchable;
var Reflect = require('harmony-reflect');


function StringArrayWithDefault(propertyKey) {

    var nicks = {0:"NonickSet"};
    var def = 0;

    var obj = new Proxy({}, {
        get: function( proxy, property ){
            //check the type of the object contained by value
            //undefined if no value, or number if using []'s with a number
            //var property = ArgInfo.property;
            if ("inspect" == property) {
                return function() { return nicks[def]; };
            }
            else if ("toJSON" == property) {
                return function () { return JSON.stringify(nicks); };
            }
            else if ("indexOf" == property) {
                return function(ob) {
                    return nicks.indexOf(ob);
                }
            }
            else if ("toString" == property) {
                return function() { return nicks[def]; };
            }
            else {
                return nicks[property];
            }
        },
        set: function( proxy, property, value ) {
           // var property = ArgInfo.property
            //var value = ArgInfo.value;
            console.log("SET PROPERTY");
            if (0 == def) {
                def = property;
            }
            return nicks[property] = value;
        },
        enumerate: function() {
            console.log("ITERATE");
            return (function () {
                var index = 0;
                var keys = Object.keys(nicks);
                this.next = function() {
                    if (index >= keys.length) return {done:true};
                    else
                        return {value: nicks[keys[index++]][propertyKey], done:false};
                };
                return this;
            }) ()
        },
        keys: function() {
            console.log("KEYS");    
            return Object.keys(nicks);
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



var users = StringArrayWithDefault("Nick");
users["ggxy"] = "dab";
console.log("Users: " + users);
console.log(users);
users = "omg";
console.log(users);