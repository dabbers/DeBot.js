var Parser = require('dabbit.base').Parser;
var ServerType = require('dabbit.base').ServerType;
var events = require('events');


function Network(group, ctx, name) {
    this.whoisLibraryRequested = [];

    var serverType = ServerType.Unknown; // ServerType

    if (!ctx) {
        throw "ctx cannot be null";
    }

    var multiModes = false; // bool
    var hostInNames = false; // bool

    this.Attributes = {};

    this.__defineGetter__("Display", function() {
        return this.Attributes["NETWORK"];
    });

    this.__defineGetter__("alias", function() {
        return name;
    });


    this.Channels = {};

    this.Password = "";

    this.__defineGetter__("MultiModes", function() {
        return multiModes;
    });
    this.__defineGetter__("HostInNames", function() {
        return hostInNames;
    });

    this.__defineGetter__("Name", function() {
        return this.Display;
    });
    this.__defineSetter__("Name", function(val) {
        this.Attributes["NETWORK"] = value;
    });

    this.__defineGetter__("Type", function() {
        return serverType;
    });

    this.__defineGetter__("Me", function() {
        return group.passer || group.events;
    });


    this.Channels = {}; //new Dictionary<string, Channel>(StringComparer.CurrentCultureIgnoreCase);
    this.OnNumeric = {}; //new Dictionary<RawReplies, IrcEventHandler>();

    // Add prefined and used attributes
    this.Attributes["NETWORK"] = name;

    this.Attributes["STATUSMSG"] = "";
    this.Attributes["CHANTYPES"] = "";
    
    var self = this;


    this.IsThisMe = function(usr, type) {
        return usr.toLowerCase() == group.passer.Nick.toLowerCase() && "PART" != type;
    }

    //this.Events = new events.EventEmitter();
    this.__defineGetter__("Events", function() {
        return group.passer || group.events;
    });

    this.PerformConnect = function(bot) {
        var botcopy = bot;
        botcopy.Hosts[name] = {"Nick": bot.Nick,"Ident": bot.Ident,"Host": bot.Host,    };

        botcopy.on('OnNickChange', function(svr, msg) {
            botcopy.Hosts[name].Nick = botcopy.Nick; // Update even if the bot isn't the one doing the /nick
        });

        var attempts = 1;

        var nick_in_use = function() {
            botcopy.Nick = botcopy.Nick + new Array(attempts + 1).join("`");
            botcopy.Hosts[name].Nick = botcopy.Nick;
            botcopy.sockets[name].Write("NICK " + botcopy.Nick);
            attempts++;
        };
        botcopy.on("433", nick_in_use);

        botcopy.on('OnCap', function(svr, msg) { 
            // remove leading : so we can do a direct check
            msg.Parts[4] = msg.Parts[4].substring(1);

            for (var i = 4; i < msg.Parts.length; i++)
            {
                if (msg.Parts[i] == "multi-prefix")
                {
                    botcopy.sockets[name].Write("CAP REQ :multi-prefix");
                    break;
                }
            }

            botcopy.sockets[name].Write("CAP END");
        });

        botcopy.on('OnConnectionEstablished', function(svr, msg) {
            botcopy.sockets[name].Write("WHOIS " + botcopy.Nick);
            //whoisLibraryRequested.push(botcopy.Nick);

            botcopy.sockets[name].Write("MODE " + botcopy.Nick + " +B");
            botcopy.removeListener("433", nick_in_use);
            attempts = 0;
        });

        botcopy.on('005', function (svr, msg) {
            if (self.Attributes["NAMESX"]) {
                multiModes = true;
                botcopy.sockets[name].Write("PROTOCTL NAMESX");
            }
            if (self.Attributes["UHNAMES"]) {
                hostInNames = true;
                botcopy.sockets[name].Write("PROTOCTL UHNAMES");
            }
        });

        botcopy.on('OnWhois', function(svr, msg) { 
            if (msg.Who.Nick == botcopy.Nick) {
                botcopy.Ident = msg.Who.Ident;
                botcopy.Host = msg.Who.Host;
                botcopy.Hosts[name].Ident = msg.Who.Ident;
                botcopy.Hosts[name].Host = msg.Who.Host;
            }
        });

        botcopy.on('OnPing', function(svr, msg) {
            botcopy.sockets[name].Write("PONG " + msg.Parts[1]);
        });

        botcopy.on('OnNewChannelJoin', function(svr, msg) {
            botcopy.sockets[name].Write("MODE " + msg.Channel);
        });

        botcopy.on('OnRemovePrefix', function(svr, msg) {
            if (false == self.MultiModes)
            {
               botcopy.sockets[name].Write("NAMES " + msg.Parts[2]);
            }
        });

        // Luckily javascript is single threaded... this would not work if it wasn't.
        botcopy.sockets[name].ConnectAsync(function(msg) { 
            group.passer = botcopy; 
            botcopy.Nick = botcopy.Hosts[name].Nick;
            botcopy.Ident = botcopy.Hosts[name].Ident;
            botcopy.Host = botcopy.Hosts[name].Host;
            self.rawMessageReceived(msg) 
        });

        botcopy.sockets[name].Write("CAP LS"); // Get list of extras (For multi prefix)
        
        if (self.Password)
        {
            botcopy.sockets[name].Write("PASS " + self.Password);
        }

        botcopy.sockets[name].Write("NICK " + botcopy.Nick);
        botcopy.sockets[name].Write("USER " + botcopy.Ident + " * * :" + botcopy.Name);
    }

    this.rawMessageReceived = function(msg) {
        Parser.parse(self, ctx, msg);
    }

    this.nickIsInChannel = function(nick, chan) {
        if (!self.Channels[chan]) return false;

        return Array_Where(self.Channels[chan].Users, function(p) { return p.Nick == nick;}).length == 1;
    }

    this.isChannel = function(source) {
        return self.Attributes["CHANTYPES"].indexOf(source[0].toString()) != -1;
    }

    /* 
     * If just a user is passed, symbol is @. 
     * Otherwise compares to the symbol passed.
     */
    this.isOp = function (user, channel, symbol) {
        if (!symbol) symbol = "@";

        var list = self.Attributes["PREFIX_PREFIXES"];
        var idx = list.indexOf(symbol); // ~&@%+

        if (idx == -1) {
            list = self.Attributes["PREFIX_MODES"];
            idx = list.indexOf(symbol) // qaohv
        }

        if (!self.nickIsInChannel(user, channel)) {
            return false;
        }

        var usridx = list.indexOf(self.Channels[channel].Users[user].Modes[0]);
        return usridx == idx;
    }

    /*
     * Works same as isOp except includes modes higher than symbol.
     */
    this.isOpOrHigher = function(user, channel, symbol) {
        if (!symbol) symbol = "@";

        var list = self.Attributes["PREFIX_PREFIXES"];
        var idx = list.indexOf(symbol); // ~&@%+

        if (idx == -1) {
            list = self.Attributes["PREFIX_MODES"];
            idx = list.indexOf(symbol) // qaohv
        }

        if (!self.nickIsInChannel(user, channel)) {
            return false;
        }

        var usridx = list.indexOf(self.Channels[channel].Users[user].Modes[0]);
        return usridx != -1 && usridx <= idx;
    }

    this.compareToMode = function(user, channel, symbol) {
        
    }

}

module.exports = Network;