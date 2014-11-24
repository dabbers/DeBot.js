var Base = require("all")("dabbit/Base");
var net = require('net');
var util = require('util');

function NodeSocket(host, port, ssl) {
    // Indicates object inheritance.
    Base.ISocketWrapper.call(this);
    
    var socket = undefined;
    var backlog = String.Empty;
    var rdCb = undefined;
    var connectedState = false;

    this.__defineGetter__("Host", function() {
        return host || "irc.gamergalaxy.net";
    });

    this.__defineGetter__("Port", function() {
        return port || 6697;
    });

    this.__defineGetter__("Secure", function() {
        return ssl || true;
    });

    this.__defineGetter__("Connected", function() {
        return (connectedState);
    });

    var self = this;
    this.ConnectAsync = function(rawData) { 

        rdCb = rawData || function() { };  
        socket = net.createConnection( port, host, function() { connectedState = true; console.log("connected"); });
        socket.setEncoding('utf8');
        socket.on('data', onData);
        socket.on('end', function() { connectedState = false; console.log('disconnected'); });
        socket.on('error', function() { console.log(arguments); } );
    };

    this.Disconnect = function() {
        if (this.Connected) {
            socket.end();
        }
    }

    // http://stackoverflow.com/a/10012306/486058
    var onData = function(data) {
        backlog += data;
        var n = backlog.indexOf('\n');

        // got a \n? emit one or more 'line' events
        while (~n) {
            //stream.emit('line', backlog.substring(0, n))
            if (backlog[n-1] == '\r') {
                rdCb(backlog.substring(0, n-1));
            } else {
                rdCb(backlog.substring(0, n));
            }

            backlog = backlog.substring(n + 1);
            n = backlog.indexOf('\n');
        }

    }

    this.__defineGetter__("Reader", function() {
        throw "You must implement Reader";
    });

    this.__defineGetter__("Writer", function() {
        return socket;
    });
}
util.inherits(NodeSocket, Base.ISocketWrapper);

module.exports = NodeSocket;
