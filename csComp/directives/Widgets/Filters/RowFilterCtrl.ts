module Filters {


    export interface IRowFilterScope extends ng.IScope {
        vm: RowFilterCtrl;
        filter: csComp.Services.GroupFilter;
        options: Function;
        removeString: string;
        createScatterString: string;
        saveAsImageString: string;
    }

    export class RowFilterCtrl {
        private scope: IRowFilterScope;
        private widget: csComp.Services.IWidget;
        /** To export a filter, canvg can be used. Due to its size it is not included in csWeb by default,
         *  you need to add it to your csWeb-App. When you have added it, a save-icon will appear in the filter.
         * canvg is available from https://github.com/gabelerner/canvg */
        private exporterAvailable: boolean;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            'layerService',
            'messageBusService',
            '$timeout',
            '$translate'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            public $scope: IRowFilterScope,
            private $layerService: csComp.Services.LayerService,
            private $messageBus: csComp.Services.MessageBusService,
            private $timeout: ng.ITimeoutService,
            private $translate: ng.translate.ITranslateService
        ) {
            $scope.vm = this;

            $translate('REMOVE').then((translation) => {
                $scope.removeString = translation;
            });
            $translate('CREATE_SCATTER').then((translation) => {
                $scope.createScatterString = translation;
            });
            $translate('SAVE_AS_IMAGE').then((translation) => {
                $scope.saveAsImageString = translation;
            });

            var par = <any>$scope.$parent.$parent;

            if (par.hasOwnProperty('filter')) {
                $scope.filter = par['filter'];
            }
            else {

            }
            
            if ((<any>window).canvg) {
                this.exporterAvailable = true;
            } else {
                this.exporterAvailable = false;
            }
            
            this.$messageBus.subscribe('filters', (title: string, groupId) => {
                switch (title) {
                    case 'updateGroup': 
                        if ($scope.filter && $scope.filter.group.id === groupId) {
                            this.updateFilter();
                        }
                        break;
                }
            })
            
            if ($scope && $scope.filter) {
                setTimeout(() => this.initRowFilter());
                //$timeout.call(()=>this.initBarFilter());

                $scope.options = (() => {
                    var res = [];
                    res.push([$scope.removeString, () => this.remove()]);
                    $scope.filter.group.filters.forEach((gf: csComp.Services.GroupFilter) => {
                        if (gf.filterType == "row" && gf.property != $scope.filter.property) {
                            res.push([$scope.createScatterString + ' ' + gf.title, () => this.createScatter(gf)]);
                        }
                    });
                    
                    if (this.exporterAvailable) {
                        res.push([$scope.saveAsImageString, () => this.exportToImage()]);
                    }

                    return res;
                });
            }
        }

        private createScatter(gf: csComp.Services.GroupFilter) {
            this.$layerService.createScatterFilter(this.$scope.filter.group, this.$scope.filter.property, gf.property);
        }

        private dcChart: any;


        public initRowFilter() {
            var filter = this.$scope.filter;
            var group = filter.group;
            var divid = 'filter_' + filter.id;

            // Use the default dc-rowChart, unless a customRowChart is available
            if ((<any>window).customRowChart) {
                (<any>dc).customRowChart = (<any>window).customRowChart;
                this.dcChart = (<any>dc).customRowChart('#' + divid);
            } else {
                this.dcChart = <any>dc.rowChart('#' + divid);
            }

            this.$scope.$apply();

            var pt : csComp.Services.IPropertyType;
            var orderList: {[key: string]: {nr: number, sortKey: string}} = {};          

            var dcDim = group.ndx.dimension(d => {
                if (!pt) pt = this.$layerService.getPropertyType(d, filter.property);
                if (!d.properties.hasOwnProperty(filter.property)) {
                    if (pt && pt.legend && pt.legend.hasOwnProperty('defaultLabel')) {
                        return pt.legend.defaultLabel;
                    } else {
                        return null;
                    }
                } else {
                    if (d.properties[filter.property] != null) {
                        var a = d.properties[filter.property];
                        if (pt.type === 'options') {
                            var r;
                            if (pt && pt.options && pt.options.hasOwnProperty(a)) {
                                r = pt.options[a];
                            } else {
                                r = a;
                            }
                            return r;
                        } else if (pt.type === 'number' && pt.hasOwnProperty('legend')) {
                            var label;
                            pt.legend.legendEntries.some((le) => {
                                if (a >= le.interval.min && le.interval.max >= a) {
                                    label = le.label;
                                    return true;
                                }
                            });
                            if (!label) {
                                if (pt && pt.legend && pt.legend.hasOwnProperty('defaultLabel')) {
                                    label = pt.legend.defaultLabel;
                                } else {
                                    label = 'Onbekend';
                                }
                            }
                            return label;
                        } else if (pt.type === 'text' || pt.type === 'textarea') {
                            return a;
                        }
                    }
                    return null;
                }
            });
            filter.dimension = dcDim;
            var dcGroup = dcDim.group();
            
            // If a legend is present, add a group for each entry, such that it is shown in the filter even when there are no such features in the group (yet).
            if (pt && pt.legend) {
                var allEntries = [];
                _.each(<any>pt.legend.legendEntries, (le: csComp.Services.LegendEntry) => { allEntries.push(le.label); });
                var fakeNdx = crossfilter(allEntries);
                var fakeDim = fakeNdx.dimension(d => {
                    return d;
                });
                var fakeGroup = fakeDim.group();

                //Sort ordering
                pt.legend.legendEntries.forEach((le) => {
                    if (le.hasOwnProperty('sortKey')) {
                        let sk = le.sortKey;
                        if (!orderList.hasOwnProperty(sk)) {
                            orderList[le.label] = {nr: Object.keys(orderList).length, sortKey: sk};
                        }
                    }
                });
                var sortKeys = _.map(orderList, (item) => { return item.sortKey});
                sortKeys = sortKeys.sort();
                _.each(orderList, (val, key) => { val.nr = sortKeys.indexOf(val.sortKey)});
            }
            
            var ensuredGroup = (fakeGroup ? this.ensureAllBins(dcGroup, fakeGroup) : null);
            var h = (ensuredGroup && ensuredGroup.size() < 6) ? 180 : 240;

            this.dcChart.width(275)
                .height(h)        
                .margins({top: 2, right: 2, bottom: 2, left: 2})        
                .dimension(dcDim)
                .group(ensuredGroup || dcGroup)
                .title(d=> {
                    return d.key })
                .elasticX(true)                
                .colors(d=>{
                    if (pt && pt.legend) {
                        if (pt.options) {
                            return csComp.Helpers.getColorFromLegend(d, pt.legend);
                        }
                        if (!pt.options) {
                            var arr = pt.legend.legendEntries.filter((le => { return le.label === d }));
                            return (arr.length > 0 ? arr[0].color : '#444444');
                        }
                    }
                    else {
                        return "red";
                    }
                })
                .cap(10)
                .ordering(d => {
                    if (pt && pt.legend) {
                        if (orderList.hasOwnProperty(d.key)) {
                            return orderList[d.key].nr;
                        } else {
                            return d.key || d.value;
                        }
                    } else {
                        return d.key || d.value;
                    }
                })
                .on('renderlet', (e) => {
                    dc.events.trigger(() => {
                        this.$layerService.updateFilterGroupCount(group);
                    }, 0);
                    dc.events.trigger(() => {
                        console.log('RowFilterCtrl: renderlet');
                        if (dcDim && dcDim.top(Infinity).length > 0 && typeof dcDim.top(Infinity)[0] === 'undefined') {
                            console.log('dcDim contains undefined objects');
                        } else {
                            group.filterResult = dcDim.top(Infinity);
                            this.$layerService.updateMapFilter(group);
                        }
                    }, 100);
                })
                .on('filtered', (e) => {
                    console.log('Filtered rowchart ' + e.dimension().top(1000).length + ' ' + e.anchorName());
                    group.filterResult = dcDim.top(Infinity);
                    this.$layerService.updateMapFilter(group);
                });
            this.dcChart.xAxis().ticks(8);
            this.dcChart.selectAll();
            this.updateRange();
        }
        
        private ensureAllBins(source_group, fake_group) { // (source_group, bins...}
            var bins = fake_group.all().slice(0);
            return {
                all: function () {
                    var result = source_group.all().slice(0); // copy original results (we mustn't modify them)
                    var found = {};
                    result.forEach(function (d) {
                        found[d.key] = true;
                    });
                    bins.forEach(function (d) {
                        if (!found[d.key])
                            result.push({ key: d.key, value: 0 });
                    });
                    return result;
                },
                top: function (n) {
                    var result = source_group.all().slice(0); // copy original results (we mustn't modify them)
                    var found = {};
                    result.forEach(function (d) {
                        found[d.key] = true;
                    });
                    bins.forEach(function (d) {
                        if (!found[d.key])
                            result.push({ key: d.key, value: 0 });
                    });
                    return result.slice(0, n);
                },
                size: function () {
                    return bins.length;
                }
            };
        };

        private updateFilter() {
            setTimeout(() => {
                console.log('RowFilterCtrl: updateFilter()');
                if (this.$scope.filter.filterLabel) {
                    this.dcChart.filter(this.$scope.filter.filterLabel);
                }
                this.dcChart.render();
                dc.renderAll();
                this.$layerService.updateMapFilter(this.$scope.filter.group);
            }, 20);
        }

        public updateRange() {
            setTimeout(() => {
                console.log('RowFilterCtrl: updateRange()');
                var filter = this.$scope.filter;
                var group = filter.group;
                this.dcChart.filterAll();
                if (this.$scope.filter.filterLabel) {
                    this.dcChart.filter(this.$scope.filter.filterLabel);
                }
                this.dcChart.render();
                // dc.redrawAll();
                // dc.renderAll();
                group.filterResult = filter.dimension.top(Infinity);
                this.$layerService.updateMapFilter(this.$scope.filter.group);
                this.$layerService.triggerUpdateFilter(this.$scope.filter.group.id);
                this.$scope.$apply();
            }, 0);
        }

        public remove() {
            if (this.$scope.filter) {
                this.$layerService.removeFilter(this.$scope.filter);
            }
        }
        
        public exportToImage() {
            var canvg = (<any>window).canvg || undefined;
            if (!canvg) return;
            var svg = new XMLSerializer().serializeToString(this.dcChart.root().node().firstChild);
            var canvas = document.createElement('canvas');
            document.body.appendChild(canvas);
            canvg(canvas, svg, {renderCallback: () => {
                var img = canvas.toDataURL("image/png");
                var fileName = this.$scope.filter.title || 'rowfilter-export';
                csComp.Helpers.saveImage(img, fileName + '.png', 'png');
                canvas.parentElement.removeChild(canvas);
            }});
        }
    }
}
