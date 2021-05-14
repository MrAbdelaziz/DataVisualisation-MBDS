

d3.json("c_immatriculations.json", function (error, dataImported) {
  if (error) throw error;
  var margin = { top: 40, right: 300, bottom: 60, left: 30 },
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

  var zoom = d3.zoom()
    .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
    .extent([[0, 0], [width, height]])
    .on("zoom", updateChart);

  var svg = d3.select("#myviza").call(zoom)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");



  var scatter = svg.append('g')
    .attr("clip-path", "url(#clip)")
  // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom


  // svg.append("rect")
  //   .attr("width", width)
  //   .attr("height", height)
  //   .style("fill", "none")
  //   .style("pointer-events", "all")
  //   .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  //   .call(zoom);

  // ---------------------------//
  //       AXIS  AND SCALE      //
  // ---------------------------//


  // Add X axis
  var x = d3.scaleLinear()
    .domain(d3.extent(dataImported, function (d) { return d.prix; }))
    .range([0, width]);
  var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(3));

  // Add X axis label:
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 50)
    .text("Prix (€)");

  // Add Y axis
  var y = d3.scaleLinear()
    .domain(d3.extent(dataImported, function (d) { return d.puissance; }))
    .range([height, 0]);
  var yAxis = svg.append("g")
    .call(d3.axisLeft(y));

  // Add Y axis label:
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", 0)
    .attr("y", -20)
    .text("Puissance (ch)")
    .attr("text-anchor", "start")

  // Add a scale for bubble size
  var z = d3.scaleSqrt()
    .domain(d3.extent(dataImported, function (d) { return d.number; }))
    .range([2, 30]);

  // Add a scale for bubble color
  var myColor = d3.scaleOrdinal()
    .domain(d3.map(dataImported, function (d) { return (d.marque) }).keys().sort())
    .range(d3.schemeSet1);

  //  d3.map(dataImported, function (d) { return (d.marque) }).keys().forEach(element => {
  //    console.log(myColor(element))
  //  });



  // ---------------------------//
  //      TOOLTIP               //
  // ---------------------------//

  // -1- Create a tooltip div that is hidden by default:
  var tooltip = d3.select("#myviza")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white")
    .style("position", "absolute")
    // .style("width", "min-content")

  var tooltipHTML = tooltip.append("div")


  /**
   * TOOLTIP PIE CHART
   */
  var dataTooltip = [{ name: 'a', value: 10 }, { name: 'b', value: 20 }, { name: 'c', value: 100 }];
  var dataTooltipAge = [{ name: 'a', value: 10 }, { name: 'b', value: 20 }, { name: 'c', value: 100 }];

  var marginTooltip = { top: 40, right: 300, bottom: 40, left: 40 },
    widthTooltip = 450,
    heightTooltip = 210,
    radiusTooltip = 100;
  // radiusTooltip = Math.min(widthTooltip, heightTooltip) / 2;


  var colorTooltip = d3.scaleOrdinal()
    .range(d3.schemeSet1);

  var arcTooltip = d3.arc()
    .outerRadius(radiusTooltip - 10)
    .innerRadius(0);

  var labelArcTooltip = d3.arc()
    .outerRadius(radiusTooltip - 40)
    .innerRadius(radiusTooltip - 40);

  var pieTooltip = d3.pie()
    .sort(null)
    .value(function (d) { return d.value; });

  var svgTooltip = tooltip.append("svg")
    .attr("width", widthTooltip)
    .attr("height", heightTooltip)
    .style("padding", "20px 0")
    .append("g")
    .attr("transform", "translate(" + (radiusTooltip + 30) + "," + heightTooltip / 2 + ")");

  var svgTooltip2 = tooltip.append("svg")
    .attr("width", widthTooltip)
    .attr("height", heightTooltip)
    .style("padding", "20px 0")
    .append("g")
    .attr("transform", "translate(" + (radiusTooltip + 30) + "," + heightTooltip / 2 + ")");



  function updateTooltipChart() {
    var data_ready = pieTooltip(dataTooltip)
    var data_readyAge = pieTooltip(dataTooltipAge)


    var u = svgTooltip.selectAll("path")
      .data(data_ready)

    var uTxt = svgTooltip.selectAll("text")
      .data(data_ready)

    var uLegend = svgTooltip.selectAll("myTooltipLegend")
      .data(data_ready)


    var u2 = svgTooltip2.selectAll("path")
      .data(data_readyAge)

    var uTxt2 = svgTooltip2.selectAll("text")
      .data(data_readyAge)

    var uLegend2 = svgTooltip2.selectAll("myTooltipLegend")
      .data(data_readyAge)

    // var uLegend = svgTooltip.append("g")
    // .attr("transform", "translate(0," + (-heightTooltip / 2) + ")")
    // .selectAll("myTooltipLegend")
    // .data(data_ready)

    u.enter()
      .append('path')
      .merge(u)
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radiusTooltip)
      )
      .attr('fill', function (d) { return (colorTooltip(d.data.name)) })
      .attr("stroke", "white")
      .style("stroke-width", "1px")
      .style("opacity", 1)

    uTxt.enter()
      .append("text")
      .merge(uTxt)
      .attr("transform", function (d) { return "translate(" + labelArcTooltip.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(formatPie);

    uLegend.enter()
      .append("text")
      .merge(uTxt)
      .attr("x", 130 + size * .8)
      .attr("y", function (d, i) { return i * (size + 5) + (size / 1.5) })
      .style("fill", "white")
      .text(function (d) { return d.data.name + " : " + (d.data.value / d.data.total * 100).toFixed(2) + "%"; });

    uLegend.enter()
      .append("circle")
      .merge(uTxt)
      .attr("cx", 130)
      .attr("cy", function (d, i) { return 10 + i * (size + 5) })
      .attr("r", 8)
      .style("fill", function (d) { return colorTooltip(d.data.name) })


    u2.enter()
      .append('path')
      .merge(u2)
      .attr('d', d3.arc()
        .innerRadius(0)
        .outerRadius(radiusTooltip)
      )
      .attr('fill', function (d) { return (colorTooltip(d.data.name)) })
      .attr("stroke", "white")
      .style("stroke-width", "1px")
      .style("opacity", 1)

    uTxt2.enter()
      .append("text")
      .merge(uTxt2)
      .attr("transform", function (d) { return "translate(" + labelArcTooltip.centroid(d) + ")"; })
      .attr("dy", ".35em")
      .text(function (d) { return d.data.name });

    uLegend2.enter()
      .append("text")
      .merge(uTxt2)
      .attr("x", 130 + size * .8)
      .attr("y", function (d, i) { return i * (size + 5) + (size / 1.5) })
      .style("fill", "white")
      .text(function (d) { return d.data.name + " ans : " + d.data.value });

    uLegend2.enter()
      .append("circle")
      .merge(uTxt2)
      .attr("cx", 130)
      .attr("cy", function (d, i) { return 10 + i * (size + 5) })
      .attr("r", 8)
      .style("fill", function (d) { return colorTooltip(d.data.name) })


    u.exit()
      .remove()

    uTxt.exit()
      .remove()

    uLegend.exit()
      .remove()

    u2.exit()
      .remove()

    uTxt2.exit()
      .remove()

    uLegend2.exit()
      .remove()
  }

  function formatPie(d) {
    // console.log(d)
    var ret = Math.round(d.data.value / d.data.total * 100)
    // console.log(ret)
    if (ret <= 2) {
      return "";
    }
    else {
      return Math.round(d.data.value / d.data.total * 100) + "%";
    }

  }








  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  var showTooltip = function (d) {
    dataTooltip = [
      { name: 'Célibataire', value: d.sf_celib, total: d.sf_count },
      { name: 'En couple', value: d.sf_couple, total: d.sf_count },
      { name: 'Divorcé(e)', value: d.sf_divorce, total: d.sf_count },
      { name: 'Marié(e)', value: d.sf_marie, total: d.sf_count }
    ];

    dataTooltipAge = [
      { name: '18-31', value: d.age_1831 },
      { name: '32-42', value: d.age_3242 },
      { name: '43-59', value: d.age_4359 },
      { name: '60-84', value: d.age_6084 }
    ];

    // tooltip.style("background-color", myColor(d.marque))

    updateTooltipChart();
    console.log(d);
    tooltip
      .transition()
      .duration(200)
    tooltip
      .style("opacity", 1)
      .style("visibility", "visible")

      .style("left", (d3.mouse(this)[0] + 50) + "px")
      .style("top", (d3.mouse(this)[1] + 50) + "px")

    tooltipHTML.html("<h2 style='margin: 0 0'>" + d.marque + " " + d.nom + "</h2> <h3 style='margin: 0 0'>" + d.prix + " € </h3> " + d.puissance + " cv - " + d.number + " unités vendues <h3 style='text-align: center'>Répartition des ventes selon la situation familiale et l'âge :</h3>")
  }
  var moveTooltip = function (d) {
    // console.log(d3.mouse(this))
    tooltip
      .style("left", (d3.mouse(this)[0] + 50) + "px")
      .style("top", (d3.mouse(this)[1] + 50) + "px")
  }
  var hideTooltip = function (d) {
    tooltip
      .style("opacity", 0)
      .style("visibility", "hidden")
  }


  // ---------------------------//
  //       HIGHLIGHT GROUP      //
  // ---------------------------//

  // What to do when one group is hovered
  var highlight = function (d) {
    // reduce opacity of all groups
    d3.selectAll(".bubbles").style("opacity", .05)
    // expect the one that is hovered
    d3.selectAll("." + d).style("opacity", 1)
  }

  // And when it is not hovered anymore
  var noHighlight = function (d) {
    d3.selectAll(".bubbles").style("opacity", 1)
  }


  // ---------------------------//
  //       CIRCLES              //
  // ---------------------------//

  // Add dots
  scatter.selectAll("circle")
    .data(dataImported)
    .enter()
    .append("circle")
    .attr("class", function (d) { return "bubbles " + d.marque })
    .attr("cx", function (d) { return x(d.prix); })
    .attr("cy", function (d) { return y(d.puissance); })
    .attr("r", function (d) { return z(d.number); })
    .style("fill", function (d) { return myColor(d.marque); })
    // -3- Trigger the functions for hover
    .on("mouseover", showTooltip)
    .on("mousemove", moveTooltip)
    .on("mouseleave", hideTooltip)
    .on("click", function (d) { console.log(d) })



  // ---------------------------//
  //       LEGEND              //
  // ---------------------------//

  // Add legend: circles
  var valuesToShow = [10000, 100000, 500000]
  var xCircle = 1000
  var xLabel = 1050
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function (d) { return height - 100 - z(d) })
    .attr("r", function (d) { return z(d) })
    .style("fill", "none")
    .attr("stroke", "black")

  // Add legend: segments
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', function (d) { return xCircle + z(d) })
    .attr('x2', xLabel)
    .attr('y1', function (d) { return height - 100 - z(d) })
    .attr('y2', function (d) { return height - 100 - z(d) })
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

  // Add legend: labels
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr('x', xLabel)
    .attr('y', function (d) { return height - 100 - z(d) })
    .text(function (d) { return (d / 1000 + "K") })
    .style("font-size", 10)
    .attr('alignment-baseline', 'middle')

  // Legend title
  svg.append("text")
    .attr('x', xCircle)
    .attr("y", height - 100 + 30)
    .text("Nombre de ventes")
    .attr("text-anchor", "middle")

  // Add one dot in the legend for each name.
  var size = 20
  var allgroups = d3.map(dataImported, function (d) { return (d.marque) }).keys().sort();
  // var allgroups = ['bmw', "audi"]
  console.log(allgroups)
  svg.selectAll("myrect")
    .data(allgroups)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function (d, i) { return 10 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 7)
    .style("fill", function (d) { return myColor(d) })
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight)

  // Add labels beside legend dots
  svg.selectAll("mylabels")
    .data(allgroups)
    .enter()
    .append("text")
    .attr("x", xCircle + size * .8)
    .attr("y", function (d, i) { return i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) { return myColor(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .on("mouseover", highlight)
    .on("mouseleave", noHighlight);


  function updateChart() {
    var newX = d3.event.transform.rescaleX(x);
    var newY = d3.event.transform.rescaleY(y);

    // update axes with these new boundaries
    xAxis.call(d3.axisBottom(newX))
    yAxis.call(d3.axisLeft(newY))

    scatter.selectAll("circle")
      .attr('cx', function (d) { return newX(d.prix) })
      .attr('cy', function (d) { return newY(d.puissance) })
  }
})

