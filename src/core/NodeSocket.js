var Base = require('dabbit.base');
var net = require('net');
var util = require('util');
var PriorityQueue = require('js-priority-queue');

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

    var queue = new PriorityQueue({
        comparator: function(a, b) { 
            return a.timestamp-b.timestamp;
        }});

    var interval = 700; // time to space each method apart by for priority queue ordering.

    // Can accept a string or an array of strings to send.
    // Please use an array of strings to take use of the prioity queue.
    // You can also send in a {"timestamp":int, "message":string} object where 
    // timestamp is an epoch timestamp in milliseconds (normal epoch * 1000 or new Date().getTime())
    this.write = function(message) {
        var date = new Date().getTime();
        if (typeof message == "string") {
            queue.queue({"timestamp":date, "message":message});
        }
        else if (message.constructor === Array) {
            if (message.length == 1 && queue.length == 0) {
                this.Writer.write(message + "\r\n");
            }
            else {
                for(var i = 0; i < message.length; i++) {
                    queue.queue({"timestamp":date + (interval * i), "message":message[i]});
                }
            }
    
        }
        else {
            queue.queue({"timestamp":message.timestamp, "message":message.message});
        }
    }

    
    this.__defineGetter__("Reader", function() {
        throw "You must implement Reader";
    });

    this.__defineGetter__("Writer", function() {
        return socket;
    });

    this.Writer = function() {
        return socket;
    }

    this.tick = function() {
        if (queue.length > 0 ) {
            this.Writer.write(queue.dequeue().message + "\r\n");
        }
    }

    this.clearQueue = function() {
        while(queue.length > 0) queue.dequeue();
    }
}
util.inherits(NodeSocket, Base.ISocketWrapper);

module.exports = NodeSocket;
