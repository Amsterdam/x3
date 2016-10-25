/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

x3.line=function() {
	this.transition = false;	
	this.data = [];
	this.lines = [];

	this.id = this.uniqID();
	
	/*
	 * Call these functions when one of
	 * the corresponding setters is used.
	 */
	this.trigger("data", this._setData);
	
	/*
	 * Set default values
	 */
	this.set("position-x", 0);
	this.set("position-y", 0);
	this.set("order", 0);
}

x3.line = x3.line.extendsFrom(Function.extensions);

x3.line.prototype.create=function() {
	var self = this;

	this.group = this.get("parent").get("svg").selectAll('#'+this.id)
		.data([null]).enter()
			.append('g')
				.attr('id',this.id)

	this.line = d3.svg.line()
		.interpolate("monotone")
			.x(function(d, i) {
				return self.get("position-x", d, i);
			})
			.y(function(d, i) { return self.get("position-y", d, i); })
			.defined( function(d, i) { return !isNaN(d.y); });
}

x3.line.prototype._setData=function(data) {
	var self = this;
	for(var x in data) {
		var match1 = false;
		for(var y in this.data) {
			if(this.data[y]['id'] == data[x]['id']) {
				match1 = true;
				for(var z in data[x]['points']) {
					var match2 = false;
					for(var a in this.data[y]['points']) {
						if(this.data[y]['points'][a]['x'] == data[x]['points'][z]['x']) {
							this.data[y]['points'][a]['y'] = data[x]['points'][z]['y'];
							match2 = true;
							break;
						}
					}
					if(match2 == false) {
						this.data[y]['points'].push(data[x]['points'][z]);
					}
				}
				/*for(var z in this.data[y]['points']) {
					var match2 = false;
					for(var a in data[x]['points']) {
						if(this.data[y]['points'][z]['x'] == data[x]['points'][a]['x']) {
							match2 = true;
							break;
						}
					}
					if(match2 == false) {
						this.data[x]['points'][z]['y'] = NaN;
					}
				}*/
				for(z in data[x]) {
					if(z != 'points') {
						this.data[y][z] = data[x][z];
					}
				}
				break;
			}
		}
		if(match1 == false) {
			this.data.push(data[x]);
		}
	}
	for(var y in this.data) {
		if(this.data[y]['points'].length > 1) {
			this.data[y]['points'].sort(function(a, b) {
				return self.get("order", a, b);
			});
		}
	}
}

x3.line.prototype.redraw=function() {
	this.transition = true;
	this.draw();
	this.transition = false;
}

x3.line.prototype.draw=function() {
	var self = this;

	for(var x in this.data) {
		if(!(this.data[x]['id'] in this.lines)) {
			var line = this.lines[this.data[x]['id']] = d3.select('#'+this.id)
				.append("path")
					.attr("class", '_'+this.data[x]['id'].toString())
					.attr("stroke", this.data[x]['color'])
					.attr("stroke-width",	this.data[x]['width'])
					.attr("fill", "none")

			line
				.data([this.data[x]])
				
			line
				.attr("d", function(d, i) {
					return self.line(d['points']);
				})
				.attr("stroke", function(d, i) {
					return d['color'];
				})
				.attr("stroke-width", function(d, i) {
					return d['width'];
				})
				.attr("class", function(d, i) {
					return '_'+d['id'].toString();
				})
				
			if(this.transition == true) {
				var totalLength = line.node().getTotalLength();

				line
					.attr("stroke-width", function(d, i) {
						return d['width'];
					})
					.attr("stroke-dasharray", totalLength + " " + totalLength)
					.attr("stroke-dashoffset", totalLength)
						.transition().ease("linear").duration(this.get("parent").get("transitionSpeed"))
							.attr("stroke-dashoffset", 0);
			}
		} else {
			var tmp = line = this.lines[this.data[x]['id']]
				.data([this.data[x]])

			line
				.attr("d", function(d, i) {
					var line = d3.select(this);
					return line.attr("d") != null ? line.attr("d") : self.line([d['points'][0]])
				})

			if(this.transition == true) {
				tmp = tmp.transition().ease("linear").duration(this.get("parent").get("transitionSpeed"))
			}

			tmp
				.attr("stroke", function(d, i) {
					return d['color'];
				})
				.attr("stroke-width", function(d, i) {
					return d['width'];
				})
				.attr("class", function(d, i) {
					return '_'+d['id'].toString();
				})
			if(this.transition == false) {
				line.attr("d", function(d, i) {
					return self.line(d['points']);
				});
			} else if(line.attr("d") != this.line(this.data[x]['points'])) {
				tmp
					.attrTween("d", function(d, i) {
						var obj = d3.select(this),
							a = obj.attr("d"),
							b = self.line(d['points']),
							precision = 4,
							path0 = this,
							path1 = path0.cloneNode(),
							n0 = path0.getTotalLength();
							n1 = (path1.setAttribute("d", b), path1).getTotalLength();
							
						line
							.attr("stroke-dasharray", null)
							.attr("stroke-dashoffset", null)

						// Uniform sampling of distance based on specified precision.
						var distances = [0],
							i = 0,
							dt = precision / Math.max(n0, n1);
						while((i += dt) < 1) {
							distances.push(i);
						}
						distances.push(1);

						// Compute point-interpolators at each distance.
						var points = distances.map(function(t) {
							var p0 = path0.getPointAtLength(t * n0),
									p1 = path1.getPointAtLength(t * n1);
							return d3.interpolate([p0.x, p0.y], [p1.x, p1.y]);
						});
						return function(t) {
							return t < 1 ? "M" + points.map(function(p) { return p(t); }).join("L") : b;
						};
					});
			}
		}
	}	
}