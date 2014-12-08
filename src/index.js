global.Core = require('./core/Core');
Core.init('config.json');
setInterval( function() {Core.tick();}, 400);

