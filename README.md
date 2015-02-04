DeBot.js
========

Node.JS IRC Bot version of the DeBot PHP IRC Bot.

Getting Started
================
First, install dependencies by going into /src/ and doing `npm install`

Rename or copy config.example.json to config.json. Make your changes to the config as per the comments. _MAKE SURE TO REMOVE THE COMMENTS_ as JSON syntax doesn't allow comments.

Once done, you can launch the bot.

To do this, do `node --harmony index.js` The bot will then start. The --harmony flag is requred because DeBot.js uses a few features of ECMA6 (mainly the Proxy object). Once node.js/V8 have native Proxy object included, the flag should no longer be nessecary.


Writing Modules
===============
Should you want to add a feature or special behavior to DeBot.js, the preferred way would be to use Modules. The Module structure is very straight forward. 

```
var DeBot = require('../core/Module');

module.exports = new (DeBot.module(function (bot, group) {
	// Code Here
}))();

```

The module will need to go into /src/modules/. Modules will work for both a BotGroup and Bot. If the module is loaded via a BotGroup, the bot object will always be null/undefined. 


***Note that when you are adding commands via a module, you need to pass the persist setting as false. Otherwise the command will be stored and loaded on restarts. Depending on the callback given, it may crash the bot. Example of setting persist to false is provided below.***

```
group.addCommand(
	command_prefix + "getcmd", 
	{"level":3, "timer":0, "persist":false}, // Requires level 3 to use, can be used over and over with no delay, and do not store for later use.
	function(server, channel, msg, bot, group) { // bot and group are optional and will be injected on saving/reloading
	......
```


Structure of DeBot.js
============================
Going from the bottom up. The heierarchy looks like so:

index -> Core -> BotGroups -> Bots -> Networks.

Each bot has an map of socket connections to networks. Each BotGroup has bots that are all connected to the same networks. This gives your BotGroup the ability to be distributed across the network during netsplits.

Each BotGroup and Bots can have commands. Bots emit the Command callback on the botgroup, meaning if you have multiple bots in a channel, a botgroup command can be called more than once. If you only want one bot to execute this command, you can use the following snippet:

```
if (!group.botIsExecutor(server.alias, bot.Nick, channel)) {
	return;
}
.... // Code to execute as this bot

```

The Commands module is an easier way to do this. It is only usable on a BotGroup due to injecting the code above.

A Bot can have modulese on its own, and can have its own Commands. It can have its own channels, but cannot have its own networks. 

Anatomy of a callback
=============================
The callback for a command will provide various variables you can use as short hand.

* server: The server that executed this command. You can grab stats from it. 
	* The server.Attributes has the network settings (Max # chans, etc).
	* The server.Channels contains a list of all your channels in the BotGroup. This means, if you have 2 bots in different channels, they can refer to each others' channels. The Channels object can be accessed by the channel name. Channels["#channel"] object has various properties stored about it.
		* A Channel object has a .Topic, .Modes, and .Users (as may be expected). 
			* .Users allows you to get the users in the channel. You can access the Users list as both an array and a map. If you want the highest ranked user in the channel, you can use .Users[0]. The .Nick returns the nickname and .Ident. The .Host will return if the server supports UHNAMES (UnrealIRCD). 
			* .Topic.Display shows the topic. There are other attributes such as .SetBy and .DateSet which should be self explanatory. 
			* .Modes is an array of modes applied to the channel. This does NOT include bans and Invites (I don't think. Can't remember now).
* channel: This represents the location this command was executed at. The name channel is a bit misleading since this can also be executed inside a Private Message.
	* The channel.Display property shows where this command was sent to, if a channel. If it was a PM, it is the nick that sent the message. 
	* The channel.isChannel property lets you know if this was a PM or a #channel. 
* msg: This stores various representations of the data received by the bot. They all inherit a Message object which has at least the .From, .Parts, .RawLine and .MessageLine. 
	* msg.Parts is the line split by a space. So will usually look like [ "nick!ident@host", "COMMAND", "etc"].
	* msg.RawLine is the line received straight from the server without the ending \r\n. No modifications will be performed to this string.
	* msg.MessageLine is the text after the 2nd : character. This is useful if you want to handle the text said in a PrivateMessage. 
	* msg.Command is the command that this msg represents. This is default to [1] of msg.Parts or [0] if ERROR/PING.
	* A message may have other attributes to make handling that event easier. This will be documented later, or you can check in the dabbit.Base.js/Events/ items.
* (Command Only) bot: This is the bot that received this message. It is the same as doing server.Me. The bot inherits the User object so has items like .Nick, .Ident, .Host, and .Modes.
* (Command Only) group: The group this command belongs to. Allows you to access the .bots, and .networks should you need to access another bot or network.

There is also the globally available Core object. This provides access to every botgroup, every bot, and settings. 
