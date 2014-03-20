(function(){

    function createElement(type, attrs, childs) {
        var element = document.createElement(type), key;
        if (attrs) {
            for (key in attrs) {
                if (attrs.hasOwnProperty(key)) {
                    if (key === "id" || key === "innerHTML" || key === "value" || key === "src" || key === "className") {
                        element[key] = attrs[key];
                    } else {
                        element.setAttribute(key, attrs[key]);
                    }
                }
            }
        }
        if (childs) {
            if (!(childs instanceof  Array)) {
                childs = [childs];
            }
            childs.forEach(function (el) {
                element.appendChild(el);
            });
        }
        return element;
    }

    function RestaurantMap(el, options){
        this.wrapper = el;
        this.worker = new EasyWebWorker("/js/mapworker.js", this);
        this.options = options || {};
        this.init();

    }

    RestaurantMap.prototype.init = function(){
        var that = this;
        this.yaMap = new ymaps.Map ("ya-map", $.extend({
            center: [50.5, 30.5],
            zoom: 9,
            state:{
                type: "yandex#satellite"
            }
        },this.options.map || {}));

        this.yaMap.controls
            .add('zoomControl', { left: 5, top: 5 })
            .add('typeSelector', { left: 130, top: 5})
            .add('mapTools', { left: 35, top: 5 });

        this.clusterer = new ymaps.Clusterer({clusterDisableClickZoom: true});
        this.yaMap.geoObjects.add(this.clusterer);

        $(document).on("click",".ymaps-b-balloon button.btn", function(e){
            var btnLocation = e.target.getAttribute("data-location");
            if(btnLocation){
                that.yaMap.setCenter(btnLocation.split("|"),17);
                that.yaMap.balloon.close();
            }
        });

    };

    RestaurantMap.prototype.createPlaceMark = function(item){
        var link = "/order-food/"+item.id,
            itemBody = createElement("div",{},[
                createElement("h3",{innerHTML:item.name}),
                createElement("h6",{innerHTML:item.address}),
                createElement("button",{className:"btn btn-default", "data-location":item.location.join("|"), innerHTML: "показать на карте"}),
                createElement("span",{className:"", innerHTML: "&nbsp;"}),
                createElement("a",{className:"btn btn-default", innerHTML: "сделать заказ", target: "_blank",href: link})
            ]);

//        var geoObj = new ymaps.GeoObject({
//            geometry: {type: "Point", coordinates: item.location},
//            properties: {
//                clusterCaption: item.name,
//                balloonContentBody: itemBody.outerHTML
//            }
//        });
        var geoObj = new ymaps.Placemark(item.location, {
            clusterCaption: item.name,
            balloonContentBody: itemBody.outerHTML
        }, {
            iconImageHref: '/img/marker.png',
            iconImageSize: [27, 30],
            iconImageOffset: [-13, -30]
        });

        itemBody = null;

        return geoObj;
    };


    RestaurantMap.prototype.createRoute = function(route){
        var that = this;
        this.yaMap.geoObjects.add(route);
        route.editor.start({
            //addWayPoints: true
        });
        route.editor.events.add('routeupdate', function (e) {
            that.updateRoute(route);
        });
        this.updateRoute(route);
        this.route = route;
    };

    RestaurantMap.prototype.removeRoute = function(){
        if(this.route){
            this.route.editor.stop();
            this.yaMap.geoObjects.remove(this.route);
            this.route = null;
        }
    };

    RestaurantMap.prototype.updateRoute = function(route){
        var i, path,
            pathsCoords = [],
            paths = route.getPaths();

        for(i=0;i<paths.getLength();i++){
            path = paths.get(i);

            pathsCoords.push(
                path.getSegments().reduce(function(coords,segment){
                    return coords.concat(segment.getCoordinates());
                },[])
            );
        }

        this.worker.execute("findPointsByPaths", pathsCoords);
    };

    RestaurantMap.prototype.findPointsByPathsCallback = function(events, points){
        this._setPoints(points);
    };

    RestaurantMap.prototype.setPoints = function(points){
        this.points = points;
        this.worker.execute("loadPoints", points);
        if(this.route){
            this.updateRoute(this.route);
        } else {
            this._setPoints(points);
        }
    };

    RestaurantMap.prototype._setPoints = function(points){
        this.clusterer.removeAll();
        this.clusterer.add(points.map(this.createPlaceMark));
    };

    RestaurantMap.prototype.findRoute = function(startPoint, endPoint){
        var that = this;
        ymaps.route([startPoint, endPoint], {
            mapStateAutoApply: true
        }).then(function (route) {
            that.createRoute(route);
        });
    };

    RestaurantMap.prototype.clearRoute = function(){
        this.removeRoute();
        this._setPoints(this.points);
    };


    window.RestaurantMap = RestaurantMap;


})();