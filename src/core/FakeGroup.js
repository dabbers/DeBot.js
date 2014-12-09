/*** THIS FILE HAS BEEN AUTO-GENERATED. ANY MODIFICATIONS TO THIS FILE MAY BE LOST ***/
var util = require('util');

function fakeGroup(realGroup) {
	this.realGroup = realGroup;
	this.__defineGetter__('domain', function(){
		return realGroup.domain;
	});
	this.__defineSetter__('domain', function(val){
		return realGroup.domain = val;
	});
	this.__defineGetter__('_events', function(){
		return realGroup._events;
	});
	this.__defineSetter__('_events', function(val){
		return realGroup._events = val;
	});
	this.__defineGetter__('_maxListeners', function(){
		return realGroup._maxListeners;
	});
	this.__defineSetter__('_maxListeners', function(val){
		return realGroup._maxListeners = val;
	});
	this.__defineGetter__('bots', function(){
		return realGroup.bots;
	});
	this.__defineSetter__('bots', function(val){
		return realGroup.bots = val;
	});
	this.__defineGetter__('passer', function(){
		return realGroup.passer;
	});
	this.__defineSetter__('passer', function(val){
		return realGroup.passer = val;
	});
	this.__defineGetter__('networks', function(){
		return realGroup.networks;
	});
	this.__defineSetter__('networks', function(val){
		return realGroup.networks = val;
	});
	this.__defineGetter__('settings', function(){
		return realGroup.settings;
	});
	this.__defineSetter__('settings', function(val){
		return realGroup.settings = val;
	});
	this.__defineGetter__('events', function(){
		return realGroup.events;
	});
	this.__defineSetter__('events', function(val){
		return realGroup.events = val;
	});
	this.__defineGetter__('Events', function(){
		return realGroup.Events;
	});
	this.__defineSetter__('Events', function(val){
		return realGroup.Events = val;
	});
	this.__defineGetter__('name', function(){
		return realGroup.name;
	});
	this.__defineSetter__('name', function(val){
		return realGroup.name = val;
	});
	fakeEventsEmitter.call(this);
}
util.inherits(fakeGroup, fakeEventsEmitter);
module.exports = fakeGroup;

fakeGroup.prototype.tick = function() {
	return this.realGroup.tick();
}
fakeGroup.prototype.delBot = function(botOrName) {
	return this.realGroup.delBot(botOrName);
}
fakeGroup.prototype.addNetwork = function(networkName,connectionStringOrStrings) {
	return this.realGroup.addNetwork(networkName,connectionStringOrStrings);
}
fakeGroup.prototype.delNetwork = function(networkOrName) {
	return this.realGroup.delNetwork(networkOrName);
}
fakeGroup.prototype.init = function() {
	return this.realGroup.init();
}
fakeGroup.prototype.addBot = function(botOrName,options) {
	return this.realGroup.addBot(botOrName,options);
}
