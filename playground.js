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
  tmp.BotGroups["d*bot"].Bots["DaBot"].Channels.push("#dab.beta");
  fs.writeFile("src/config.json",JSON.stringify(tmp, null, 4), function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 
});