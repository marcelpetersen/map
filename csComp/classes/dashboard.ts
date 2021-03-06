module csComp.Services {

    export class Widget {
        public content: Function;
        constructor() { }
    }

    export class WidgetStyle {
        background: string;
        borderWidth: string;
        borderColor: string;
        borderRadius: string;
        opacity: number;
        disableIfLeftPanel: boolean;
        shadow: boolean = true;
    }

    export interface IWidgetCtrl {
        startEdit: Function;
        getOptions? : Function;
        goFullscreen? : Function;
    }

    export interface IWidget {
        /**
         * name of the directive that should be used as widget
         */
        directive?: string;
        /**
         * json object that can hold parameters for the directive
         */
        data?: Object;

        /**
         * if defined it will find a widget with this id and copy it data (usefull if you want to reuse the data on multiple dashboards)
         * @type {string}
         */
        datasource? : string;
        /**
         * url of the html page that should be used as widget
         */
        url?: string;
        /**
         * name of the template that should be shown as widget
         */
        template?: string;

        /** default on dashboard, other options: rightpanel */
        position? : string;
        /**
         * title of the widget
         */
        title?: string;
        elementId?: string;
        enabled?: boolean;
        style?: string;
        customStyle?: WidgetStyle;
        effectiveStyle?: WidgetStyle;
        description?: string;
        parentDashboard?: csComp.Services.Dashboard;
        renderer?: Function;
        resize?: Function;

        init?: Function;
        start?: Function;
        stop?: Function;
        left?: string;
        right?: string;
        top?: string;
        bottom?: string;
        padding? : string;
        zIndex? : string;

        icon?: string;
        /** When true, hide the widget. */
        hideIfLeftPanel?: boolean;
        name?: string; id: string;
        timeDependent?: boolean;
        properties?: {};
        dataSets?: DataSet[];
        range?: csComp.Services.DateRange;
        updateDateRange?: Function;
        collapse?: boolean;
        canCollapse?: boolean;
        width?: string;
        height?: string;
        minWidth?: string;
        minHeight?: string
        allowFullscreen?: boolean;
        hover?: boolean;
        messageBusService?: csComp.Services.MessageBusService;
        layerService?: csComp.Services.LayerService;
        /** Place the widget in a responsive grid container (https://getbootstrap.com/examples/grid/) */
        inGridContainer?: boolean;

        _options? : any;
        _ctrl?: IWidgetCtrl;
        _ijs?: any;
        _initialized?: boolean;
        _interaction?: boolean;
        _isMoving?: boolean;
        _width?: string;
        _height?: string;
        _left?: string;
        _top?: string;
        _bottom?: string;
        _right?: string;
        _zindex? : string;
        _gridContainer?: boolean;
        _isFullscreen? : boolean;
    }

    export class BaseWidget implements IWidget {
        public directive: string;
        public title: string;
        public data: {};
        public url: string;
        public elementId: string;
        public parentDashboard: csComp.Services.Dashboard;
        public enabled: boolean = true;
        public style: string;
        public customStyle: WidgetStyle;
        public description: string;

        public opacity: number = 1;
        public hideIfLeftPanel: boolean;
        public icon: string;

        public background: string = "white";
        public left: string;
        public right: string;
        public top: string;
        public bottom: string;
        public name: string; public id: string;
        public timeDependent: boolean;
        public properties: {};
        public dataSets: DataSet[];
        public range: csComp.Services.DateRange;
        public collapse: boolean;
        public canCollapse: boolean;
        public width: string;
        public height: string;
        public minWidth: string;
        public minHeight: string;
        public allowFullscreen: boolean;
        public messageBusService: csComp.Services.MessageBusService;
        public layerService: csComp.Services.LayerService;
        public hover: boolean;
        public effectiveStyle: WidgetStyle;
        /** default on dashboard, other options: rightpanel */
        public position : string = 'dashboard';
        public _isFullscreen : boolean;
        public _ctrl: IWidgetCtrl;
        public _initialized: boolean;
        public _interaction: boolean;
        public _isMoving: boolean;

        _width: string;
        _height: string;
        _left: string;
        _top: string;
        _bottom: string;
        _right: string;
        _zindex: string;
        _gridContainer: boolean;

        //public static deserialize(input: IWidget): IWidget {
        //    var loader = new InstanceLoader(window);
        //    var w = <IWidget>loader.getInstance(widget.widgetType);
        //    var res = $.extend(new BaseWidget(), input);
        //    return res;
        //}

        constructor(title?: string, type?: string) {
            if (title) this.title = title;
            this.properties = {};
            this.dataSets = [];
        }

        public static serializeableData(w: IWidget): IWidget {
            var r = <IWidget>{
                id: w.id,
                directive: w.directive,
                template: w.template,
                title: w.title,
                name: w.name,
                timeDependent: w.timeDependent,
                url: w.url,
                enabled: w.enabled,
                customStyle: w.customStyle,
                style: w.style,
                left: w.left,
                right: w.right,
                top: w.top,
                bottom: w.bottom,
                padding: w.padding,
                position : w.position,
                icon : w.icon,
                width: w.width,
                height: w.height,
                allowFullscreen: w.allowFullscreen,
                properties: w.properties,
                hover: w.hover,
                //dataSets:      {},// w.dataSets,
                range: w.range,
                collapse: w.collapse,
                canCollapse: w.canCollapse,
                data: BaseWidget.cloneWithout0(w.data)
            };
            return r;
        }

        public static cloneWithout0(v: any): any {
            if (typeof v !== "object") return v;
            if (v instanceof Array) {
                var a = [];
                v.forEach((i) => {
                    a.push(this.cloneWithout0(i));
                })
                return a;
            }
            else {
                var c = {};
                for (var k in v) {
                    if (k[0] !== '_') c[k] = this.cloneWithout0(v[k]);
                }
                return c;
            }
            // if (v['0']) {
            //   for (var k in v['0']) {
            //     if (k !== '0') c[k] = this.cloneWithout0(v['0'][k]);
            //   }
            // }

        }

        public start() { }

        public init() {
            //if (!sizeX)
            //this.sizeX = sX;
            //this.sizeY = sY;
            //this.col = c;
            //this.row = r;
            this.background = "red";
            if (!this.id) this.id = "widget" + csComp.Helpers.getGuid().replace('-', '');
            //this.width = (width) ? width : 300;
            //this.height = (height) ? height : 150;
            //this.id = id;
            this.elementId = this.id;
            this.start();
        }

        public renderer = ($compile: any, $scope: any) => { };

        public updateDateRange(r: csComp.Services.DateRange) {
            this.range = r;
        }

        public resize = (status: string, width: number, height: number) => { };
    }

    export class Dashboard {
        widgets: IWidget[];
        editMode: boolean;
        showMap: boolean;
        mapWidth: string = '100%';
        description : string;
        alignMapRight: boolean = false;
        mobile: boolean = true;
        showTimeline: boolean = true;
        draggable: boolean = true;
        resizable: boolean = true;
        showLeftmenu: boolean = true;
        showRightmenu: boolean = false;
        showLegend: boolean = false;
        showBackgroundImage: boolean = false;
        /** don't show hamburger menu for this dashboard */
        hideleftPanelToggle : boolean = false;
        showNavbar: boolean = true;
        background: string;
        backgroundimage: string;
        disabledFeatures: string[];
        showDateSelector : boolean = true;
        visiblelayers: string[];
        visibleLeftMenuItems: string[];
        baselayer: string;
        viewBounds: IBoundingBox;
        timeline: DateRange;
        /** this dashboards shows live data, needed for sensor apis */
        isLive: boolean;
        id: string;
        name: string;
        disabled: boolean;
        parents: string[];
        _initialized: boolean;
        /** set if a a fullscreen widget is active */
        _fullScreenWidget : IWidget;

        /** complete refresh page on activation */
        refreshPage: boolean;

        constructor() {
            this.widgets = [];
        }

        /**
         * Returns an object which contains all the data that must be serialized.
         */
        public static serializeableData(d: Dashboard): Object {
            return {
                id: d.id,
                name: d.name,
                editMode: d.editMode,
                showMap: d.showMap,
                mapWidth: d.mapWidth,
                description : d.description,
                alignMapRight: d.alignMapRight,
                timeline: d.timeline,
                showTimeline: d.showTimeline,
                hideleftPanelToggle : d.hideleftPanelToggle,
                showDateselector : d.showDateSelector,
                showLeftmenu: d.showLeftmenu,
                showLegend: d.showLegend,
                showRightmenu: d.showRightmenu,
                showBackgroundImage: d.showBackgroundImage,
                showNavbar: d.showNavbar,
                background: d.background,
                backgroundimage: d.backgroundimage,
                visiblelayers: d.visiblelayers,
                baselayer: d.baselayer,
                viewBounds: d.viewBounds,
                widgets: csComp.Helpers.serialize(d.widgets, BaseWidget.serializeableData),
                visibleLeftMenuItems: d.visibleLeftMenuItems,
                mobile: d.mobile,
                isLive: d.isLive
            }
        }

        public static deserialize(input: Dashboard, solution: Solution): Dashboard {
            var res = <Dashboard>$.extend(new Dashboard(), input);


            res.widgets = [];
            if (typeof input.isLive === 'undefined') input.isLive = false;

            if (input.widgets) input.widgets.forEach((w: IWidget) => {
                this.addNewWidget(w, res, solution);
            });
            if (input.timeline) res.timeline = $.extend(new DateRange(), input.timeline);

            return res;
        }

        public static addNewWidget(widget: IWidget, dashboard: Dashboard, solution: Solution): IWidget {
            //var loader = new InstanceLoader(window);
            //var w = <IWidget>loader.getInstance(widget.widgetType);
            //w.messageBusService = this.$messageBusService;
            //w.layerService = this.$layerService;
            //w.init();
            //var w = BaseWidget();
            if (!widget.id) widget.id = csComp.Helpers.getGuid();
            //alert(widget.id);
            widget.elementId = "widget-" + widget.id;
            widget.parentDashboard = dashboard;
            if (widget.style && widget.style !== "custom") {
                if (!solution.hasOwnProperty('widgetStyles') || !solution.widgetStyles.hasOwnProperty(widget.style)) widget.style = "default";
                widget.effectiveStyle = solution.widgetStyles[widget.style];
            }
            else {
                widget.effectiveStyle = widget.customStyle;
            }
            dashboard.widgets.push(widget);
            /*if (this.$rootScope.$root.$$phase != '$apply' && this.$rootScope.$root.$$phase != '$digest') { this.$rootScope.$apply(); }
            setTimeout(() => {
                //if (w != null) w.renderer(this.$compile, this.$rootScope);
                this.updateWidget(widget);

            }, 50);*/
            //this.editWidget(w);
            return widget;
        }
    }

    export class Timeline {
        public id: string;
        public timestamps: number[];
    }

    export class TimedDataSet {
        public timeline: Timeline;
        public timedata: number[];
    }

    export class DataSet {
        public color: string;

        public data: { [key: number]: number };

        constructor(public id?: string, public title?: string) {
            this.data = [];
        }
    }
}
