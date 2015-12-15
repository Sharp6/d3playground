var w = 600;
var h = 250;

padding = 50;

function buildLine(ds) {

	var xScale = d3.scale.linear()
								.domain([0, ds.length])
								.range([padding,w-padding])
								.nice();
	var yScale = d3.scale.linear()
								.domain([
									0,
									d3.max(ds, function(d) { return d.duration/60; })
									])
								.range([h-padding,10])
								.nice();

	var xAxisGen = d3.svg.axis().scale(xScale).orient("bottom");							
	var yAxisGen = d3.svg.axis().scale(yScale).orient("left").ticks(4);

	var lineFunction = d3.svg.line()
		.x(function(d,i) { return xScale(i); })
		.y(function(d) { return yScale(d.duration/60); })
		.interpolate("monotone");

	var svg = d3.select("body").append("svg").attr({ width: w, height: h});

	var labels = svg.selectAll("text")
		.data(ds)
		.enter()
		.append("text")
		.text(function(d) { return Math.floor(d.duration / 60); })
		.attr({
			x: function(d,i) { return xScale(i); },
			y: function(d) { return yScale(d.duration/60) - 5; }
		});

	var yAxis = svg.append("g").call(yAxisGen)
							.attr("class", "axis")
							.attr("transform", "translate(" + padding + ", 0)");

	var xAxis = svg.append("g").call(xAxisGen)
							.attr("class", "axis")
							.attr("transform", "translate(0," + (h-padding) + ")");


	var viz = svg.append("path")
		.attr({
			d: lineFunction(ds),
			"stroke": "purple",
			"stroke-width" : 2,
			"fill": "none"
		});

	
}

function showHeader(ds) {
	d3.select("body").append("h2").text("Activities");
}

d3.json("http://runmonitor.herokuapp.com/activities", function(err, data) {
	if(err) {
		console.log(err);
	} else {
		showHeader(data);
		buildLine(data);
	}
});

