
var Watchable = require( "overload" ).Watchable;


function DictionaryArray(propertyKey) {

    var lists = [];
    var dict = {};

    var obj = Watchable(
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
            return Object.keys(list);
        }
    );

    return obj;
}



var users = DictionaryArray("Nick");

users.push({"Nick":"dab", "level":1});
users.push({"Nick":"dab1", "level":7});
users.push({"Nick":"dab2", "level":4});
users.push({"Nick":"dab3", "level":2});

users.sort(function(a,b) { return a.level - b.level; } );

for( var i = 0; i < users.length; i++) {
	console.log(users[i]);
}

users.splice(1,1);
console.log();

for( var i = 0; i < users.length; i++) {
	console.log(users[i]);
}
