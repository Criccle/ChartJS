/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global mx, mendix, require, console, define, module, logger, window */
/*mendix */
define([

    "dojo/_base/declare", "dojo/_base/lang", "dojo/query", "dojo/on", "dojo/html", "dojo/dom-style", "ChartJS/widgets/Core"

], function (declare, lang, domQuery, on, html, domStyle, _core) {
    "use strict";

    // Declare widget.
    return declare("ChartJS.widgets.PieChart.widget.PieChart", [ _core ], {

        _processData : function () {
            logger.debug(this.id + "._processData");
            var sets = [],
                chartData = [],
                points = null,
                set = {
                    points : []
                },
                color = "",
                highlightcolor = "",
                point = null,
                label = "",
                j = null;

            this._chartData.datasets = [];
            this._chartData.labels = [];
            sets = this._data.datasets = this._sortArrayObj(this._data.datasets);

            for (j = 0; j < sets.length; j++) {
                set = sets[j];

                points = [];
                color = set.dataset.get(this.seriescolor);
                highlightcolor = this.serieshighlightcolor ? set.dataset.get(this.serieshighlightcolor) : color;

                label = set.dataset.get(this.datasetlabel);
                point = {
                    label : label,
                    backgroundColor: (this.seriesColorReduceOpacity) ? this._hexToRgb(color, "0.5") : color,
                    hoverBackgroundColor: (this.seriesColorReduceOpacity) ? this._hexToRgb(color, "0.75") : highlightcolor,
                    value : +(set.dataset.get(this.seriesylabel))
                };

                chartData.push(point);
                this._activeDatasets.push({
                    dataset : point,
                    idx : j,
                    active : true
                });
            }

            this._createChart(chartData);

            this._createLegend(true);
        },

        _loadData : function () {
            logger.debug(this.id + "._loadData");
            this._executeMicroflow(this.datasourcemf, lang.hitch(this, function (objs) {
                var obj = objs[0], // Chart object is always only one.
                    j = null,
                    dataset = null;

                this._data.object = obj;

                // Retrieve datasets
                mx.data.get({
                    guids : obj.get(this._dataset),
                    callback : lang.hitch(this, function (datasets) {
                        var set = null;
                        this._data.datasets = [];

                        for (j = 0; j < datasets.length; j++) {
                            dataset = datasets[j];

                            set = {
                                dataset : dataset,
                                sorting : +(dataset.get(this.datasetsorting))
                            };
                            this._data.datasets.push(set);
                        }
                        this._processData();
                    })
                });
            }), this._mxObj);

        },

        _createChart : function (data) {
            logger.debug(this.id + "._createChart");
            this._chart = new this._chartJS(this._ctx, {
                type: "pie",
                data:  this._createDataSets(data),
                options: {

                    responsive : this.responsive,
                    responsiveAnimationDuration : (this.responsiveAnimationDuration > 0 ? this.responsiveAnimationDuration : 0),
                    tooltips : {
                        enabled : this.showTooltips
                    },
                    legend: {
                        display: this.showLegend,
                        labels : { fontFamily : this._font }
                    },

                    //Boolean - Whether we should show a stroke on each segment
                    segmentShowStroke : this.segmentShowStroke,

                    //String - The colour of each segment stroke
                    segmentStrokeColor : this.segmentStrokeColor,

                    //Number - The width of each segment stroke
                    segmentStrokeWidth : this.segmentStrokeWidth,

                    //Number - Amount of animation steps
                    animationSteps : this.animationSteps,

                    //String - Animation easing effect
                    animationEasing : this.animationEasing,

                    //Boolean - Whether we animate the rotation of the Doughnut
                    animateRotate : this.animateRotate,

                    //Boolean - Whether we animate scaling the Doughnut from the centre
                    animateScale : this.animateScale,

                    legendCallback : this._legendAlternateCallback,

                    // Show tooltips at all
                    showTooltips : this.showTooltips,

                    // maintainAspectRatio
                    maintainAspectRatio : this.maintainAspectRatio,


                    //cutOut of pie
                    cutoutPercentage : 0, //always zero for Pie chart

                    // Custom tooltip?
                    customTooltips : false //lang.hitch(this, this.customTooltip)

                }
            });

            // Set the con
            html.set(this._numberNode, this._data.object.get(this.numberInside));

            // Add class to determain chart type
            this._addChartClass("chartjs-pie-chart");

            if (this.onclickmf) {
                on(this._chart.chart.canvas, "click", lang.hitch(this, this._onClickChart));
            }

        }
    });
});
require(["ChartJS/widgets/PieChart/widget/PieChart"], function () {
    "use strict";
});
