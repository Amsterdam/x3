/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
 
function x3() {
	this.svg = null;
	this.parent = '';
	this.data = [];
	this.width = -1;
	this.height = -1;
	this.widthOverride = 0;
	this.heightOverride = 0;
	this.minHeight = -1
	this.minWidth = -1;
	this.parentHeight = -1;
	this.parentWidth = -1;
	this.margin = [ 0, 0, 0, 0 ];
	this.transitionSpeed = 750;
	this.transition = false;
	this.values = [];
	this.id = '_'+this.uniqID();
	
	this.rotation = 0;
	
	this.colors = d3.scale.category20();

	/*
	 * Set default values
	 */
	this.set("parent", this._getParent);
	this.set("innerWidth", this._getInnerWidth);
	this.set("innerHeight", this._getInnerHeight);
	this.set("svg", this._getSvg);
	this.set("transitionSpeed", this._getTransitionSpeed);
	this.set("margin", this._getMargin);
	this.set("width", this._getWidth);
	this.set("minWidth", this._getMinWidth);
	this.set("maxWidth", this._getMaxWidth);
	this.set("height", this._getHeight);
	this.set("minHeight", this._getMinHeight);
	this.set("maxHeight", this._getMaxHeight);

	/*
	 * Call these functions when one of
	 * the corresponding setters is used.
	 */
	this.trigger("width", this._setWidth);
	this.trigger("minWidth", this._setMinWidth);
	this.trigger("maxWidth", this._setMaxWidth);
	this.trigger("height", this._setHeight);
	this.trigger("minHeight", this._setMinHeight);
	this.trigger("maxHeight", this._setMaxHeight);
	this.trigger("transitionSpeed", this._setTransitionSpeed);
	this.trigger("margin", this._setMargin);
}

x3 = x3.extendsFrom(Function.extensions);

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
		this.parentNode.appendChild(this);
  });
};

x3.prototype._calcSize=function(w, h) {
	if(this.heightOverride == 0) {
		this.height = parseInt(h);
	}
	if(this.widthOverride == 0) {
		this.width = parseInt(w);
	}
	this.parentHeight = parseInt(h);
	this.parentWidth = parseInt(w);

	if(this.minWidth > 0 && this.width < this.minWidth) {
		this.width = this.minWidth;
	}
	
	if(this.minHeight > 0 && this.height < this.minHeight) {
		this.height = this.minHeight;
	}	
}

x3.prototype.appendTo=function(parent) {
	this.parent = parent;

	var h = d3.select(this.parent).style('height').replace('px',''),
		w = d3.select(this.parent).style('width').replace('px','');

	this._calcSize(w, h);

	var container = d3.select(this.parent).select('svg');
	if(container.empty() == true) {
		this.svg = d3.select(this.parent).append("svg")
			.append("g")
				.attr("class", this.id)
	} else {
		this.svg = container.select('#'+this.id);
	}

	this.call('create');
}

x3.prototype._getParent=function() {
	return this.parent;
}

x3.prototype._getSvg=function() {
	return this.svg;
}

x3.prototype._getWidth=function() {
	return this.width;
}

x3.prototype._setWidth=function(width) {
	this.widthOverride = width >= 0;
	this.width = width;
}

x3.prototype._getHeight=function() {
	return this.height;
}

x3.prototype._setHeight=function(height) {
	this.heightOverride = height >= 0;
	this.height = height;
}

x3.prototype._getMinWidth=function() {
	return this.minWidth;
}

x3.prototype._setMinWidth=function(width) {
	this.minWidth = width;

	if(this.minWidth > 0 && this.width < this.minWidth) {
		this.width = this.minWidth;
	}
}

x3.prototype._getMinHeight=function() {
	return this.minHeight;
}

x3.prototype._setMinHeight=function(height) {
	this.minHeight = height;

	if(this.minHeight > 0 && this.height < this.minHeight) {
		this.height = this.minHeight;
	}	
}

x3.prototype._getMaxWidth=function() {
	return this.maxWidth;
}

x3.prototype._setMaxWidth=function(width) {
	this.maxWidth = width;

	if(this.width > this.maxWidth) {
		this.width = this.maxWidth;
	}
}

x3.prototype._getMaxHeight=function() {
	return this.maxHeight;
}

x3.prototype._setMaxHeight=function(height) {
	this.maxHeight = height;

	if(this.height > this.maxHeight) {
		this.height = this.maxHeight;
	}
}

x3.prototype._getTransitionSpeed=function() {
	return this.transitionSpeed;
}

x3.prototype._setTransitionSpeed=function(speed) {
	this.transitionSpeed = speed;
}

x3.prototype._getInnerHeight=function() {
		return (this.height-this.margin[0]-this.margin[2]);
}

x3.prototype._getInnerWidth=function() {
		return (this.width-this.margin[1]-this.margin[3]);
}

x3.prototype._getMargin=function() {
	return this.margin;
}

x3.prototype._setMargin=function(top, right, bottom, left) {
	this.margin = [top, right, bottom, left];
}

x3.prototype.getFirstRun=function() {
	return this.firstRun;
}

x3.prototype.__redrawCore=function() {
	tmp = d3.select(this.parent).select('svg')
	if(this.transitionSpeed > 0 && this.transition == true) {
		tmp = tmp.transition().duration(this.transitionSpeed)
	}	

	tmp
		.attr("width", this.width+'px')
		.attr("height", this.height+'px')

	tmp = this.svg
	if(this.transitionSpeed > 0 && this.transition == true) {
		tmp = tmp.transition().duration(this.transitionSpeed)
	}
	tmp
		.attr('transform', "translate(" + this.margin[3] + ","+ this.margin[0] +")");
}

x3.prototype.draw=function() {
	var obj = d3.select(this.parent)[0][0],
		h = obj.offsetHeight,
		w = obj.offsetWidth;

	this._calcSize(w, h);

	this.__redrawCore();
	this.call('draw');
}

x3.prototype.redraw=function() {
	var obj = d3.select(this.parent)[0][0],
		h = obj.offsetHeight,
		w = obj.offsetWidth;

	this._calcSize(w, h);

	this.transition = true;
	this.__redrawCore();
	this.transition = false;
	this.call('redraw');
}
