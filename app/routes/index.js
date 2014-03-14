var _ = require("lodash");
/*
 * GET home page.
 */

function randLocation(cy,cx){
    return [
        cy + Math.random() * 0.18 - 0.09,
        cx + Math.random() * 0.32 - 0.16
    ];
}


exports.index = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.render('index', { title: 'Maps' });
};

exports.mapItems = function(req, res){
    var cy = 50.45, cx = 30.5;

    var count = 1000;

    if(req.query.type && req.query.type!=-1){
        count/=1.5;
    }
    if(req.query.time && req.query.time!=-1){
        count/=1.5;
    }
    if(req.query.dish && req.query.dish!=""){
        count/=1.5;
    }

    var items = _.range(count).map(function(index){
        return {
            id: 1000 + index,
            name: "cafe #" + index,
            address: "Vella village fry street 34 number",
            location: randLocation(cy,cx),
            rating: 4 + Math.random()
        };
    });
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.json(items);
};

exports.orderFood = function(req, res){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.render('orderFood', {
        title: 'order food on place #' + req.params.id
    });
};
