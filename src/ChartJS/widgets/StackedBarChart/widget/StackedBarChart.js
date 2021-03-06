/*jslint white:true, nomen: true, plusplus: true */
/*global mx, mendix, require, console, define, module, logger, window */
/*mendix */
define([

    "dojo/_base/declare", "dojo/_base/lang", "dojo/query", "dojo/on", "ChartJS/widgets/Core"

], function (declare, lang, domQuery, on, _core) {
    "use strict";

    // Declare widget.
    return declare("ChartJS.widgets.StackedBarChart.widget.StackedBarChart", [ _core ], {

        // Overwrite functions from _core here...

        _processData : function () {
            logger.debug(this.id + "._processData");
            var sets = [],
                points = null,
                set = {
                    points : []
                },
                xlabels = [],
                xlabelsSet = false,
                color = "",
                highlightcolor = "",
                label = "",
                j = null,
                i = null,
                k = null,
                _set = null,
                maxpoints= 0;

            this._chartData.datasets = [];
            this._chartData.labels = [];

            sets = this._data.datasets = this._sortArrayObj(this._data.datasets);

            for (j = 0; j < sets.length; j++) {
                set = sets[j];
                if(set.points.length > maxpoints) {
                    maxpoints = set.points.length;
                }
            }

            for(j = 0; j < sets.length; j++) {
                set = sets[j];

                points = [];
                if (set.points.length === 0) {
                    for(k=0; k < maxpoints; k++) {
                        points.push(0);
                    }
                    console.log(this.id + " - empty dataset");
                }

                set.points = this._sortArrayMx(set.points, this.sortingxvalue);
                color = set.dataset.get(this.seriescolor);
                highlightcolor = this.serieshighlightcolor ? set.dataset.get(this.serieshighlightcolor) : color;

                label = set.dataset.get(this.datasetlabel);

                for(i = 0;i < set.points.length; i++) {
                    if (!xlabelsSet) {
                        xlabels.push(((this.scaleShowLabelsBottom === true) ? set.points[i].get(this.seriesxlabel) : ""));
                    }

                    points.push(+(set.points[i].get(this.seriesylabel))); // Convert to integer, so the stackedbar doesnt break!
                }

                if (!xlabelsSet) {
                    xlabelsSet = true;
                }

                _set = {
                    label : (this.scaleShowLabelsBottom === true) ? label : "",
                    backgroundColor: (this.seriesColorReduceOpacity) ? this._hexToRgb(color, "0.5") : color,
                    borderColor: (this.seriesColorReduceOpacity) ? this._hexToRgb(color, "0.5") : color,
                    pointColor: (this.seriesColorReduceOpacity) ? this._hexToRgb(color, "0.8") : color,
                    hoverBackgroundColor: (this.seriesColorReduceOpacity) ? this._hexToRgb(color, "0.75") : highlightcolor,
                    hoverBorderColor: (this.seriesColorReduceOpacity) ? this._hexToRgb(highlightcolor, "1") : highlightcolor,
                    data : points
                };
                this._chartData.datasets.push(_set);
                this._activeDatasets.push({
                    dataset : _set,
                    idx : j,
                    active : true
                });
            }
            this._chartData.labels = xlabels;

            this._createChart(this._chartData);

            this._createLegend(false);
        },

        _createChart : function (data) {
            logger.debug(this.id + "._createChart");

            if (this._chart) {
                this._chart.stop();
                this._chart.data.datasets = data.datasets;
                this._chart.data.labels = data.labels;
                this._chart.update(1000);
                this._chart.bindEvents(); // tooltips otherwise won't work
            } else {

                this._chart = new this._chartJS(this._ctx, {
                    type: "bar",
                    data: data,
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

                        stacked: true,

                        //Boolean - Whether to show labels on the scale
                        scaleShowLabels : this.scaleShowLabels,

                        //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
                        scaleBeginAtZero : this.scaleBeginAtZero,

                        //Boolean - Whether grid lines are shown across the chart
                        scaleShowGridLines : this.scaleShowGridLines,

                        //String - Colour of the grid lines
                        scaleGridLineColor : this.scaleGridLineColor,

                        //Number - Width of the grid lines
                        scaleGridLineWidth : this.scaleGridLineWidth,

                        //Boolean - If there is a stroke on each bar
                        barShowStroke : this.barShowStroke,

                        //Number - Pixel width of the bar stroke
                        barStrokeWidth : this.barStrokeWidth,

                        //Number - Spacing between each of the X value sets
                        barValueSpacing : this.barValueSpacing,

                        //Number - Spacing between data sets within X values
                        barDatasetSpacing : this.barDatasetSpacing,

                        //Boolean - Whether bars should be rendered on a percentage base
                        relativeBars : this.relativeBars,

                        legendCallback : this._legendCallback,

                        //The scale line width
                        scaleLineWidth : this.scaleLineWidth,

                        //The scale line color
                        scaleLineColor : this.scaleLineColor,

                        // Show tooltips at all
                        showTooltips : this.showTooltips,

                        // maintainAspectRatio
                        maintainAspectRatio : this.maintainAspectRatio,

                        // Custom tooltip?
                        customTooltips : false, //lang.hitch(this, this.customTooltip)

                        scales: {
                            xAxes: [{
                                stacked: true,
                                ticks: {
                                    //beginAtZero: true
                                }
                            }],
                            yAxes: [{
                                stacked: true,
                                ticks: {
                                    //suggestedMax: 10
                                }
                            }]
                        }

                    }
                });
            }

            this.connect(window, "resize", lang.hitch(this, function () {
                this._resize();
            }));

            // Add class to determain chart type
            this._addChartClass("chartjs-stacked-bar-chart");

            if (this.onclickmf) {
                on(this._chart.chart.canvas, "click", lang.hitch(this, this._onClickChart));
            }
        }
    });
});
require(["ChartJS/widgets/StackedBarChart/widget/StackedBarChart"], function () {
    "use strict";
});
