
var Reflect = require('harmony-reflect');
var events = require('events');
var util = require('util');

global.Core = require('./src/core/Core');
Core.init('config.json');

var Module = require('./src/core/Module');
var bot = require ('./src/core/Bot');

var b = new bot("debot", {}, {"Nick":"DeBot", "Ident":"d", "name":"a"});

b.loadModule("module1");

b.emit("command_!hello", {}, {"From":{"Parts":["dab"]}});
