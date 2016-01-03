var w = 800;
var h = 250;

var tooltip;

padding = 50;

function buildLine(ds) {

	var minDate = d3.min(ds, function(d) { return new Date(d.start_time); });
	var maxDate = d3.max(ds, function(d) { return new Date(d.start_time); });
	
	var xScale = d3.time.scale()
				.domain([minDate, maxDate])
				.range([padding+5, w-padding]);
				
	var yScale = d3.scale.linear()
				.domain([
					0,
					d3.max(ds, function(d) { return d.duration/60; })
					])
				.range([h-padding,10]);

	var xAxisGen = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.time.format("%b"));							
	var yAxisGen = d3.svg.axis().scale(yScale).orient("left").ticks(4);

	var lineFunction = d3.svg.line()
		.x(function(d,i) { return xScale(new Date(d.start_time)); })
		.y(function(d) { return yScale(d.duration/60); })
		.interpolate("monotone");

	var svg = d3.select("body").append("svg").attr({ width: w, height: h});

	var yAxis = svg.append("g").call(yAxisGen)
							.attr("class", "y-axis")
							.attr("transform", "translate(" + padding + ", 0)");

	var xAxis = svg.append("g").call(xAxisGen)
							.attr("class", "x-axis")
							.attr("transform", "translate(0," + (h-padding) + ")");


	var viz = svg.append("path")
		.attr({
			d: lineFunction(ds),
			"stroke": "purple",
			"stroke-width" : 2,
			"fill": "none",
			"class": "path"
		});


	var dots = svg.selectAll("circle")
				.data(ds)
				.enter()
				.append("circle")
					.attr({
						cx: function(d) { return xScale(new Date(d.start_time)); },
						cy: function(d) { return yScale(d.duration/60); },
						r: 4,
						fill: function(d) { return d.daysAgoColor; },
						class: "circle"
					})
					.on("mouseover", function(d) {
						tooltip
							.html("<strong>" + Math.floor(d.duration/60) + "</strong>")
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY - 28) + "px")
							.transition()
								.duration(500)
								.style("opacity", .85)

					})
					.on("mouseout", function(d) {
						tooltip.transition()
							.duration(300)
							.style("opacity",0);
					});

	
}

function updateLine(ds) {

	var minDate = d3.min(ds, function(d) { return new Date(d.start_time); });
	var maxDate = d3.max(ds, function(d) { return new Date(d.start_time); });

	var numberOfMonths = Math.floor((new Date(maxDate) - new Date(minDate)) / (1000*60*60*24*30));
	
	var xScale = d3.time.scale()
				.domain([minDate, maxDate])
				.range([padding+5, w-padding]);
				
	var yScale = d3.scale.linear()
				.domain([
					0,
					d3.max(ds, function(d) { return d.duration/60; })
					])
				.range([h-padding,10]);

	var xAxisGen = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.time.format("%b"))
	.ticks(numberOfMonths+1);							
	var yAxisGen = d3.svg.axis().scale(yScale).orient("left").ticks(4);

	var lineFunction = d3.svg.line()
		.x(function(d) { return xScale(new Date(d.start_time)); })
		.y(function(d) { return yScale(d.duration/60); })
		.interpolate("monotone");

	var svg = d3.select("body").select("svg");
	var yAxis = svg.selectAll("g.y-axis").call(yAxisGen);
	var xAxis = svg.selectAll("g.x-axis").call(xAxisGen);

	var viz = svg.selectAll(".path")
		.attr({
			d: lineFunction(ds)
		});


	var dots = svg.selectAll("circle").data(ds);

	dots.transition().attr({
		cx: function(d) { return xScale(new Date(d.start_time)); },
		cy: function(d) { return yScale(d.duration/60); }
	});
				
	dots.enter().append("circle")
		.attr({
			cx: function(d) { return xScale(new Date(d.start_time)); },
			cy: function(d) { return yScale(d.duration/60); },
			"r": 0,
			fill: function(d) { return d.daysAgoColor; },
			class: "circle"
		})
		.on("mouseover", function(d) {
			tooltip
				.html("<strong>" + Math.floor(d.duration/60) + "</strong>")
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px")
				.transition()
					.duration(500)
					.style("opacity", .85)

		})
		.on("mouseout", function(d) {
			tooltip.transition()
				.duration(300)
				.style("opacity",0);
		})
		.transition().delay(300).attr("r",4);

	

	dots.exit().remove();

	
}

function showHeader(ds) {
	d3.select("body").append("h2").text("Activities");
}

d3.json("http://runmonitor.herokuapp.com/getAllActivities", function(err, data) {

	var ds;
	tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0)

	if(err) {
		console.log(err);
		return false;
	} else {
		ds = data;
	}

	showHeader(ds);
	buildLine([]);

	// event listener
	d3.select("select")
		.on("change", function(d,i) {
			var sel = d3.select("#numberOfActivities").node().value;

			var filteredDs = ds.slice(0,sel);
			updateLine(filteredDs);
		});

});

