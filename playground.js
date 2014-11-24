var events = require('events');
var util = require('util');
//var nomethod = require('./src/core/NoSuchMethodTrap');
/*

function bot(nick, group) {
  this.Nick = nick;
  var self = this;
  this.__defineGetter__('Group', function(){
    group.passer = self;
    return group;

  })

*/

var fs = require('fs');
fs.readFile( "src/config.json", function (err, data) {
  if (err) {
    throw err; 
  }
  var tmp = JSON.parse(data.toString());
  console.log(tmp.BotGroups);
  eval("function encrypt(pw) " + tmp.Auth[1].encryption);
  console.log(encrypt("HELLO"));
});