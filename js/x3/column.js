/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

 x3.column=function() {
	var self = this;
	this.parent = undefined;
	this.transition = false;	
	this.group = undefined;
	this.datagroup = undefined;
	this.container = undefined;
	this.firstrun = true;

	this.id = this.uniqID();

	/*
	 * Call these functions when one of
	 * the corresponding setters is used.
	 */
	this.trigger("data", this._setData);

	/*
	 * Set default values
	 */
	this.set("start", 0);
	this.set("height", 0);
	this.set("end", 0);
	this.set("top", 0);
}

x3.column = x3.column.extendsFrom(Function.extensions);

x3.column.prototype.create=function() {
	var self = this;
	
	this.group = this.get("parent").get("svg").selectAll('#'+this.id)
		.data([null]).enter()
			.append('g')
				.attr('id', this.id)
}

x3.column.prototype._setData=function() {
	var self = this;
	this.data = this.get('data');

	this.container = d3.select('#'+this.id).selectAll('.datagroup')
		.data(this.data)

	this.datagroup = this.container.enter()
		.append('g')
			.attr("class", "datagroup")


	this.datagroup.append('rect');
}

x3.column.prototype.redraw=function() {
	this.transition = true;
	this.draw();
	this.transition = false;
}

x3.column.prototype._transition=function(tmp) {
	var self = this;
	if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
		tmp = tmp.transition().duration(this.get("parent").get("transitionSpeed"))
	}
	tmp
		.attr("fill", function(d, i) {
			if('color' in d) {
				return d['color'];
			} else {
				return d3.select(this).attr("fill");
			}
		})
		.attr("y", function(d, i) {
			if('y' in d) {
				return self.get('top', d, i, false);
			} else {
				return d3.select(this).attr("y");
			}
		})
		.attr("width", function(d, i) {
			if('x' in d) {
				return Math.abs(self.get("end", d, i, false));
			} else {
				return d3.select(this).attr("width");
			}
		})
		.attr("x", function(d, i) {
			if('x' in d) {
				var width = self.get('end', d, i, false);
				var start = self.get('start', d, i, false);
				if(width > 0) {
					return start;
				} else {
					return start-Math.abs(width);
				}
			} else {
				return d3.select(this).attr("x");
			}
		})
}

x3.column.prototype.draw=function() {
	var self = this;

	if(this.firstrun == true) {
		if(this.datagroup == undefined) {
			return;
		}

		var tmp = this.datagroup.select('rect');
		tmp
			.attr("width", function(d, i) {
				return 0;
			})
			.attr("height", function(d, i) {
				if('y' in d) {
					return self.get("height", d, i, true);
				} else {
					return d3.select(this).attr("height");
				}
			})
			.attr("y", function(d, i) {
				if('y' in d) {
					return self.get('top', d, i, true);
				} else {
					return d3.select(this).attr("y");
				}
			})
			.attr("x", function(d, i) {
				return self.get('start', d, i, true);
			})
			.attr("fill", function(d, i) {
				if('color' in d) {
					return d['color'];
				} else {
					return d3.select(this).attr("fill");
				}
			})
		this._transition(tmp);
	}

	if(this.container == undefined) {
		return;
	}
	
	var tmp = this.container.select('rect')
	this._transition(tmp);
}