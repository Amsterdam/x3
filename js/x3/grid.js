/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

x3.grid=function(parent, x, y, alignment) {
	var self = this;
	this.parent = null;
	this.transition = false;	

	this.id = this.uniqID();

	/*
	 * Set default values
	 */
	this.set("axis", 0);
	this.set("top", 0);
	this.set("left", 0);
	this.set("size", 0);
}

x3.grid = x3.grid.extendsFrom(Function.extensions);

x3.grid.prototype.create=function() {
	this.group = this.get("parent").get("svg").selectAll('#'+this.id)
		.data([null]).enter()
			.append('g')
				.attr('id', this.id)
				.attr("class", "grid")
}


x3.grid.prototype.redraw=function() {
	this.transition = true;
	this.draw();
	this.transition = false;
}

x3.grid.prototype.draw=function() {
	var self = this,
		axis = this.get("axis"),
		scale = null,
		size = 0,
		range = 0;

	if(["top", "bottom"].indexOf(axis.get("orientation")) >= 0) {
		range = axis.get("bbox").width;
	} else if(["left", "right"].indexOf(axis.get("orientation")) >= 0) {
		range = axis.get("bbox").height;
	}
		
	switch(axis.get("type")) {
		case 'linear':
			scale = d3.scale.linear()
				.domain(axis.get("scale"))
				.range([0, range]);
		break;
		case 'ordinal':
			scale = d3.scale.ordinal()
				.domain(axis.get("scale"))
				.rangeRoundBands([0, range], 0);
		break;
	}
	
	var tmp = d3.svg.axis()
		.scale(scale)
		.orient(axis.get("orientation"));

	if(axis.get("tickInterval") > 0) {
		tmp
			.ticks(axis.get("tickCount"));
	}
	this.group
		.attr("transform", function() {
			return "translate("+ self.get("left") +","+ self.get("top") +")";
		})
		.attr("class", function(d, i) {
			return "grid "+axis.get("orientation")
		})
		.call(tmp
			.tickSize(this.get("size"))
			.tickFormat("")
		)
}