/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

Function.extensions=function() {
	this._set = [];
	this._trig = [];
	this._listeners = [];
}

Function.extensions.prototype.set=function(name, func) {
	var self = this;
	var ret = null;

	var tmp1 = Array.prototype.slice.apply(arguments);
	tmp1.shift();

	this._set[name] = function() {
		var valid = true;
		var tmp2 = Array.prototype.slice.apply(arguments);

		if(typeof(func) == 'function') {
			ret = func.apply(self, tmp2);
		} else {
			if(tmp1.length == 1) {
				return tmp1[0];
			} else {
				ret = tmp1;
			}
		}

		return ret;
	}

	if(name in this._trig) {
		this._trig[name].apply(this, tmp1);
	}

	return this;
}

Function.extensions.prototype.trigger=function(name, func) {
	this._trig[name] = func;
}

Function.extensions.prototype.get=function(name) {
	var tmp = Array.prototype.slice.apply(arguments);
	tmp.shift();

	if(name in this._set) {
		if(typeof(this._set[name]) == 'function') {
			return this._set[name].apply(this, tmp);
		}
	}
	return this;
}

Function.extensions.prototype.on=function(event, func, priority) {
	if(priority == null) {
		priority = 0;
	}
	if(!(event in this._listeners)) {
		this._listeners[event] = [];
	}
	if(!(priority in this._listeners[event])) {
		this._listeners[event][priority] = [];
	}
	this._listeners[event][priority].push(func);
}

Function.extensions.prototype.call=function(event) {
	var tmp = Array.prototype.slice.apply(arguments);
	tmp.shift();
	if(event in this._listeners) {
		for(var i in this._listeners[event]) {
			for(var p in this._listeners[event][i]) {
				this._listeners[event][i][p].apply(this, tmp);
			}
		}
	}
}

Function.extensions.prototype.uniqID=function() {
	return '_'+(parseInt((new Date().getTime()))+parseInt((Math.floor(Math.random() * 1000000000000) + 1)))
}