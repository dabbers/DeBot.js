var util = require('util');
//var Watchable = require( "overload" ).Watchable;
var reflect = require('harmony-reflect');
var dabbit = require('dabbit.base');

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
                return function() { return lists; };
            }
            else if ("toJSON" == property) {
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
            return Object.keys(dict);
        } }
    );

    return obj;
}

function InterceptedUsersChannel(svr) {
    dabbit.Channel.call(this, svr);

    this.Users = DictionaryArray("Nick");
}

module.exports = InterceptedUsersChannel;