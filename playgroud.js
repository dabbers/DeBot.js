var events = require('events');
var util = require('util');
var fs = require('fs');

global.Core = require('./src/core/Core');
Core.config = {};

var Module = require('./src/core/Module');
var bot = require ('./src/core/Bot');
var Group = require('./src/core/BotGroup');

var grp = new Group("DeBot");
grp.init();

var b = new bot("debot", grp, {"Nick":"DeBot", "Ident":"d", "name":"a"});

b.loadModule("module1");