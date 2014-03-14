importScripts("/libs/easy-web-worker.js");

function Point(x, y){
    if(y === undefined){
        y = x[1];
        x = x[0];
    }
    this.x = x;
    this.y = y;
}
Point.prototype.toString = function(){
    return '{x=' + this.x + ',y=' + this.y + '}';
};
Point.prototype.add = function(p){
    return new Point(this.x + p.x, this.y + p.y);
};
Point.prototype.sub = function(p){
    return new Point(this.x - p.x, this.y - p.y);
};
Point.prototype.mult = function(k){
    return new Point(this.x * k, this.y * k);
};
Point.prototype.negative = function(){
    return new Point(-this.x, -this.y);
};
Point.prototype.compare = function(p){
    return (this.x === p.x && this.y === p.y);
};
Point.prototype.clone = function(){
    return new Point(this.x, this.y);
};

var mathPoint = {
    PI_2: Math.PI/2,
    getLength: function(p1, p2){
        var dx = p1.x - p2.x, dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    },
    bound: function(min, max, val){
        return Math.max(min, Math.min(max, val));
    },
    //Return crossing point of two lines
    directCrossing: function(L1P1, L1P2, L2P1, L2P2){
        var temp, k1, k2, b1, b2, x, y;
        if(L2P1.x === L2P2.x){
            temp = L2P1;
            L2P1 = L1P1;
            L1P1 = temp;
            temp = L2P2;
            L2P2 = L1P2;
            L1P2 = temp;
        }
        if(L1P1.x === L1P2.x){
            k2 = (L2P2.y - L2P1.y) / (L2P2.x - L2P1.x);
            b2 = (L2P2.x * L2P1.y - L2P1.x * L2P2.y) / (L2P2.x - L2P1.x);
            x = L1P1.x;
            y = x * k2 + b2;
            return new Point(x, y);
        }else{
            k1 = (L1P2.y - L1P1.y) / (L1P2.x - L1P1.x);
            b1 = (L1P2.x * L1P1.y - L1P1.x * L1P2.y) / (L1P2.x - L1P1.x);
            k2 = (L2P2.y - L2P1.y) / (L2P2.x - L2P1.x);
            b2 = (L2P2.x * L2P1.y - L2P1.x * L2P2.y) / (L2P2.x - L2P1.x);
            x = (b1 - b2) / (k2 - k1);
            y = x * k1 + b1;
            return new Point(x, y);
        }
    },
    //Get point and check that point belong to segment of the line
    // if not - return the nearest point of segment
    boundOnLine: function(LP1, LP2, P){
        var x, y;
        x = mathPoint.bound(Math.min(LP1.x, LP2.x), Math.max(LP1.x, LP2.x), P.x);
        if(x != P.x){
            y = (x === LP1.x) ? LP1.y : LP2.y;
            P = new Point(x, y);
        }
        y = mathPoint.bound(Math.min(LP1.y, LP2.y), Math.max(LP1.y, LP2.y), P.y);
        if(y != P.y){
            x = (y === LP1.y) ? LP1.x : LP2.x;
            P = new Point(x, y);
        }
        return P;
    },
    getPointFromRadialSystem: function(angle, length, center){
        center = center || new Point(0, 0);
        return center.add(new Point(length * Math.cos(angle), length * Math.sin(angle)));
    },
    getAngle: function(p1, p2){
        var diff = p2.sub(p1);
        return this.normalizeAngle(Math.atan2(diff.y, diff.x));
    },
    toRadian: function(angle){
        return ((angle % 360) * Math.PI / 180);
    },
    toDegree: function(angle){
        return (angle * 180 / Math.PI ) % 360;
    },
    normalizeAngle: function( val){
        while(val < 0 ){
            val+= 2 * Math.PI;
        }
        while(val > 2 * Math.PI ){
            val-= 2 * Math.PI;
        }
        return val;
    }
};


var points = [];


function loadPoints(events, arr){
    points = arr;
    //console.log(arr);
}


function findPointsByPaths(events, pathsCoords){
    //console.log(pathsCoords);
    var paths = pathsCoords[0];
    var filteredPoints = points.filter(function(point){
        var i, ppAngle, pp1, pp2,
            pl2, plCross, length,
            minLength = Number.MAX_VALUE,
            pl = new Point(point.location);

        for(i=0;i<paths.length-1;i++){
            pp1 = new Point(paths[i]);
            pp2 = new Point(paths[i+1]);
            ppAngle = mathPoint.getAngle(pp1,pp2);
            pl2 = mathPoint.getPointFromRadialSystem(ppAngle + mathPoint.PI_2,1,pl);
            plCross = mathPoint.directCrossing(pp1,pp2,pl,pl2);
            plCross = mathPoint.boundOnLine(pp1,pp2,plCross);
            length = mathPoint.getLength(pl,plCross);
            if(minLength > length){
                minLength = length;
            }
        }
        return minLength < 0.005;
    });

    self.execute("findPointsByPathsCallback", filteredPoints);
}