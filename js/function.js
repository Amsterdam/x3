/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

Function.prototype.extendsAttributes=function(Super) {
	var Self = this;
	var Func = function() {
		Super.apply(this, arguments);
		Self.apply(this, arguments);
	};
		
	Func.prototype = new Super();
	return Func;
}

Function.prototype.extendsFrom=function() {	
	var protos = new Array(arguments.length);

	for(var i=0;i<arguments.length;i++) {	
		protos[i] = arguments[i];
	}

	var self = this;

	for(var i in protos) {
		self = this.extendsAttributes(protos[i]);	
	}
		
	for(var i in protos) {	
		for(var x in protos[i].prototype) {
			if((typeof this[x] == 'function' && typeof protos[i].prototype[x] == 'function' && protos[i].prototype[x] == this[x]) || typeof this[x] != 'function') {
				self.prototype[x] = protos[i].prototype[x];
			}
		}
	}
	return self;
}