/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function luminance(r, g, b) {
	var a = [r,g,b].map(function(v) {
		v /= 255;
		return (v <= 0.03928) ? v / 12.92 : Math.pow(((v+0.055)/1.055), 2.4);
	});
	return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	] : null;
}

x3.pieText=function() {
	var self = this;
	this.parent = null;
	this.transition = false;
	
	this.colors = d3.scale.category20();

	this.id = this.uniqID();

	this.set("text", this._getText);
	this.set("key", "value");
}

x3.pieText = x3.pieText.extendsFrom(Function.extensions);

x3.pieText.prototype._getText=function(d, i) {
	return d;
}

x3.pieText.prototype.create=function() {
	var self = this;
}

x3.pieText.prototype.redraw=function() {
	this.transition = true;
	this.draw();
	this.transition = false;
}

x3.pieText.prototype._transition=function() {
	var self = this;

	tmp = this.get("parent").get("container").select("text")
	if(this.get("parent").get("parent").get("transitionSpeed") > 0 && this.transition == true) {
		tmp.transition().duration(this.get("parent").get("parent").get("transitionSpeed"))
			.tween("text", function(d, i) {
				var obj = this;
				var oldText = this._text;
				var x = d3.interpolate(oldText, d[self.get("key")]);
				var k = d3.interpolate(this._current, d);
				return function(t) {
					if((k(t)['endAngle']-k(t)['startAngle']) > 0.5) {
						d3.select(obj).text(self.get("text", Math.round(x(t)), i));
					} else {
						d3.select(obj).text("");
					}
				};
			})
			.attrTween("transform", function(d) {
				var obj = this;
				var i = d3.interpolate(this._current, d);

				this._current = i(0);
				return function(t) {
					var pos = self.get("parent").get("arc").centroid(i(t));

					return "translate(" + (pos[0]*1.25) + ", "+ (pos[1]*1.25) + ")";
				};
			})
			.attr("class", function(d, i) {
				var rgb = [0, 0, 0];
				if('color' in d['data']) {
					rgb = hexToRgb(d['data']['color']);
					return (((luminance(255, 255, 255) + 0.05) / (luminance(rgb[0], rgb[1], rgb[2]) + 0.05)) < 1.5) ? 'dark' : 'light';
				} else {
					return d3.select(this).attr("class");
				}
			})
	} else {
		tmp
			.text(function(d, i) {
				this._text = d[self.get("key")];
				return self.get("text", d[self.get("key")], i);
			})
			.attr("class", function(d, i) {
				var rgb = [0, 0, 0];
				if('color' in d['data']) {
					rgb = hexToRgb(d['data']['color']);
					return (((luminance(255, 255, 255) + 0.05) / (luminance(rgb[0], rgb[1], rgb[2]) + 0.05)) < 1.5) ? 'dark' : 'light';
				} else {
					return d3.select(this).attr("class");
				}
			})
			.attr("transform", function(d) {
				d.outerRadius = self.radius;
				d.innerRadius = self.radius/2;
				var pos = self.get("parent").get("arc").centroid(d);

				return "translate(" + (pos[0]*1.25) + ", "+ (pos[1]*1.25) + ")";
			})
	}
}

x3.pieText.prototype.draw=function() {
	var self = this;

	this._transition();

	if(this.get("parent").get("datagroup") == undefined) {
		return;
	}

	var tmp = this.get("parent").get("datagroup").append("text")
		.text(function(d, i) {
			this._text = d[self.get("key")];
			return self.get("text", d[self.get("key")], i);
		})
		.attr("class", function(d, i) {
			var rgb = [0, 0, 0];
			if('color' in d['data']) {
				rgb = hexToRgb(d['data']['color']);
				return (((luminance(255, 255, 255) + 0.05) / (luminance(rgb[0], rgb[1], rgb[2]) + 0.05)) < 1.5) ? 'dark' : 'light';
			} else {
				return d3.select(this).attr("class");
			}
		})
		.attr("text-anchor", "middle")
		.attr("transform", function(d) {
			d.outerRadius = self.get("parent").radius;
			d.innerRadius = self.get("parent").radius/2;
			var pos = self.get("parent").get("arc").centroid(d);
			return "translate(" + (pos[0]*1.25) + ", "+ (pos[1]*1.25) + ")";
		})
		.each(function(d) { this._current = d; });

	if(!(this.get("parent").get("parent").get("transitionSpeed") > 0 && this.transition == true)) {
		this._transition();
	}
}
