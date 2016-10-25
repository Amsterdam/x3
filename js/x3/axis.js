/*
 *  Copyright (C) 2016 X Gemeente
 *                     X Amsterdam
 *                     X Onderzoek, Informatie en Statistiek
 *
 *  This Source Code Form is subject to the terms of the Mozilla Public
 *  License, v. 2.0. If a copy of the MPL was not distributed with this
 *  file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

x3.axis=function() {
	this.scale = null;
	this.axis = null;
	this.domain = [];
	this.group = null;
	this.link = null;
	this.orientation = 'left';
	this.textMargin = [0, 0, 0, 0];
	this.margin = [0, 0, 0, 0];
	this.textHeight = 0;
	this.nrticks = 0;
	this.bbox = {'height': 0, 'width': 0, 'x': 0, 'y': 0};
	this.type = 'linear';
	this.transition = false;
	
	/*
	 * Set default values
	 */
	this.set("bbox", this._getBBox);
	this.set("scale", []);
	this.set("tickInterval", this._getTickInterval);
	this.set("tickCount", this.__calcTicks);
	this.set("position", this._getPosition);
	this.set("tickWidth", this._getTickWidth);
	this.set("orientation", this._getorientation);
	this.set("type", this._getType);
	this.set("link", this._getLink);
	this.set("textMargin", this._getTextMargin);
	this.set("tickFormat", function(d, i) {
		return d;
	})
	this.set("bottomMargin", this._getBottomMargin);
	this.set("topMargin", this._getTopMargin);
	this.set("leftMargin", this._getLeftMargin);
	this.set("rightMargin", this._getRightMargin);

	/*
	 * Call these functions when one of
	 * the corresponding setters is used.
	 */
	this.trigger("scale", this._setScale);
	this.trigger("tickInterval", this._setTickInterval);
	this.trigger("orientation", this._setorientation);
	this.trigger("type", this._setType);
	this.trigger("link", this._setLink);
	this.trigger("sort", this._setSort);
}

x3.axis = x3.axis.extendsFrom(Function.extensions);

x3.axis.prototype._getTopMargin=function() {
	return this.margin[0];
}

x3.axis.prototype._getRightMargin=function() {
	return this.margin[1];
}

x3.axis.prototype._getBottomMargin=function() {
	return this.margin[2];
}

x3.axis.prototype._getLeftMargin=function() {
	return this.margin[3];
}

x3.axis.prototype._getTextMargin=function() {
	return this.textMargin;
}

x3.axis.prototype._getTickInterval=function() {
	return this.nrticks;
}

x3.axis.prototype._setTickInterval=function(i) {	
	this.nrticks = i;
	if(this.axis != null) {
		this.axis
			.tickFormat(function(d, i) {
				return self.get("tickFormat", d, i);
			});
		if(this.type == 'linear' && this._getTickInterval() > 0 ) {
			this.axis
				.ticks(this.__calcTicks())
		}
	}
}

x3.axis.prototype._getTickWidth=function() {
	if(this.type == 'linear') {
		var domain = this.scale.domain();
		return Math.abs(this._getPosition(domain[0])-this._getPosition(domain[0]+1));
	} else {
		return this.scale.rangeBand();
	}
}

x3.axis.prototype._getType=function() {
	return this.type;
}

x3.axis.prototype._setType=function(type) {
	this.type = type;
}

x3.axis.prototype._getorientation=function() {
	if(!args.validate(arguments, [])) {
		return;
	}

	return this.orientation;
}

x3.axis.prototype._setorientation=function(orientation) {
	this.orientation = orientation;
}

x3.axis.prototype._getPosition=function(i) {
	if(typeof(this.scale) != 'function') {
		return 0;
	}
	if(isNaN(this.scale(i))) {
		return 0;
	}

	if(this.orientation == 'right' || this.orientation == 'left') {
		return this.scale(i)+this.bbox.y;
	} else {
		return this.scale(i);
	}
}

x3.axis.prototype._setLink=function(func) {
	this.link = func;
}

x3.axis.prototype._getLink=function() {
	return this.link;
}

x3.axis.prototype._setSort=function(sort) {
	sort(this.scale.domain);
}

x3.axis.prototype._setScale=function(scale) {
	var self = this;
	this.domain = scale;
	if(this.type == 'ordinal') {
		this.domain = this.domain.reverse();
	}
	if(this.scale != null) {
		this.scale.domain(this.domain)
	}

	if(this.axis != null) {
		this.axis
			.scale(this.scale)
			.tickFormat(function(d, i) {
				return self.get("tickFormat", d, i);
			});

		if(this.type == 'linear' && this._getTickInterval() > 0) {
			this.axis
				.ticks(this.__calcTicks())
		}
	}
}

x3.axis.prototype.__calcTicks=function() {
	if(this.type == 'ordinal') {
		return 0;
	} else {
		var domain = this.scale.domain();
		var nr = domain.length;

		return Math.abs(domain[nr-1]-domain[0])/this.nrticks;
	}
}

x3.axis.prototype.__getSizes=function() {
	var self = this,
			numTicks = this.group.selectAll('text').size();

	this.textMargin = [0, 0, 0, 0];
	this.textHeight = 0;
	this.bbox = {'height': 0, 'width': 0, 'x': 0, 'y': 0};

	this.group.selectAll('text').each(function(d, i) {
		var x = this.getBBox();
		if(x.height > self.textHeight) {
			self.textHeight = x.height;
		}
		if(i == 0) {
			if(x.width > self.textMargin[3]) {
				self.textMargin[3] = x.width;
			}
		}
		if(i == numTicks-1) {
			x = this.getBBox();
			if(x.width > self.textMargin[1]) {
				self.textMargin[1] = x.width;
			}
		}
	});

	this.group.selectAll('.tick').each(function(d, i) {
		var x = this.getBBox().height;
		if(x > self.bbox.height) {
			self.bbox.height = x;
		}
	});
}

x3.axis.prototype.create=function() {
	var self = this,
			numTicks = 0;
			orientation = this.orientation;

	switch(this.type) {
		case 'linear':
			this.scale =
			d3.scale.linear()
				.domain(this.domain)
				.range([0, this.get("parent").get("innerWidth")]);
		break;
		case 'ordinal':
			this.scale =
			d3.scale.ordinal()
				.domain(this.domain)
				.rangeRoundBands([0, this.get("parent").get("innerHeight")], 0);
		break;
	}

	this.axis = d3.svg.axis()
		.scale(this.scale)
		.orient(orientation);
		
	if(this.type == 'linear' && this.nrticks > 0) {
		this.axis.ticks(this.__calcTicks());
	}

	this.group = this.get("parent").get("svg").append("g")
		.attr("class", "axis "+this.orientation)
		.call(this.axis);

   this.group.selectAll('.tick')
    .on('click', function(d, i) {
			self.call('click', d, i);
		})

	if(JSON.stringify(this.textMargin) === JSON.stringify([0, 0, 0, 0]) || this.textHeight == 0) {
		this.__wrap();
		this.__getSizes();
	}
}

x3.axis.prototype._getBBox=function() {
	return this.bbox;
}

x3.axis.prototype.__wrap=function() {
	var self = this;
	if(this.type == 'ordinal') {
		this.group.selectAll('text')
			.text(function(d, i) {
				if(typeof(d) == 'string') {
					return d.split('\n')[0];
				} else {
					return d;
				}
			});

		this.group.selectAll('text').each(function(d, i) {
			if(typeof(d) == 'string') {
				var text = d3.select(this),
					words = d.split('\n'),
					lineNumber = 0,
					lineHeight = 1.1,
					z = text.attr("x"),
					y = 0;

				if(words.length > 1 || ['left', 'right'].indexOf(self.orientation) >= 0) {
						text.text(null);
					
					for(y=0;y<words.length;y++) {

						word = words[y];
						text.append("tspan")
							.attr("x", z)
							.attr("y", 0)
							.attr("dy", (++lineNumber * lineHeight) + "em")
							.text(word);
					}
				} else {
					return d;
				}
			}
		});
		
		this.group.selectAll('text')
			.attr("transform", function(d, i) {
				var words = d.toString().split('\n');
				if(typeof(d) == 'string') {
					if(['left', 'right'].indexOf(self.orientation) >= 0) {
						return "translate(0, "+ -((this.getBBox().height/2)+3) + ")";
					} else {
						if(words.length > 1) {
							return "translate(0, 4.5)";
						} else {
							return d3.select(this).attr("transform");
						}
					}
				} else {
					return d3.select(this).attr("transform");
				}
			});
	}
}

x3.axis.prototype.redraw=function() {
	this.transition = true;
	this.draw();
	this.transition = false;
	
}

x3.axis.prototype.draw=function() {
	var self = this,
			height = 0,
			width = 0,
			tmp = null,
			orientation = this.orientation;

	tmp = this.group
	if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
		tmp = tmp.transition().duration(this.get("parent").get("transitionSpeed")).ease("linear")
	}
	tmp.call(this.axis);

	switch(orientation) {
		case 'top':
		case 'bottom':
			this.axis.orient(orientation);	

			var tmp = this.group
			if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
				tmp = tmp.transition().duration(this.get("parent").get("transitionSpeed")).ease("linear")
			}
			this.__wrap();
			this.__getSizes();

			this.bbox.y = (this.get("parent").get("innerHeight"));
			this.bbox.x = (this.textMargin[3]/2);
			if(typeof(this.get("link")) == 'number') {
				this.bbox.y = this.get("link");
			}
			if(typeof(this.get("bottomMargin")) == 'number') {
				this.bbox.y -= this.get("bottomMargin");
			}			
			if(typeof(this.get("leftMargin")) == 'number' && this.get("leftMargin") > 0) {
				this.bbox.x += this.get("leftMargin")-(this.textMargin[3]/2);
			}

			this.bbox.width = this.get("parent").get("innerWidth")-(this.bbox.x);
			if(this.type == 'linear') {
				this.bbox.width -= (this.textMargin[1]/2);
			}
			if(typeof(this.get("rightMargin")) == 'number' && this.get("rightMargin") != 0) {
				this.bbox.width -= (this.get("rightMargin")-(this.textMargin[1]/2));
			}
			switch(this.type) {
				case 'ordinal':
					this.scale
						.rangeRoundBands([this.bbox.width, 0]);
				break;
				case 'linear':
					this.scale
						.range([0, this.bbox.width]);			
				break;
			}

			this.group.selectAll('.tick')
				.attr("class", function(d, i) {
					return "tick tick-"+i;
				});

			tmp = this.group;
			if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
				tmp = tmp.transition().duration(this.get("parent").get("transitionSpeed"))
				/*
				 * Set the new classes once the old tick are removed
				 */
					.each("end", function() {
						window.setTimeout(function() {
							self.group.selectAll('.tick')
								.attr("class", function(d, i) {
									return "tick tick-"+i;
								});
						}, 1);
					});
			}
			tmp.attr("transform", function() {
				return "translate("+ self.bbox.x +","+ self.bbox.y +")";
			})
			.call(this.axis);
			this.__wrap();
		break;
		case 'right':
		case 'left':
			this.axis.orient(orientation);

			var tmp = this.group
			if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
				tmp = tmp.transition().duration(this.get("parent").get("transitionSpeed")).ease("linear")
			}
			this.__wrap();
			this.__getSizes();

			if(this.type == 'linear') {
				this.bbox.y = (this.textHeight/2)-1;
			} else {
				this.bbox.y = 0;
			}
			this.bbox.height = this.get("parent").get("innerHeight");	

			if(typeof(this.get("topMargin")) == 'number') {
				this.bbox.y += this.get("topMargin");
			}
			if(this.type == 'linear') {
				this.bbox.height -= (this.bbox.y+((this.textHeight/2)-1));
			}
			if(typeof(this.get("bottomMargin")) == 'number' && this.get("bottomMargin") != 0) {
				if(this.type == 'linear') {
					this.bbox.height -= this.get("bottomMargin")-((this.textHeight/2)-1);
				} else {
					this.bbox.height -= this.get("bottomMargin");
				}
			}

			switch(this.type) {
				case 'ordinal':
					this.scale
						.rangeRoundBands([this.bbox.height, 0]);
				break;
				case 'linear':
					this.scale
						.range([this.bbox.height, 0]);	
				break;
			}

			this.group.selectAll('.tick')
				.each(function(d, i) {
					var x = this.getBBox().width;
					if(x > self.bbox.width) {
						self.bbox.width = x;
					}
				})
				.attr("class", function(d, i) {
					return "tick tick-"+i;
				});

			this.bbox.x = this.bbox.width;
			if(typeof(this.get("link")) == 'number') {
				this.bbox.x = this.get("link");
			}

			tmp = this.group;
			if(this.get("parent").get("transitionSpeed") > 0 && this.transition == true) {
				tmp = tmp.transition().duration(this.get("parent").get("transitionSpeed"))
				/*
				 * Set the new classes once the old tick are removed
				 */
					.each("end", function() {
						window.setTimeout(function() {
							self.group.selectAll('.tick')
								.attr("class", function(d, i) {
									return "tick tick-"+i;
								});
						}, 1);
					});
			}
			tmp
				.attr("transform", function() {
					return "translate("+ (self.bbox.x) +","+ self.bbox.y +")";
				})
				.call(this.axis)

			this.__wrap();		
		break;
	}
}