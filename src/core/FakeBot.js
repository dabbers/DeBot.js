/*** THIS FILE HAS BEEN AUTO-GENERATED. ANY MODIFICATIONS TO THIS FILE MAY BE LOST ***/
var fakeEventsEmitter = require('./FakeEventsEmitter');
var util = require('util');

function fakeBot(realBot) {
	this.realBot = realBot;
	this.__defineGetter__('domain', function(){
		return realBot.domain;
	});
	this.__defineSetter__('domain', function(val){
		return realGroup.domain = val;
	});
	this.__defineGetter__('_events', function(){
		return realBot._events;
	});
	this.__defineSetter__('_events', function(val){
		return realGroup._events = val;
	});
	this.__defineGetter__('_maxListeners', function(){
		return realBot._maxListeners;
	});
	this.__defineSetter__('_maxListeners', function(val){
		return realGroup._maxListeners = val;
	});
	this.__defineGetter__('Nick', function(){
		return realBot.Nick;
	});
	this.__defineSetter__('Nick', function(val){
		return realGroup.Nick = val;
	});
	this.__defineGetter__('Ident', function(){
		return realBot.Ident;
	});
	this.__defineSetter__('Ident', function(val){
		return realGroup.Ident = val;
	});
	this.__defineGetter__('Host', function(){
		return realBot.Host;
	});
	this.__defineSetter__('Host', function(val){
		return realGroup.Host = val;
	});
	this.__defineGetter__('IdentifiedAs', function(){
		return realBot.IdentifiedAs;
	});
	this.__defineSetter__('IdentifiedAs', function(val){
		return realGroup.IdentifiedAs = val;
	});
	this.__defineGetter__('Modes', function(){
		return realBot.Modes;
	});
	this.__defineSetter__('Modes', function(val){
		return realGroup.Modes = val;
	});
	this.__defineGetter__('Channels', function(){
		return realBot.Channels;
	});
	this.__defineSetter__('Channels', function(val){
		return realGroup.Channels = val;
	});
	this.__defineGetter__('Name', function(){
		return realBot.Name;
	});
	this.__defineSetter__('Name', function(val){
		return realGroup.Name = val;
	});
	this.__defineGetter__('Display', function(){
		return realBot.Display;
	});
	this.__defineSetter__('Display', function(val){
		return realGroup.Display = val;
	});
	this.__defineGetter__('IrcOp', function(){
		return realBot.IrcOp;
	});
	this.__defineSetter__('IrcOp', function(val){
		return realGroup.IrcOp = val;
	});
	this.__defineGetter__('Identified', function(){
		return realBot.Identified;
	});
	this.__defineSetter__('Identified', function(val){
		return realGroup.Identified = val;
	});
	this.__defineGetter__('Server', function(){
		return realBot.Server;
	});
	this.__defineSetter__('Server', function(val){
		return realGroup.Server = val;
	});
	this.__defineGetter__('IdleTime', function(){
		return realBot.IdleTime;
	});
	this.__defineSetter__('IdleTime', function(val){
		return realGroup.IdleTime = val;
	});
	this.__defineGetter__('SignedOn', function(){
		return realBot.SignedOn;
	});
	this.__defineSetter__('SignedOn', function(val){
		return realGroup.SignedOn = val;
	});
	this.__defineGetter__('Attributes', function(){
		return realBot.Attributes;
	});
	this.__defineSetter__('Attributes', function(val){
		return realGroup.Attributes = val;
	});
	this.__defineGetter__('commands', function(){
		return realBot.commands;
	});
	this.__defineSetter__('commands', function(val){
		return realGroup.commands = val;
	});
	this.__defineGetter__('sockets', function(){
		return realBot.sockets;
	});
	this.__defineSetter__('sockets', function(val){
		return realGroup.sockets = val;
	});
	this.__defineGetter__('alias', function(){
		return realBot.alias;
	});
	this.__defineSetter__('alias', function(val){
		return realGroup.alias = val;
	});
	this.__defineGetter__('group', function(){
		return realBot.group;
	});
	this.__defineSetter__('group', function(val){
		return realGroup.group = val;
	});
	fakeEventsEmitter.call(this);
}
util.inherits(fakeBot, fakeEventsEmitter);
module.exports = fakeBot;

fakeBot.prototype.addCommand = function(string,options,fn) {
	return this.realBot.addCommand(string,options,fn);
}
fakeBot.prototype.loadModule = function(modname) {
	return this.realBot.loadModule(modname);
}
fakeBot.prototype.unloadModule = function(modname) {
	return this.realBot.unloadModule(modname);
}
fakeBot.prototype.tick = function() {
	return this.realBot.tick();
}
fakeBot.prototype.connect = function(name,connectInfo) {
	return this.realBot.connect(name,connectInfo);
}
fakeBot.prototype.settings = function() {
	return this.realBot.settings();
}
fakeBot.prototype.say = function(net,chan,msg) {
	return this.realBot.say(net,chan,msg);
}
fakeBot.prototype.me = function(net,chan,msg) {
	return this.realBot.me(net,chan,msg);
}
fakeBot.prototype.join = function(net,chan,pass) {
	return this.realBot.join(net,chan,pass);
}
fakeBot.prototype.part = function(net,chan,reason) {
	return this.realBot.part(net,chan,reason);
}
fakeBot.prototype.setMaxListeners = function(n) {
	return this.realBot.setMaxListeners(n);
}
fakeBot.prototype.emit = function(type) {
	return this.realBot.emit(type);
}
fakeBot.prototype.addListener = function(type,listener) {
	return this.realBot.addListener(type,listener);
}
fakeBot.prototype.on = function(type,listener) {
	return this.realBot.on(type,listener);
}
fakeBot.prototype.once = function(type,listener) {
	return this.realBot.once(type,listener);
}
fakeBot.prototype.removeListener = function(type,listener) {
	return this.realBot.removeListener(type,listener);
}
fakeBot.prototype.removeAllListeners = function(type) {
	return this.realBot.removeAllListeners(type);
}
fakeBot.prototype.listeners = function(type) {
	return this.realBot.listeners(type);
}
