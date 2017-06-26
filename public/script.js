var app = new Vue({
  el: '#app',
  data: {
    title: 'RECoin Market Simulation',
    initialData: [
      {time: '10:01', price: 0.03},
      {time: '10:02', price: 0.016},
      {time: '10:03', price: 0.018},
      {time: '10:04', price: 0.017},
      {time: '10:05', price: 0.019},
      {time: '10:06', price: 0.015},
      {time: '10:07', price: 0.013},
      {time: '10:08', price: 0.017},
      {time: '10:09', price: 0.012}
    ],
    rPrice: 0.02,
    miners: 270000,
    offsetters: 700000,
    rTotal: 0,
    uber: true,
    lyft: false,
    amazon: false,
    optIn: false,
    balance: 0,
    hAxis: 10,
    mAxis: 10
  },
  methods: {

    enroll: function () {
      if (this.optIn) {
        this.optIn = false
        this.balance = 0
      } else {
        this.offsetters = this.offsetters + 50000
        this.optIn = true
      }
    },

    buyCar: function () {
      this.miners = this.miners + 50000
      this.optIn = true
    },

    toggleEvent: function (c) {
      if (c === 'uber') {
        if (this.uber) {
          this.uber = false
          this.offsetters = this.offsetters - 700000
        } else {
          this.uber = true
          this.offsetters = this.offsetters + 700000
        }
      }
      if (c === 'lyft') {
        if (this.lyft) {
         this.lyft = false
         this.offsetters = this.offsetters - 140000
       } else {
         this.lyft = true
         this.offsetters = this.offsetters + 140000
       }
      }
      if (c === 'amazon') {
        if (this.amazon) {
          this.amazon = false
          this.offsetters = this.offsetters - 1080000
        } else {
          this.amazon = true
          this.offsetters = this.offsetters + 1080000
        }
      }
    }
  },
  mounted() {

    var vm = this
    setInterval(function() {
      if (vm.optIn) {
        vm.balance = vm.balance + Math.random()
      }
      vm.rTotal = (Math.random()*2+26)*vm.miners
      vm.miners = Math.floor(vm.miners + (270000*0.32/365))
      vm.offsetters = Math.floor(vm.offsetters + (700000*0.10/365))
      vm.rPrice = (vm.offsetters*0.25)/vm.rTotal

      vm.initialData.push({time: vm.hAxis + ":" + vm.mAxis, price: vm.rPrice});

      if(vm.mAxis === 59) {
        vm.hAxis++;
        vm.mAxis=0;
      }
      else {
        vm.mAxis++;
      }

      if (Object.keys(vm.initialData).length === 20) vm.initialData.shift();

      redraw(
        vm.initialData,
        "#chart",
        sca.getOpt()['x'],
        sca.getOpt()['y'],
        sca.getOpt()['xAxis'],
        sca.getOpt()['yAxis'],
        sca.getSvg()['svg'],
        sca.getSvg()['line'],
        sca.getSvg()['lpath'],
        sca.getSvg()['legendColor'],
        sca.getOpt()['height'],
        6,
        category,
        drawLine
      )
    }, 3000)

  }
  })

  //initial generation
  function generate(data, id, lineType, axisNum, category, drawLine) {
    var margin = {top: 20, right: 18, bottom: 35, left: 28},
        width = 600 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%H:%M").parse;
    var formatCurrency = d3.format("($.2f")

    var legendSize = 10,
        legendColor = 'rgba(0, 160, 233, 0.7)'

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(d3.time.minutes, Math.floor(data.length / axisNum))
        .tickSize(-height)
        .tickPadding([6])
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .ticks(10)
        .tickSize(-width)
        .tickFormat(formatCurrency)
        .orient("left");

    var ddata = (function() {
      var temp = {}, seriesArr = [];

      category.forEach(function (name) {
        temp[name] = {category: name, values:[]};
        seriesArr.push(temp[name]);
      });

      data.forEach(function (d) {
        category.map(function (name) {
          temp[name].values.push({'category': name, 'time': parseDate(d['time']), 'num': d[name]});
        });
      });

      return seriesArr;
    })();

    var ldata = (function() {
      var temp = {}, seriesArr = [];

      temp[drawLine[0]] = {category: drawLine[0], values:[]};
      seriesArr.push(temp[drawLine]);

      data.forEach(function (d) {
        drawLine.map(function (name) {
          temp[name].values.push({'category': name, 'time': parseDate(d['time']), 'num': d[name]});
        });
      });

      return seriesArr;
    })();

    x.domain( d3.extent(data, function(d) { return parseDate(d['time']); }) );

    y.domain([
      0,
      d3.max(ddata, function(c) { return d3.max(c.values, function(v) { return v['num']; }); })
    ]);

    var line = d3.svg.line()
        .interpolate(lineType)
        .x(function(d) { return x(d['time']); })
        .y(function(d) { return y(d['num']); });

    d3.select('#svg-disk').remove();

    var svg = d3.select(id)
        .append("div")
        .classed("svg-container", true)
        .append("svg")
        .attr("id", "svg-disk")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 600 270")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("id", "disk-x-axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("id", "disk-y-axis")
        .call(yAxis);

    var lpath = svg.selectAll(".lpath")
        .data(ldata)
        .enter().append("g")
        .attr("class", "lpath");

    lpath.append("path")
        .attr("d", function(d) { return line(d['values']); })
        .attr("class", "areaW");

    var legend = svg.selectAll('.legend')
        .data(category)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
          return 'translate(' + (i * 10 * legendSize) + ',' + (height + margin.bottom - legendSize * 1.2) + ')';
        });

    legend.append('rect')
        .attr('width', legendSize)
        .attr('height', legendSize)
        .style('fill', legendColor)

    legend.append('text')
        .data(category)
        .attr('x', legendSize * 1.2)
        .attr('y', legendSize / 1.1)
        .text('price')

    this.getOpt = function() {
      var axisOpt = new Object();
      axisOpt['x'] = x;
      axisOpt['y'] = y;
      axisOpt['xAxis'] = xAxis;
      axisOpt['yAxis'] = yAxis
      axisOpt['width'] = width;
      axisOpt['height'] = height;

      return axisOpt;
    }

    this.getSvg = function() {
      var svgD = new Object();
      svgD['svg'] = svg;
      svgD['lpath'] = lpath;
      svgD['legendColor'] = legendColor;
      svgD['line'] = line;

      return svgD;
    }
  }

  //redraw function
  function redraw(data, id, x, y, xAxis, yAxis, svg, line, lpath, legendColor, height, axisNum, category, drawLine) {
    //format of time data
    var parseDate = d3.time.format("%H:%M").parse;

    var ddata = (function() {
      var temp = {}, seriesArr = [];

      category.forEach(function (name) {
        temp[name] = {category: name, values:[]};
        seriesArr.push(temp[name]);
      });

      data.forEach(function (d) {
        category.map(function (name) {
          temp[name].values.push({'category': name, 'time': parseDate(d['time']), 'num': d[name]});
        });
      });

      return seriesArr;
    })();

    var ldata = (function() {
      var temp = {}, seriesArr = [];

      temp[drawLine[0]] = {category: drawLine[0], values:[]};
      seriesArr.push(temp[drawLine]);

      data.forEach(function (d) {
        drawLine.map(function (name) {
          temp[name].values.push({'category': name, 'time': parseDate(d['time']), 'num': d[name]});
        });
      });

      return seriesArr;
    })();

    y.domain([
      0,
      d3.max(ddata, function(c) { return d3.max(c.values, function(v) { return v['num']; }); })+d3.max(ddata, function(c) { return d3.max(c.values, function(v) { return v['num']; }); })*0.6
    ]);

    x.domain( d3.extent(data, function(d) { return parseDate(d['time']); }) );
    xAxis.ticks(d3.time.minutes, Math.floor(data.length / axisNum));

    svg.select("#disk-x-axis")
        .transition()
        .duration(200)
        .ease("sin-in-out")
        .call(xAxis);

    svg.select("#disk-y-axis")
        .transition()
        .duration(200)
        .ease("sin-in-out")
        .call(yAxis)

    lpath.select("path")
        .data(ldata)
        .transition()
        .duration(200)
        .attr("d", function(d) { return line(d['values']); })
        .attr("class", 'areaW');

  }

  var category = ['price'],
  drawLine = ['price']

  var sca = new generate(app.initialData, "#chart", "monotone", 6, category, drawLine)
