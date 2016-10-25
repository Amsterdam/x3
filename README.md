# x3

A D3 library written by the local government of Amsterdam. x3 is created to program D3 visualisations faster. Commonly used elements like axis, bars, lines are wrapped in small modules. This allows developers to reuse existing elements without loosing the flexibility of D3.

x3 matches the D3 workflow as much as possible so D3 developers can use x3 with ease.

## API

The x3 API consists of the main x3 class that can be extended with various modules. Each module can be adapted by using predefined setters (`set`) and getters (`get`), and these can be stacked just like in D3:
```javascript
    x3
        .set("width", 100)
        .set("height", 100);
```

Settings a property of an x3 module is done by passing a value or a function, again, just like with D3: 

```javascript
    x3
        .set("parent", value);
```

or

```javascript
    x3
        .set("parent", function() { return value; });
```

Retrieving a property is done in the same way:

```javascript
    x3.get("parent");
```

If a value is `set`, it can be retrieved again with the corresponding `get`. Each module has a default `set` of values which can be retrieved by using the corresponding `get` without having to call `set` first.

x3 also incoorporates an observer pattern which means that multiple events can be registered for specific x3 events. Registration is done by calling the `on` function and the same event is executed with the `call` function:

```javascript
    x3.on("draw", function() {
        console.log(this == x3); // true
    });
    x3.call("draw");
```

When registering a function to the `on` event, `this` will point to the class that triggered the event. Listeners can be triggered prioritized so certain listeners can be executed before others on each trigger.

## Getting started

Let's walk through the creation of a visualisation step by step to better understand how x3 works.

### Base

The first thing x3 needs is an element to work in.

```html
<!DOCTYPE html>
<script src="../js/d3.min.js"></script>
<script src="../js/function.js"></script>
<script src="../js/function/extensions.js"></script>
<script src="../js/x3.js"></script>
<script type="text/javascript">
window.onload=function () { };
</script>
</head>
<body>
<div id="vis"></div>
</body>
</html>
```

_The following steps will all take place in the `window.onload` function._

After we have set our base layout we want to initialize x3 inside our destination element.

```javascript
    var vis = new x3();
    vis.appendTo('#vis');
    vis.draw();
```

What we have done is initializing a new x3 instance and telling x3 to append itself to the `#vis` div. The draw call will tell x3 to draw everything we have initialized until this step.

### First axis

If we want to add one or more axis to our visualisation we use the x3 axis module. This needs to be loaded first (after we loaded x3):

```html
<script src="../js/x3/axis.js"></script>
```

```javascript
	var vis = new x3();
	var axisY = new x3.axis();
	
	axisY
		.set("orientation", "left")
		.set("type", "linear");
	
	vis.on("create", function() {
		axisY.set("parent", this);
		axisY.create();
	}, 0);

	vis.on("draw", function() {
		axisY.draw();
	}, 0);
	vis.appendTo("#vis");

	axisY.set("scale", [0, 10]);

	vis.draw();
```

In this step we have done a few new things.
1. We initialized the `x3.axis` module to create a new axis.
2. We have set the `orientation` to left and the `type` to linear. As with D3, the setters can be stacked.
3. We have added a listener to the `create` event of the main visualisation. Inside the create event we have connected the axis to our main visualisation called `vis` or in this case using the `this` variable which also points to the `vis` object. The last numeric argument of our listener tells x3 in what order the different listeners should be called.
4. We have added a listener to the draw event of the main visualisation. So whenever the main visualisation is drawn the axis is drawn as well.
5. The scale of the axis it set from 0 to 10.

_We have to make sure that the on create event is initialized before the appendTo function._

### Second axis

```javascript
	var vis = new x3();
	var axisY = new x3.axis();
	var axisX = new x3.axis();
	
	axisY
		.set("orientation", "left")
		.set("type", "linear");

	axisX
		.set("orientation", "bottom")
		.set("type", "linear");
	
	vis.on("create", function() {
		axisY.set("parent", this);
		axisY.create();
		axisX.set("parent", this);
		axisX.create();
	}, 0);

	vis.on("draw", function() {
		axisY.draw();
		axisX.draw();
		axisY.draw();
		axisX.draw();
	}, 0);
	vis.appendTo("#vis");

	axisY.set("scale", [0, 10]);
	axisX.set("scale", [0, 10]);

	vis.draw();
```

Adding another axis is as simple as copying all the information of our first axis called `axisY` to a second axis called `axisX`. The main difference is that we want our second axis to be position at the bottom. However, when we run this code, we will see that the bottom axis is not visible. To make the second axis visible we have to reduce the top position by the actual height of the axis. This can be done by setting the bottomMargin of the axis.

_This code is placed before the `vis.draw();`_

```javascript
    axisX.set("bottomMargin", function(d, i) {
        return this.get("bbox").height;
    });
```

As we see again, the `this` argument points to the calling object. This is the same behavior as in D3. The `x3.axis` module will create a bbox object that will contain the regular bbox values x, y, width, and height of the axis element. In this case the width and height define the width and height of the axis including the labels and ticks.

Running this code will show us two axis. A left axis and a right axis individually positioned in our viewbox. This is most likely still not what we want. What we want is two axis that will position themselves in relation to the other. In order to achieve this, we have to position the axis relative to each other.

We will first tell the left axis to consider the bottom margin of the bottom axis.

```javascript
	axisY.set("bottomMargin", function(d, i) {
		return axisX.get("bbox").height;
	});
```

As a result we will see that the left axis bottom line positions nicely to the bottom axis line.

Secondly, we want the bottom axis left line to position nicely to the left axis line. We therefor tell the bottom axis to start at the same position as the left axis starts.

```javascript
	axisX.set("leftMargin", function(d, i) {
		return axisY.get("bbox").width;
	});
```

We will now see that both left and bottom axis will position nicely on the 0.0 position. Although both axis align nicely we still haven't really connected them, meaning, we still haven't told the bottom axis to actually align itself to the 0 value of the left axis and vice versa.

To link the bottom axis to the left axis we add the following piece of code.

```javascript
	axisX.set("link", function(d, i) {
		return axisY.get("position", 0)+this.get("bbox").height;
	});
```

We have now used the link parameter to tell our bottom axis how it should link to the left axis. Not to the absolute position in our viewbox, but to the relative position of the left axis. We do have to consider that we have made the left axis smaller by the height of the bottom axis, so the position on the left axis has also shifted with the same amount.

We can do the same thing with the left axis.

```javascript
	axisY.set("link", function(d, i) {
		return axisX.get("position", 0)+axisY.get("bbox").width;
	});
```

Now both axis are linked in such a way that whenever one axis changes values or position, the other axis will follow. We test this by changing the linked values from 0.0 to 0.5 by using the following piece of code instead of the previous call:
```javascript
	axisX.set("link", function(d, i) {
		return axisY.get("position", 5)+this.get("bbox").height;
	});
```

### Transitions

All x3 modules can animate their transitions. To use transition animations, we use the `redraw` function instead of `draw`. That also means we have to implement a `redraw` listener.

```javascript
	vis.on("redraw", function() {
		axisY.redraw();
		axisX.redraw();
		axisY.redraw();
		axisX.redraw();
	}, 0);
```

Now let's test our transition by letting the axis align on a different coordinate then on 0.0 by adding the following pieces after our `draw` call.

```javascript
	axisX.set("link", function(d, i) {
		return axisY.get("position", 5)+this.get("bbox").height;
	});

	vis.redraw();
```

You will now see that our axis wil start on coordinate 0.0 and then animate it's way to coordinate 0.5.

To change the speed of our animation, we can set the `transitionSpeed` to a different value:

```javascript
    vis.set("transitionSpeed", 5000);
```

Setting the `transitionSpeed` before a `redraw` call will let the animation take place in the new amount of time.

Let's change the scale of one of our axis to see how this animates when using x3.

```javascript
	axisY.set("scale", [-10, 100]);
```

When looking at the new result, notice how x3 will automatically calculate the width of the new left axis so space is created for the additional zero's we need when we go from -10 to 100. The width of the bottom axis is also automatically reduced to keep both axis aligned.

### Full example until now

```javascript
	var vis = new x3();
	var axisY = new x3.axis();
	var axisX = new x3.axis();
	
	axisY
		.set("orientation", "left")
		.set("type", "linear");

	axisX
		.set("orientation", "bottom")
		.set("type", "linear");
	
	vis.on("create", function() {
		axisY.set("parent", this);
		axisY.create();
		axisX.set("parent", this);
		axisX.create();
	}, 0);

	vis.on("draw", function() {
		axisY.draw();
		axisX.draw();
		axisY.draw();
		axisX.draw();
	}, 0);

	vis.on("redraw", function() {
		axisY.redraw();
		axisX.redraw();
		axisY.redraw();
		axisX.redraw();
	}, 0);

	vis.appendTo("#vis");

	axisX
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return this.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisY.get("position", 0)+this.get("bbox").height;
		})
		.set("leftMargin", function(d, i) {
			return axisY.get("bbox").width;
		});

	axisY
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return axisX.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisX.get("position", 0)+axisY.get("bbox").width;
		});

	vis.draw();
	
	axisX.set("link", function(d, i) {
		return axisY.get("position", 5)+this.get("bbox").height;
	});

	axisY.set("scale", [-10, 100]);

	vis.set("transitionSpeed", 5000);
	
	vis.redraw();
```

### Heads up

What we have seen from this first start is that x3 makes it easier to create a visualisation with axis that also animate, but x3 doesn't make it too easy. This means that x3 doesn't make decisions for us. We are still required to tell x3 how to position or link certain elements. This will retain the balance between modularity, flexibility and ease of use. 

### Adding bars

To add bars we first need to load the `x3.bar` module.

```javascript
<script src="../js/x3/bar.js"></script>
```

We then initialize our bar in the same way as we saw with our axis.

```javascript
    var bar = new x3.bar();
```

And in the same way as with our axis we add the bars to the draw, redraw, and create events.

The next step is that we add some data to our bars so we know what to show.

```javascript
    bar.set("data", [
        { 'x': 0, 'y': 10 },
        { 'x': 5, 'y': 7 }
    ]);
```

We now have a bar module with some data, but we haven't told the bars module how to draw its bars. Just like with the axis we have to tell the bars module explicitly to what other modules we want to connect.

```javascript
    bar
		.set("width", function(d, i, f) {
			return axisX.get("tickWidth");
		})
		.set("left", function(d, i, f) {
			return (axisX.get("position", d['x'])+axisX.get("bbox").x)-(axisX.get("tickWidth")/2);
		});
		.set("start", function(d, i, f) {
			return axisY.get("position", 0);
		})
		.set("end", function(d, i, f) {
			return axisY.get("bbox").height+axisY.get("bbox").y-axisY.get("position", d['y']);
		})
```
We have done a few things here
1. The width of the bars should match the width of the ticks of the bottom axis.
2. The left position of each bar should start half of the width of the tick before the ticks.
3. The start position of each bar should match the 0 of the left axis.
4. The end position of each bar should match the corresponding value on the left axis.

### Full example until now

```javascript
	var vis = new x3();
	var axisY = new x3.axis();
	var axisX = new x3.axis();
	var bar = new x3.bar();
	
	axisY
		.set("orientation", "left")
		.set("type", "linear");

	axisX
		.set("orientation", "bottom")
		.set("type", "linear");
	
	vis.on("create", function() {
		axisY.set("parent", this);
		axisY.create();
		axisX.set("parent", this);
		axisX.create();
		bar.set("parent", this);
		bar.create();
	}, 0);

	vis.on("draw", function() {
		axisY.draw();
		axisX.draw();
		axisY.draw();
		axisX.draw();
		bar.draw();
	}, 0);

	vis.on("redraw", function() {
		axisY.redraw();
		axisX.redraw();
		axisY.redraw();
		axisX.redraw();
		bar.redraw();
	}, 0);

	vis.appendTo("#vis");

	axisX
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return this.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisY.get("position", 0)+this.get("bbox").height;
		})
		.set("leftMargin", function(d, i) {
			return axisY.get("bbox").width;
		});

	axisY
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return axisX.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisX.get("position", 0)+axisY.get("bbox").width;
		});

	bar
		.set("data", [
			{ 'x': 1, 'y': 10 },
			{ 'x': 5, 'y': 7 }
		])
		.set("width", function(d, i, f) {
			return axisX.get("tickWidth");
		})
		.set("left", function(d, i, f) {
			return (axisX.get("position", d['x'])+axisX.get("bbox").x)-(axisX.get("tickWidth")/2);
		})
		.set("start", function(d, i, f) {
			return axisY.get("position", 0);
		})
		.set("end", function(d, i, f) {
			return axisY.get("bbox").height+axisY.get("bbox").y-axisY.get("position", d['y']);
		})
		
	vis.draw();
	
	axisX.set("link", function(d, i) {
		return axisY.get("position", 5)+this.get("bbox").height;
	});

	axisY.set("scale", [-10, 100]);

	vis.set("transitionSpeed", 5000);
	
	vis.redraw();
```

### Ordinal scales

Using ordinal scales is very similar to using linear scales (and to how D3 implements both).

```javascript
    axisX.set("type", "ordinal");
```
Making an ordinal scale is as simple as changing the type to ordinal instead of linear. The elements of the scale array are however interpret as groups. So if we keep our original scale as in the first examples `[0, 10]`, the ordinal scale will just create two ticks: a 0 and a 10.

Were the linear scale ticks will be position fully left and fully right, the ordinal scale ticks will be position in the middle of the scale:

Linear scale from 0 - 3
```
0 1 2 3
|_|_|_|
```

Ordinal scale from 0 - 3
```
 0 1 2 3
_|_|_|_|_
```

This means that the if we want to position the left axis on one of the ticks we have to take into account the width of a bottom axis tick:

```javascript
	axisY.set("link", function(d, i) {
		return axisX.get("position", 0)+axisY.get("bbox").width+axisX.get("tickWidth")/2
	});
```

We also have to take into account that the ordinal axis does not have intermediate ticks. So only the individual groups that were assigned in the beginning will allow their position to be retrieved. This means that the following won't work:

```javascript
    axisX
        .set("type", "ordinal")
        .set("scale", [0, 10]);
    axisY
        .set("link", function(d, i) {
            return axisX.get("position", 5);
        });
```

The ordinal scale does not plot the 5 in between the 0 and 10 as the linear scale does, it will only plot the two groups 0 and 10. So you can only retrieve the position of the 0 and the 10.

For the rest, the ordinal scale will just behave similar as the linear scale.

### Full example with an ordinal scale and bars

```javascript
	var vis = new x3();
	var axisY = new x3.axis();
	var axisX = new x3.axis();
	var bar = new x3.bar();
	
	axisY
		.set("orientation", "left")
		.set("type", "linear");

	axisX
		.set("orientation", "bottom")
		.set("type", "ordinal");
	
	vis.on("create", function() {
		axisY.set("parent", this);
		axisY.create();
		axisX.set("parent", this);
		axisX.create();
		bar.set("parent", this);
		bar.create();
	}, 0);

	vis.on("draw", function() {
		axisY.draw();
		axisX.draw();
		axisY.draw();
		axisX.draw();
		bar.draw();
	}, 0);

	vis.on("redraw", function() {
		axisY.redraw();
		axisX.redraw();
		axisY.redraw();
		axisX.redraw();
		bar.redraw();
	}, 0);

	vis.appendTo("#vis");

	axisX
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return this.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisY.get("position", 0)+this.get("bbox").height;
		})
		.set("leftMargin", function(d, i) {
			return axisY.get("bbox").width;
		});

	axisY
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return axisX.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisX.get("position", 0)+axisY.get("bbox").width;
		});

	bar
		.set("data", [
			{ 'x': 0, 'y': 10 },
			{ 'x': 10, 'y': 7 }
		])
		.set("width", function(d, i, f) {
			return axisX.get("tickWidth")/2;
		})
		.set("left", function(d, i, f) {
			return (axisX.get("position", d['x'])+axisX.get("bbox").x)+(axisX.get("tickWidth")/4);
		})
		.set("start", function(d, i, f) {
			return axisY.get("position", 0);
		})
		.set("end", function(d, i, f) {
			return axisY.get("bbox").height+axisY.get("bbox").y-axisY.get("position", d['y']);
		})
		
	vis.draw();
	
	axisX.set("link", function(d, i) {
		return axisY.get("position", 5)+this.get("bbox").height;
	});

	axisY.set("scale", [-10, 100]);

	vis.set("transitionSpeed", 5000);
	
	vis.redraw();
```

### Stacked bar

Creating a stacked bar is similar to creating a regular bar graph, but it requires some creativity. For this example we are going to reuse the previous bar code and adapt it to create a stacked bar. The first step is to change the input dataset:

```javascript
	bar
		.set("data", [
			{ 'x': 1, 'y': [0, 3], 'color': '#F00' },
			{ 'x': 1, 'y': [3, 6], 'color': '#0F0' },
			{ 'x': 5, 'y': [2, 5], 'color': '#F00' },
			{ 'x': 5, 'y': [5, 8], 'color': '#0F0' }
		]);
```

So instead of a single `y` value, we now have assigned two `y` values. One for the start of your bar and one for the end. There are also duplicate `x` values because we are going to place multiple bars on a single x tick.

In the previous example we used a static base point. In this example we are going to use a dynamic based point. We've added color to actually see the two bar pieces.

```javascript
    bar
		.set("start", function(d, i, f) {
			return axisY.get("position", d['y'][0]);
		})
		.set("end", function(d, i, f) {
			return axisY.get("position", d['y'][0])-axisY.get("position", d['y'][1]);
		})
		.set("color", function(d, i, f) {
			return d['color'];
		});
```

That's all. The single bar graph has now been converted in a stacked bar.

### Full example of a stacked bar on linear scales

```javascript
	var vis = new x3();
	var axisY = new x3.axis();
	var axisX = new x3.axis();
	var bar = new x3.bar();

	axisY
		.set("orientation", "left")
		.set("type", "linear");

	axisX
		.set("orientation", "bottom")
		.set("type", "linear");

	vis.on("create", function() {
		axisY.set("parent", this);
		axisY.create();
		axisX.set("parent", this);
		axisX.create();
		bar.set("parent", this);
		bar.create();
	}, 0);

	vis.on("draw", function() {
		axisY.draw();
		axisX.draw();
		axisY.draw();
		axisX.draw();
		bar.draw();
	}, 0);

	vis.on("redraw", function() {
		axisY.redraw();
		axisX.redraw();
		axisY.redraw();
		axisX.redraw();
		bar.redraw();
	}, 0);

	vis.appendTo("#vis");

	axisX
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return this.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisY.get("position", 0)+this.get("bbox").height;
		})
		.set("leftMargin", function(d, i) {
			return axisY.get("bbox").width;
		});

	axisY
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return axisX.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisX.get("position", 0)+axisY.get("bbox").width;
		});

	bar
		.set("data", [
			{ 'x': 1, 'y': [0, 3], 'color': '#F00' },
			{ 'x': 1, 'y': [3, 6], 'color': '#0F0' },
			{ 'x': 5, 'y': [2, 5], 'color': '#F00' },
			{ 'x': 5, 'y': [5, 8], 'color': '#0F0' }
		])
		.set("width", function(d, i, f) {
			return axisX.get("tickWidth");
		})
		.set("left", function(d, i, f) {
			return (axisX.get("position", d['x'])+axisX.get("bbox").x)-(axisX.get("tickWidth")/2);
		})
		.set("start", function(d, i, f) {
			return axisY.get("position", d['y'][0]);
		})
		.set("end", function(d, i, f) {
			return axisY.get("position", d['y'][0])-axisY.get("position", d['y'][1]);
		})
		.set("color", function(d, i, f) {
			return d['color'];
		});

	vis.draw();
```

### Multiple bars per tick

As with the stacked bar, adding multiple bars on the same tick can also be done with the x3.bar module. To easily identify the different bars that belong to the same tick, we've added a helper variable called `g`. We are going to use this g value to change the position of our bars.

```javascript
	bar
		.set("data", [
			{ 'g': 1, 'x': 1, 'y': 3, 'color': '#F00' },
			{ 'g': 2, 'x': 1, 'y': 6, 'color': '#0F0' },
			{ 'g': 1, 'x': 5, 'y': 5, 'color': '#F00' },
			{ 'g': 2, 'x': 5, 'y': 8, 'color': '#0F0' }
		])
		.set("width", function(d, i, f) {
			return axisX.get("tickWidth")/2;
		})
		.set("left", function(d, i, f) {
			if(d['g'] == 1) {
				return (axisX.get("position", d['x'])+axisX.get("bbox").x)-(axisX.get("tickWidth"))+axisX.get("tickWidth")/2;
			} else {
				return (axisX.get("position", d['x'])+axisX.get("bbox").x);
			}
		})
		.set("start", function(d, i, f) {
			return axisY.get("position", 0);
		})
		.set("end", function(d, i, f) {
			return axisY.get("position", 0)-axisY.get("position", d['y']);
		})
		.set("color", function(d, i, f) {
			return d['color'];
		});
```

As can be seen, the bar width has been reduced by a half so now two bars will fit in the same space. The left positioning is now dependent on the g variable. We position our first bar to the left of our tick, and our second bar to the right.

### Full example of a multiple bars per tick on linear scales

```javascript
	var vis = new x3();
	var axisY = new x3.axis();
	var axisX = new x3.axis();
	var bar = new x3.bar();

	axisY
		.set("orientation", "left")
		.set("type", "linear");

	axisX
		.set("orientation", "bottom")
		.set("type", "linear");

	vis.on("create", function() {
		axisY.set("parent", this);
		axisY.create();
		axisX.set("parent", this);
		axisX.create();
		bar.set("parent", this);
		bar.create();
	}, 0);

	vis.on("draw", function() {
		axisY.draw();
		axisX.draw();
		axisY.draw();
		axisX.draw();
		bar.draw();
	}, 0);

	vis.on("redraw", function() {
		axisY.redraw();
		axisX.redraw();
		axisY.redraw();
		axisX.redraw();
		bar.redraw();
	}, 0);

	vis.appendTo("#vis");

	axisX
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return this.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisY.get("position", 0)+this.get("bbox").height;
		})
		.set("leftMargin", function(d, i) {
			return axisY.get("bbox").width;
		});

	axisY
		.set("scale", [0, 10])
		.set("bottomMargin", function(d, i) {
			return axisX.get("bbox").height;
		})
		.set("link", function(d, i) {
			return axisX.get("position", 0)+axisY.get("bbox").width;
		});

	bar
		.set("data", [
			{ 'g': 1, 'x': 1, 'y': 3, 'color': '#F00' },
			{ 'g': 2, 'x': 1, 'y': 6, 'color': '#0F0' },
			{ 'g': 1, 'x': 5, 'y': 5, 'color': '#F00' },
			{ 'g': 2, 'x': 5, 'y': 8, 'color': '#0F0' }
		])
		.set("width", function(d, i, f) {
			return axisX.get("tickWidth")/2;
		})
		.set("left", function(d, i, f) {
			if(d['g'] == 1) {
				return (axisX.get("position", d['x'])+axisX.get("bbox").x)-(axisX.get("tickWidth"))+axisX.get("tickWidth")/2;
			} else {
				return (axisX.get("position", d['x'])+axisX.get("bbox").x);
			}
		})
		.set("start", function(d, i, f) {
			return axisY.get("position", 0);
		})
		.set("end", function(d, i, f) {
			return axisY.get("position", 0)-axisY.get("position", d['y']);
		})
		.set("color", function(d, i, f) {
			return d['color'];
		});

	vis.draw();
```

### x3

__getters and setters__

* parent: the id or class of the DOM element where x3 is initialized in.
* innerWidth: the calculated inner width of the viewport.
* innerHeight: the calculated inner height of the viewport.
* width: the outer width of the viewport.
* minWidth: the minimal width of the viewport.
* maxWidth: the maximum width of the viewport.
* height: the outer height of the viewport.
* minHeight: the minimal height of the viewport.
* maxHeight: the maximum height of the viewport.
* svg: root SVG element.
* transitionSpeed: the transition speed.
* margin: 4 (TLBR) digits array with the viewport margin.

__functions__

* draw: draw the visualisation and triggers the `draw` event.
* redraw: redraws the visualisation and triggers the `redraw` event.
* appendTo: tell x3 to append into this DOM element and triggers the `create` event.

__events__
* create _(has to be initialized before calling the appendTo function)_
* draw
* redraw

The redraw function assumes that you want to visualize the changes by using a transition, the draw assume that all changes should be made instantaneously.

__container and datagroup__

Several modules use a `container` and `datagroup` logic. This example shows how these are created:

```javascript
this.container = this.select("parent").selectAll("rect");
this.datagroup = this.container.data(data);
```

So in this case, the container points to all selected `rect`'s. The datagroup points to the data assignment on the container. So if you want to manually add children to a module bases on the d3 data trigger, use the datagroup module. If you want to ignore these data triggers and want to add or select elements regardsless, use the container.

### x3.axis

__getters and setters__

* bbox: the axis bounding box *(readonly)*\
*this function returns the y, x, width and height values of the axis after it was drawn.*
* tickInterval: the scale interval in which ticks are shown.
* tickNumber: the number of visible ticks.
* tickWidth: the space between two ticks.
* position: the calculated position for a specific value on the axis *(readonly)*
* orientation: the orientation of the axis (top, bottom, left, right)
* type: the type of axis (ordinal, linear)
* link: the relative position of the axis.
* topMargin: the top margin of the axis.
* rightMargin: the right margin of the axis.
* bottomMargin: the bottom margin of the axis.
* leftMargin: the left margin of the axis.
* textMargin: the top, right, bottom, left text margin.
* scale: the scale for this axis.
* tickFormat: how the ticks text is formatted.

__events__

* click: returns the value and number of the tick that was clicked.

For a liniear scale:
```javascript
[0, 100]
```

For an ordinal scale:
```javascript
['Amsterdam', 'Rotterdam', 'Utrecht']
```

If you want to word wrap the axis labels use a newline `\n`. E.g.:
```javascript
['Healthy\nChildren', 'Obese\nChildren']
```

### x3.grid

The grid module can be used on top of the x3.axis module to grid line bases on axis ticks.

* axis: the d3.axis to plot against.
* top: the top position where the first grid line starts.
* left: the left position where the first grid line starts.
* size: the width or height of the grid lines.

### x3.bar

* width: the width of a single bar.
* start: the position where the bar start.
* end: the position where the bar ends.
* left: the location of the bar on the axis.
* data: the bar data
* container*
* datagroup*

```javascript
[
{'x': 'A', 'y': 49, 'color': '#FF0000'},
{'x': 'B', 'y': 51, 'color': '#FF0000'},
{'x': 'C', 'y': 60, 'color': '#FF0000'}
]
```

The width, start, end, or left setters will pass three arguments if a function was used.

```javascript
bar = new x3.bar();
bar.set("width", function(d, i, f) { });
```

The first 2 arguments are exactly the same as you might except from d3, the last is x3 specific:
1. A single data record.
2. The data record number.
3. Are we in the initial draw.

### x3.column

* height: the height of a single bar.
* start: the position where the bar start.
* end: the position where the bar ends.
* top: the location of the bar on the axis.
* data: the column data
* container*
* datagroup*

The rest is the same as the x3.bar module.

### x3.pie

* arc: get the `d3.svg.arc` object. *(readonly)*
* data: the pie chart data
* container*
* datagroup*

```javascript
[
{'value': 60, 'color': '#FF0000'},
{'value': 50, 'color': '#00FF00'}
]
```

For the best result, all values should count up to a 100.

### x3.pieText

The pieText module can be used on top of the x3.pie module to show labels inside the pie pieces.

* text: the text that should be used as the pie chart labels. The first argument contains the label, the second the sequence number.
* key: the data key that holds the pie chart label values (default _value_).

### x3.line

* position-x: the x position of a line point
* position-y: the y position of a line point
* order: the ordering of line points
* data: the line data

```javascript
[{
	'id': 0,
	'color': '#F6B400',
	'width': 2,
	'points': [
		{'x': 1, 'y': 1},
		{'x': 2, 'y': 2},
	]
}, {
	'id': 1,
	'color': '#FF0000',
	'width': 2,
	'points': [
		{'x': 1, 'y': 3},
		{'x': 2, 'y': 4},
	]
}]
```

Lines can be updated by subsequent calls of `set("data", ...)`. It is not necessary to pass the full data object again, changes to the object are sufficient. This means that if i want to update the first point of line 0 and add a point, i can just pass:

```javascript
[{
	'id': 0,
	'points': [
		{'x': 1, 'y': 3},
		{'x': 3, 'y': 2},
	]
}]
```
However, it is important to always pass the id parameter so the x3.line module knows what line was changed or if a line was added.

After each `set("data", ...)` call the order function will be called. This allows you to reorder the points after points were added or removed. The order function follows the same logic as the plain javascript sort function.

### TODO

- Check the datagroup creation. Currently:
```html
<g class="datagroup"><rect></rect></g>
<g class="datagroup"><rect></rect></g>
```
what we want:
```html
<g class="datagroup"><rect></rect><rect></rect></g>
```