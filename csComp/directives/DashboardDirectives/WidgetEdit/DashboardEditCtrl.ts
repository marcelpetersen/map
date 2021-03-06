module DashboardEdit {
    import IFeature = csComp.Services.IFeature;
    import IFeatureType = csComp.Services.IFeatureType;
    import IPropertyType = csComp.Services.IPropertyType;
    import IPropertyTypeData = csComp.Services.IPropertyTypeData;

    declare var interact;


    export interface IDashboardEditScope extends ng.IScope {
        vm: DashboardEditCtrl;

    }

    export class DashboardEditCtrl {
        private scope: IDashboardEditScope;

        public dashboard: csComp.Services.Dashboard;
        public hasParent: boolean;
        public parent: string;

        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        public static $inject = [
            '$scope',
            'mapService',
            'layerService',
            'messageBusService',
            'dashboardService'
        ];

        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        constructor(
            public $scope: IDashboardEditScope,
            private $mapService: csComp.Services.MapService,
            private $layerService: csComp.Services.LayerService,
            private $messageBusService: csComp.Services.MessageBusService,
            private $dashboardService: csComp.Services.DashboardService
            ) {
            this.scope = $scope;
            $scope.vm = this;
            this.dashboard = $scope.$parent["data"];
            if (this.dashboard.parents && this.dashboard.parents.length > 0) this.parent = this.dashboard.parents[0];
            this.updateHasParent();
            console.log(this.$dashboardService.widgetTypes);
            // setup draggable elements.


        }



        public updateHasParent() {

            // if (this.parent !== "") this.dashboard.parents = [this.parent];
            // this.hasParent = this.dashboard.parents && this.dashboard.parents.length > 0;
        }

        public toggleTimeline() {
            //this.$dashboardService.mainDashboard.showTimeline = !this.$dashboardService.mainDashboard.showTimeline;
            this.checkTimeline();
            this.$layerService.project.dashboards
        }

        public toggleLegend() {
            this.checkLegend();
            this.$layerService.project.dashboards
        }

        public setExtent() {
            this.dashboard.viewBounds = this.$layerService.activeMapRenderer.getExtent();
            console.log('set extent');
        }

        public setVisibleLayers() {
            this.dashboard.visiblelayers = [];

            for (var id in this.$layerService.loadedLayers) this.dashboard.visiblelayers.push(id);
        }

        public setBaseLayer() {
            this.dashboard.baselayer = this.$mapService.activeBaseLayerId;
        }


        public toggleMap() {
            setTimeout(() => {
                this.checkMap();
            }, 100);

        }

        public checkMap() {
            var db = this.$layerService.project.activeDashboard;
            if (db.showMap !== this.$layerService.visual.mapVisible) {
                if (db.showMap) {
                    this.$layerService.visual.mapVisible = true;
                } else {
                    this.$layerService.visual.mapVisible = false;
                }
                if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') { this.$scope.$apply(); }
            }

            if (db.showMap && this.dashboard.baselayer) {
                //this.$messageBusService.publish("map", "setbaselayer", this.dashboard.baselayer);
                var layer : csComp.Services.BaseLayer = this.$layerService.$mapService.getBaselayer(this.dashboard.baselayer);
                this.$layerService.activeMapRenderer.changeBaseLayer(layer);
                this.$layerService.$mapService.changeBaseLayer(this.dashboard.baselayer);
                this.$layerService.$mapService.changeBaseLayer(this.dashboard.baselayer);
            }
        }

        public checkTimeline() {}

        public checkLegend() {
            var db = this.$layerService.project.activeDashboard;
            if (!db.showLegend) {
                var idxDelete = -1;
                db.widgets.forEach((w, idx) => {
                    if (w.id === 'legend') { idxDelete = idx; }
                });
                if (idxDelete > -1) db.widgets.splice(idxDelete, 1);
            }
            this.$dashboardService.selectDashboard(db, 'main');
            if (this.$scope.$root.$$phase !== '$apply' && this.$scope.$root.$$phase !== '$digest') { this.$scope.$apply(); }
        }

    }
}
