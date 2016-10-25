/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

x3.pie=function() {
	var self = this;
	this.transition = false;
	this.arc = null;
	this.pie = null;
	this.datagroup = null;
	this.container = null;
	
	this.id = this.uniqID();

	/*
	 * Call these functions when one of
	 * the corresponding setters is used.
	 */
	this.trigger("data", this._setData);
	
	/*
	 * Set default values
	 */
	this.set("arc", this._getArc);
	this.set("container", this._getContainer);
	this.set("datagroup", this._getDatagroup);
	this.set("id", this.id);
}

x3.pie = x3.pie.extendsFrom(Function.extensions);

x3.pie.prototype.create=function() {
	var self = this;
	this.group = this.get("parent").get("svg").selectAll('#'+this.id)
		.data([null]).enter()
			.append('g')
				.attr('id', this.id)

	this.arc = d3.svg.arc()
    .outerRadius(0)
    .innerRadius(0);
		
	this.pie = d3.layout.pie()
    .sort(null)
    .value(function(d) {
			return d['value'];
		});
}

x3.pie.prototype._getArc=function() {
	return this.arc;
}

x3.pie.prototype._getContainer=function() {
	return this.container;
}

x3.pie.prototype._getDatagroup=function() {
	return this.datagroup;
}

x3.pie.prototype._setData=function() {
	var self = this;
	this.data = this.get('data');

	this.container = d3.select('#'+this.id).selectAll('.arc')
		.data(this.pie(this.data));

	this.datagroup = this.container.enter()
		.append('g')
			.attr("class", "arc")
}

x3.pie.prototype.redraw=function() {
	this.transition = true;
	this.draw();
	this.transition = false;
}

x3.pie.prototype._transition=function() {
	var self = this;
	var tmp = this.container
	if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
		tmp = tmp.transition().duration(this.get("parent").get("transitionSpeed"))
	}

	tmp
		.attr("transform", "translate(" + (this.get("parent").get("innerWidth")/2) +", "+ (this.get("parent").get("innerHeight")/2) +")");
				
	tmp = this.container.select("path")
	if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
		tmp.transition().duration(this.get("parent").get("transitionSpeed"))
			.attrTween("d", function(d) {
				var i = d3.interpolate(this._current, d),
						k = d3.interpolate(self.oldRadius, self.radius);
				this._current = i(0);

				return function(t) {
					return self.arc.outerRadius(k(t))(i(t));
				};
		})
		.attr("fill", function(d, i) {
			if('color' in d['data']) {
				return d['data']['color'];
			} else {
				return d3.select(this).attr("fill");
			}
		})
	} else {
		tmp
			.attr("d", this.arc)
			.attr("fill", function(d, i) {
				if('color' in d['data']) {
					return d['data']['color'];
				} else {
					return d3.select(this).attr("fill");
				}
			})
	}
}

x3.pie.prototype.draw=function() {
	var self = this;
	this.oldRadius = this.radius;
	this.radius = Math.min(this.get("parent").get("innerWidth"), this.get("parent").get("innerHeight")) / 2;

	this.arc
		.outerRadius(this.radius);

	this._transition();

	if(this.datagroup == undefined) {
		return;
	}
	
	var tmp = this.datagroup.append("path")
		.attr("d", this.arc)
		.attr("fill", function(d, i) {
			if('color' in d['data']) {
				return d['data']['color'];
			} else {
				return d3.select(this).attr("fill");
			}
		})
		.each(function(d) { this._current = d; });

	if(!(this.get("parent").get("transitionSpeed") > 0 && this.transition == true)) {
		this._transition();
	}
}
