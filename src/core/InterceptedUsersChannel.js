var util = require('util');
var Watchable = require( "overload" ).Watchable;
var dabbit = require('dabbit.base');

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
        },
        function numer(ArgInfo) {
            if (dict[ArgInfo.property]) return true;

            return false;
        },
        function del(ArgInfo) {
            
        }
    );

    return obj;
}

function InterceptedUsersChannel(svr) {
    dabbit.Channel.call(this, svr);

    this.Users = DictionaryArray("Nick");
}

module.exports = InterceptedUsersChannel;