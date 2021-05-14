

var myctr = document.getElementsByName("constructor");
var margin = { top: 66, right: 110, bottom: 20, left: 40 },
    width = 1024,
    height = 800,
    innerHeight = height - 2;

var devicePixelRatio = window.devicePixelRatio || 1;

var color = d3.scaleOrdinal()
    .domain(["Volkswagen", "Daihatsu", "Kia", "Peugeot", "Audi", "Dacia", "Lancia", "Seat", "Nissan", "Mini", "Ford", "Renault", "Mercedes", "Fiat", "BMW", "Saab", "Skoda", "Jaguar", "Volvo"])
    .range(["#DB7F85", "#50AB84", "#4C6C86", "#C47DCB", "#B59248", "#DD6CA7", "#E15E5A", "#5DA5B3", "#725D82", "#54AF52", "#954D56", "#8C92E8", "#D8597D", "#AB9C27", "#D67D4B", "#D58323", "#BA89AD", "#357468", "#8F86C2"]);

var types = {
    "Number": {
        key: "Number",
        coerce: function (d) { return +d; },
        extent: d3.extent,
        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scaleLinear().range([innerHeight, 0])
    },
    "String": {
        key: "String",
        coerce: String,
        extent: function (data) { return data.sort(); },
        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scalePoint().range([0, innerHeight])
    },
    "Date": {
        key: "Date",
        coerce: function (d) { return new Date(d); },
        extent: d3.extent,
        within: function (d, extent, dim) { return extent[0] <= dim.scale(d) && dim.scale(d) <= extent[1]; },
        defaultScale: d3.scaleTime().range([innerHeight, 0])
    }
};

var dimensions = [
    {
        key: "age",
        description: "Age",
        type: types["Number"],
        axis: d3.axisLeft()
            .tickFormat(function (d, i) {
                return d;
            })
    },
    {
        key: "situationFamiliale",
        description: "Situation Familiale",
        type: types["String"]
    },
    {
        key: "nbEnfantsAcharge",
        description: "Nombre d'enfants",
        type: types["Number"]
    },
    {
        key: "prix",
        description: "Prix",
        type: types["Number"]
    },
    {
        key: "puissance",
        type: types["Number"],
        description: "Puissance (cv)"
    },
    {
        key: "longueur",
        description: "Longueur",
        type: types["String"]
    },
    {
        key: "nbPortes",
        description: "Nombre de portes",
        type: types["Number"]
    },
    {
        key: "couleur",
        description: "Couleur",
        type: types["String"]
    },
    {
        key: "marque",
        type: types["String"],
        description: "Marque"
    }
];


var xscale = d3.scalePoint()
    .domain(d3.range(dimensions.length))
    .range([0, width]);

var yAxis = d3.axisRight();

var container = d3.select("body").append("div")
    .attr("class", "parcoords")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px");

var svg = container.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var canvas = container.append("canvas")
    .attr("width", width * devicePixelRatio)
    .attr("height", height * devicePixelRatio)
    .style("width", width + "px")
    .style("height", height + "px")
    .style("margin-top", margin.top + "px")
    .style("margin-left", margin.left + "px");

var ctx = canvas.node().getContext("2d");
ctx.globalCompositeOperation = 'darken';
ctx.globalAlpha = 0.15;
ctx.lineWidth = 1.5;
ctx.scale(devicePixelRatio, devicePixelRatio);

var axes = svg.selectAll(".axis")
    .data(dimensions)
    .enter().append("g")
    .attr("class", function (d) { return "axis " + d.key.replace(/ /g, "_"); })
    .attr("transform", function (d, i) { return "translate(" + xscale(i) + ")"; });

d3.json("client_grouped.json", function (error, data) {
    if (error) throw error;

    dimensions.forEach(function (dim) {
        if (!("domain" in dim)) {
            dim.domain = d3_functor(dim.type.extent)(data.map(function (d) { return d[dim.key]; }));
        }
        if (!("scale" in dim)) {
            dim.scale = dim.type.defaultScale.copy();
        }
        dim.scale.domain(dim.domain);
    });

    var render = renderQueue(draw).rate(30);

    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = d3.min([1.15 / Math.pow(data.length, 0.3), 1]);
    render(data);

    axes.append("g")
        .each(function (d) {
            var renderAxis = "axis" in d
                ? d.axis.scale(d.scale)
                : yAxis.scale(d.scale);
            d3.select(this).call(renderAxis);
        })
        .append("text")
        .attr("class", "title")
        .attr("text-anchor", "start")
        .text(function (d) { return "description" in d ? d.description : d.key; });


    axes.append("g")
        .attr("class", "brush")
        .each(function (d) {
            d3.select(this).call(d.brush = d3.brushY()
                .extent([[-10, 0], [10, height]])
                .on("start", brushstart)
                .on("brush", brush)
                .on("end", brush)
            )
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    d3.selectAll(".axis.pl_discmethod .tick text")
        .style("fill", color);

    function project(d) {
        return dimensions.map(function (p, i) {
            if (
                !(p.key in d) ||
                d[p.key] === null
            ) return null;

            return [xscale(i), p.scale(d[p.key])];
        });
    };

    function draw(d) {
        ctx.strokeStyle = color(d.marque);
        ctx.beginPath();
        var coords = project(d);
        coords.forEach(function (p, i) {
            if (p === null) {
                if (i > 0) {
                    var prev = coords[i - 1];
                    if (prev !== null) {
                        ctx.moveTo(prev[0], prev[1]);
                        ctx.lineTo(prev[0] + 6, prev[1]);
                    }
                }
                if (i < coords.length - 1) {
                    var next = coords[i + 1];
                    if (next !== null) {
                        ctx.moveTo(next[0] - 6, next[1]);
                    }
                }
                return;
            }

            if (i == 0) {
                ctx.moveTo(p[0], p[1]);
                return;
            }

            ctx.lineTo(p[0], p[1]);
        });
        ctx.stroke();
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }


    function brush() {
        render.invalidate();

        var actives = [];
        svg.selectAll(".axis .brush")
            .filter(function (d) {
                return d3.brushSelection(this);
            })
            .each(function (d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });

        var selected = data.filter(function (d) {
            if (actives.every(function (active) {
                var dim = active.dimension;
                return dim.type.within(d[dim.key], active.extent, dim);
            })) {
                return true;
            }
        });
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = d3.min([0.85 / Math.pow(selected.length, 0.3), 1]);
        render(selected);

        output.text(d3.tsvFormat(selected.slice(0, 24)));
    }
});

function d3_functor(v) {
    return typeof v === "function" ? v : function () { return v; };
};

var renderQueue = (function (func) {
    var _queue = [],
        _rate = 1000,
        _invalidate = function () { },
        _clear = function () { };

    var rq = function (data) {
        if (data) rq.data(data);
        _invalidate();
        _clear();
        rq.render();
    };

    rq.render = function () {
        var valid = true;
        _invalidate = rq.invalidate = function () {
            valid = false;
        };

        function doFrame() {
            if (!valid) return true;
            var chunk = _queue.splice(0, _rate);
            chunk.map(func);
            timer_frame(doFrame);
        }

        doFrame();
    };

    rq.data = function (data) {
        _invalidate();
        _queue = data.slice(0);
        return rq;
    };

    rq.add = function (data) {
        _queue = _queue.concat(data);
    };

    rq.rate = function (value) {
        if (!arguments.length) return _rate;
        _rate = value;
        return rq;
    };

    rq.remaining = function () {
        return _queue.length;
    };

    rq.clear = function (func) {
        if (!arguments.length) {
            _clear();
            return rq;
        }
        _clear = func;
        return rq;
    };

    rq.invalidate = _invalidate;

    var timer_frame = window.requestAnimationFrame
        || window.webkitRequestAnimationFrame
        || window.mozRequestAnimationFrame
        || window.oRequestAnimationFrame
        || window.msRequestAnimationFrame
        || function (callback) { setTimeout(callback, 17); };

    return rq;
});