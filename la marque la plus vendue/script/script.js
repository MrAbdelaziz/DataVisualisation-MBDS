d3.json("data_Voiturelesplusvendus.json", function (error, dataclient) {

    var svg = d3.select("body")
        .append("svg")
        .append("g")

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");

    var desc = d3.select("body")
        .append("div")
        .attr("id", "desc")
        .text("Bonjour")

    var width = 960,
        height = 450,
        radius = Math.min(width, height) / 2;

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.Freq;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var key = function (d) { return d.data.Var1; };

    var color = d3.scale.ordinal()
        .domain(d3.map(dataclient, function (d) { return (d.Var1) }).keys())
        .range(["#ff0000", "#ff7127", "#ff9e00", "#ffca27", "#dfff00", "#62ff27", "#0cd887", "#27ffbd", "#0cc1d8", "#3976ef"]);


    // ---------------------------//
    //      TOOLTIP               //
    // ---------------------------//

    // -1- Create a tooltip div that is hidden by default:
    var tooltip = d3.select("#myvisa")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("color", "white")
        .style("position", "absolute")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    var showTooltip = function (d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .style("visibility", "visible")
            .html(d.data.Var1 + "<br>Nombre de ventes : " + d.data.Freq + " unités")
            .style("left", (d3.event.pageX + 50) + "px")
            .style("top", (d3.event.pageY + 50) + "px")
    }
    var moveTooltip = function (d) {
        tooltip
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + "px")
    }
    var hideTooltip = function (d) {
        tooltip
            .style("opacity", 0)
            .style("visibility", "hidden")
    }

    change();


    function change() {

        /* ------- PIE SLICES -------*/
        var slice = svg.select(".slices").selectAll("path.slice")
            .data(pie(dataclient), key);

        slice.enter()
            .insert("path")
            .style("fill", function (d) { return color(d.data.Var1); })
            .attr("class", "slice")
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip);

        slice
            .transition().duration(1000)
            .attrTween("d", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    return arc(interpolate(t));
                };
            })

        slice.exit()
            .remove();

        /* ------- TEXT LABELS -------*/

        var text = svg.select(".labels").selectAll("text")
            .data(pie(dataclient), key);

        text.enter()
            .append("text")
            .attr("dy", ".35em")
            .html(function (d) {
                return d.data.Var1
            });

        function midAngle(d) {
            return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }

        text.transition().duration(1000)
            .attrTween("transform", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate(" + pos + ")";
                };
            })
            .styleTween("text-anchor", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start" : "end";
                };
            });

        text.exit()
            .remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/

        var polyline = svg.select(".lines").selectAll("polyline")
            .data(pie(dataclient), key);

        polyline.enter()
            .append("polyline");

        polyline.transition().duration(1000)
            .attrTween("points", function (d) {
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function (t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };
            });

        polyline.exit()
            .remove();

        /* --------- desc ----------*/
        let max = { Freq: 0, Var1: "" };
        dataclient.forEach(element => {
            if (element.Freq > max.Freq)
                max = element;
        })
        desc.html(max.Var1 + " c'est la marque la plus vendue avec " + max.Freq + " ventes.")
    };
})