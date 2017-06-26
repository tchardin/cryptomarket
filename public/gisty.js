
  var data = [
    {time: '10:01', used: 200, extra: 500, total: 1000},
    {time: '10:02', used: 620, extra: 600, total: 1000},
    {time: '10:03', used: 300, extra: 800, total: 1000},
    {time: '10:04', used: 440, extra: 700, total: 1000},
    {time: '10:05', used: 900, extra: 700, total: 1000},
    {time: '10:06', used: 300, extra: 700, total: 1000},
    {time: '10:07', used: 50, extra: 700, total: 1000},
    {time: '10:08', used: 350, extra: 700, total: 1000},
    {time: '10:09', used: 750, extra: 700, total: 1000}
  ]
  var category = ['price']
  var hAxis = 10, mAxis = 10

   function generate(data, id, axisNum) {

     // Set the dimensions of the canvas / graph
     var margin = {top: 20, right: 18, bottom: 35, left: 28},
         width = 600 - margin.left - margin.right,
         height = 270 - margin.top - margin.bottom;

    // Parse the date / percentage
     var parseDate = d3.time.format("%H:%M").parse;
     var formatPercent = d3.format(".0%");

     // Legend
     var legendSize = 10,
         legendColor = 'rgba(0, 160, 233, 0.7)';

      // Define the axes
     var x = d3.time.scale()
         .range([0, width]);

     var y = d3.scale.linear()
         .range([height, 0]);

     var xAxis = d3.svg.axis()
         .scale(x)
         .ticks(d3.time.minutes, Math.floor(data.length/axisNum))
         .tickSize(-height)
         .tickPadding([6])
         .orient("bottom");

     var yAxis = d3.svg.axis()
         .scale(y)
         .ticks(10)
         .tickSize(-width)
         .tickFormat(formatPercent)
         .orient("left");

    // Map temporary data array
     var ddata = (function() {
       var temp = [];

       for (var i=0; i<data.length; i++) {
         temp.push({'time': parseDate(data[i]['time']), 'used': data[i]['used'], 'extra': data[i]['extra'], 'total': data[i]['total']});
       }

       return temp;
     })();

    // Scale the range of the data as it comes
     x.domain(d3.extent(ddata, function(d) { return d.time; }));

     var area = d3.svg.area()
         .x(function(d) { return x(d.time); })
         .y0(height)
         .y1(function(d) { return y(d['used']/d['total']); })
         .interpolate("cardinal");

    var line = d3.svg.line()
        .interpolate("cardinal")
        .x(function(d) { return x(d.time) })
        .y(function(d) { return y(d['used']/d['total']) })

     d3.select('#svg-mem').remove();

     // Add the svg canvas
     var svg = d3.select(id).append("svg")
         .attr("id", "svg-mem")
         .attr("width", width+margin.right+margin.left)
         .attr("height", height+margin.top+margin.bottom)
         .append("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Add the x and y axis
     svg.append("g")
         .attr("class", "x axis")
         .attr("id", "mem-x-axis")
         .attr("transform", "translate(0," + height + ")")
         .call(xAxis);

     svg.append("g")
         .attr("class", "y axis")
         .call(yAxis);

    // Add the valueline(data)
     var path = svg.append("svg:path")
         .datum(ddata)
         .attr("class", "areaM")
         .attr("d", area);

     var points = svg.selectAll(".gPoints")
         .data(ddata)
         .enter().append("g")
         .attr("class", "gPoints");

     //legend rendering
     var legend = svg.append('g')
         .attr('class', 'legend')
         .attr('transform', 'translate(0,'+ (height + margin.bottom - legendSize * 1.2) +')');

     legend.append('rect')
         .attr('width', legendSize)
         .attr('height', legendSize)
         .style('fill', legendColor);

     legend.append('text')
         .data(ddata)
         .attr('x', legendSize*1.2)
         .attr('y', legendSize/1.1)
         .text('price');

     points.selectAll(".memtipPoints")
         .data(ddata)
         .enter().append("circle")
         .attr("class", "memtipPoints")
         .attr("cx", function (d) {
           return x(d.time);
         })
         .attr("cy", function (d) {
           return y(d['used']/d['total']);
         })
         .attr("r", "6px")
         .on("mouseover", function (d) {
           console.log(this);

           d3.select(this).transition().duration(100).style("opacity", 1);

           svg.append("g")
               .attr("class", "tipDot")
               .append("line")
               .attr("class", "tipDot")
               .transition()
               .duration(50)
               .attr("x1", x(d['time']))
               .attr("x2", x(d['time']))
               .attr("y2", height);

           svg.append("polyline")      // attach a polyline
               .attr("class", "tipDot")  // colour the line
               .style("fill", "black")     // remove any fill colour
               .attr("points", (x(d['time'])-3.5)+","+(y(1)-2.5)+","+x(d['time'])+","+(y(1)+6)+","+(x(d['time'])+3.5)+","+(y(1)-2.5));

           svg.append("polyline")      // attach a polyline
               .attr("class", "tipDot")  // colour the line
               .style("fill", "black")     // remove any fill colour
               .attr("points", (x(d['time'])-3.5)+","+(y(0)+2.5)+","+x(d['time'])+","+(y(0)-6)+","+(x(d['time'])+3.5)+","+(y(0)+2.5));

         })
         .on("mouseout",  function (d) {
           d3.select(this).transition().duration(100).style("opacity", 0);

           d3.selectAll('.tipDot').transition().duration(100).remove();

         });

     this.getOpt = function() {
       var axisOpt = new Object();
       axisOpt['x'] = x;
       axisOpt['y'] = y;
       axisOpt['xAxis'] = xAxis;
       axisOpt['width'] = width;
       axisOpt['height'] = height;

       return axisOpt;
     }

     this.getSvg = function() {
       var svgD = new Object();
       svgD['svg'] = svg;
       svgD['points'] = points;
       svgD['area'] = area;
       svgD['path'] = path;

       return svgD;
     }
   }

   //redraw function
   function redraw(data, id, x, y, xAxis, svg, area, path, points, height, axisNum) {
     //format of time data
     var parseDate = d3.time.format("%H:%M").parse;
     var formatPercent = d3.format(".0%");

     var ddata = (function() {
       var temp = [];

       for (var i=0; i<data.length; i++) {
         temp.push({'time': parseDate(data[i]['time']), 'used': data[i]['used'], 'extra': data[i]['extra'], 'total': data[i]['total']});
       }

       return temp;
     })();

     x.domain(d3.extent(ddata, function(d) {
       return d['time'];
     }));

     xAxis.ticks(d3.time.minutes, Math.floor(data.length / axisNum));

     svg.select("#mem-x-axis")
         .transition()
         .duration(200)
         .ease("sin-in-out")
         .call(xAxis);

     //area line updating
     path.datum(ddata)
         .transition()
         .duration(200)
         .attr("class", "areaM")
         .attr("d", area);

     //circle updating
     points.selectAll(".memtipPoints")
         .data(ddata)
         .attr("class", "memtipPoints")
         .attr("cx", function (d) {
           return x(d.time);
         })
         .attr("cy", function (d) {
           return y(d['used']/d['total']);
         })
         .attr("r", "6px");

     //draw new dot
     points.selectAll(".memtipPoints")
         .data(ddata)
         .enter().append("circle")
         .attr("class", "memtipPoints")
         .attr("cx", function (d) {
           return x(d.time);
         })
         .attr("cy", function (d) {
           return y(d['used']/d['total']);
         })
         .attr("r", "6px")
         .on("mouseover", function (d) {
           d3.select(this).transition().duration(100).style("opacity", 1);

           svg.append("g")
               .attr("class", "tipDot")
               .append("line")
               .attr("class", "tipDot")
               .transition()
               .duration(50)
               .attr("x1", x(d['time']))
               .attr("x2", x(d['time']))
               .attr("y2", height);

           svg.append("polyline")      // attach a polyline
               .attr("class", "tipDot")  // colour the line
               .style("fill", "black")     // remove any fill colour
               .attr("points", (x(d['time'])-3.5)+","+(y(1)-2.5)+","+x(d['time'])+","+(y(1)+6)+","+(x(d['time'])+3.5)+","+(y(1)-2.5));

           svg.append("polyline")      // attach a polyline
               .attr("class", "tipDot")  // colour the line
               .style("fill", "black")     // remove any fill colour
               .attr("points", (x(d['time'])-3.5)+","+(y(0)+2.5)+","+x(d['time'])+","+(y(0)-6)+","+(x(d['time'])+3.5)+","+(y(0)+2.5));
         })
         .on("mouseout",  function (d) {
           d3.select(this).transition().duration(100).style("opacity", 0);

           d3.selectAll('.tipDot').transition().duration(100).remove();

         });

     //remove old dot
     points.selectAll(".memtipPoints")
         .data(ddata)
         .exit()
         .transition()
         .duration(200)
         .remove();

   }

   //inits chart
   var sca = new generate(data, "#chart", 8);

   //dynamic data and chart update
   setInterval(function() {
     //update donut data
     data.push({time: hAxis + ":" + mAxis, used: Math.random()*200+400, extra: Math.random()*1000, total: 1000});

     // console.log(tAxis);
     if(mAxis === 59) {
       hAxis++;
       mAxis=0;
     }
     else {
       mAxis++;
     }

     if (Object.keys(data).length === 20) data.shift();

     // generate(data, "#sensor-mem-area-d3");
     redraw(data, "#chart", sca.getOpt()['x'], sca.getOpt()['y'], sca.getOpt()['xAxis'], sca.getSvg()['svg'], sca.getSvg()['area'], sca.getSvg()['path'], sca.getSvg()['points'], sca.getOpt()['height'], 8);
   }, 3500);
