$(function(){
    var restaurantMap,
        points;

    $("#map-path-find").on("click",function(){
        restaurantMap.findRoute(
            $("#map-form-box [name='start_point']").val(),
            $("#map-form-box [name='end_point']").val()
        );
        return false;
    });

    $("#map-path-clear").on("click",function(){
        restaurantMap.clearRoute();
        $("#map-form-box [name='start_point']").val("");
        $("#map-form-box [name='end_point']").val("");
        return false;
    });


    $("#map-filter-find").on("click",function(){
        $.getJSON("/mapitems",{
            type: $("#map-form-box [name='type_filter']").val(),
            time: $("#map-form-box [name='time_filter']").val(),
            dish: $("#map-form-box [name='dish_filter']").val()
        },function(items){
            restaurantMap.setPoints(items);
        });
        return false;
    });

    $("#map-filter-clear").on("click",function(){
        restaurantMap.setPoints(points);
        $("#map-form-box [name='type_filter']").val(-1);
        $("#map-form-box [name='time_filter']").val(-1);
        $("#map-form-box [name='dish_filter']").val("");
        return false;
    });



    ymaps.ready(function(){
        restaurantMap = new RestaurantMap(document.getElementById("ya-map"),{

        });
        $.getJSON("/mapitems",function(items){
            points = items;
            restaurantMap.setPoints(items);
        });
    });

});