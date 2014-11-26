var Command = require('./Command');

var defaultOptions = {
	"ChannelBind" : [],
	"ServerBind" : [],
	"Level" : 1,
	"AllowPm" : false,
	"Hidden" : false
};

function Commandable() {
	this.commands = {};

	this.addCommand = function(string, options, fn) {
		if (!fn) {
			fn = options;
			options = {};
		}
		
		if (typeof fn != "function") {
			console.log("Invalid data type passed for function parameter.");
			return false;
		}

		for(var key in defaultOptions) {
			if (!options[key]) options[key] = defaultOptions[key];
		}


	}
}


/*
Command{} +Commands 
Command +AddCommand(string, {}, fn) 
+DelCommand(Command | string) 
Commandable +SetCommand(string, {}, fn)
*/