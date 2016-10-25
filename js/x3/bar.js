/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

x3.bar=function() {
	var self = this;
	this.parent = undefined;
	this.transition = false;
	this.group = undefined;
	this.datagroup = undefined;
	this.container = undefined;
	this.firstrun = false;

	this.id = this.uniqID();

	/*
	 * Call these functions when one of
	 * the corresponding setters is used.
	 */
	this.trigger("data", this._setData);

	/*
	 * Set default values
	 */
	this.set("width", 0);
	this.set("end", 0);
	this.set("start", 0);
	this.set("left", 0);
}

x3.bar = x3.bar.extendsFrom(Function.extensions);

x3.bar.prototype.create=function() {
	var self = this;
	
	this.group = this.get("parent").get("svg").selectAll('#'+this.id)
		.data([null]).enter()
			.append('g')
				.attr('id', this.id)

	this.firstrun = true;
}

x3.bar.prototype._setData=function(data) {
	var self = this;
	this.data = data;

	this.container = d3.select('#'+this.id).selectAll('.datagroup')
		.data(this.data)

	this.datagroup = this.container.enter()
		.append('g')
			.attr("class", function(d, i) {
				return "datagroup"
			})
			
	tmp = this.datagroup.append('rect')
}

x3.bar.prototype.redraw=function() {
	this.transition = true;
	this.draw();
	this.transition = false;
}

x3.bar.prototype._transition=function(tmp) {
	var self = this;
	if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
		tmp = tmp.transition().duration(this.get("parent").get("transitionSpeed"))
	}
	tmp
		.attr("width", function(d, i) {
			if('x' in d) {
				return self.get("width", d, i, false);
			} else {
				return d3.select(this).attr("width");
			}
		})
		.attr("fill", function(d, i) {
			if('color' in d) {
				return d['color'];
			} else {
				return d3.select(this).attr("fill");
			}
		})
		.attr("x", function(d, i) {
			if('x' in d) {
				return self.get('left', d, i, false);
			} else {
				return d3.select(this).attr("x");
			}
		})
		.attr("height", function(d, i) {
			if('y' in d) {
				return Math.abs(self.get('end', d, i, false));
			} else {
				return d3.select(this).attr("height");
			}
		})
		.attr("y", function(d, i) {
			if('y' in d) {
				var height = self.get('end', d, i, false);
				var start = self.get('start', d, i, false);
				if(height > 0) {
					return start-height;
				} else {
					return start;
				}
			} else {
				return d3.select(this).attr("y");
			}
		})
}

x3.bar.prototype.draw=function() {
	var self = this;

	if(this.firstrun == true) {
		if(this.datagroup == undefined) {
			return;
		}

		var tmp = this.datagroup.select('rect');
		tmp
			.attr("width", function(d, i) {
				if('x' in d) {
					return self.get("width", d, i, false);
				} else {
					return d3.select(this).attr("width");
				}
			})
			.attr("fill", function(d, i) {
				if('color' in d) {
					return d['color'];
				} else {
					return d3.select(this).attr("fill");
				}
			})
			.attr("x", function(d, i) {
				if('x' in d) {
					return self.get('left', d, i, false);
				} else {
					return d3.select(this).attr("x");
				}
			})
			.attr("height", function(d, i) {
				return 0;
			})
			.attr("y", function(d, i) {
				return self.get('start', d, i, true);
			})

		this._transition(tmp);
		this.firstrun = false;
	}

	if(this.container == undefined) {
		return;
	}
	var tmp = this.container.select('rect')
	this._transition(tmp);
}