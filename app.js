//random-integer()
function randi(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//random-float()
function rand(min, max) {
    return Math.random() * (max - min) + min;
}
//GRID class
var Grid = (function () {
    function Grid(width, height) {
        this.cells = [];
        this.grid1 = [];
        this.grid2 = [];
        this.width = width;
        this.height = height;
        for (var i = 0; i < width * height; ++i) {
            this.grid1.push(new Cell(0, 0, 0));
            this.grid2.push(new Cell(0, 0, 0));
        }
        this.cells = this.grid1;
    }
    Grid.prototype.cell = function (x, y) {
        return this.cells[y * this.width + x];
    };
    Grid.prototype.glub = function (x, y, d) {
        var c = this.cells[y * this.width + x];
        this.cells[y * this.width + x] = new Cell(c.x, c.y, c.z + d);
    };
    Grid.prototype.neighbors = function (x, y) {
        var ns = new Neighborhood();
        if (x > 0) {
            //top-left
            if (y > 0) {
                ns.cells[0][0] = this.cell(x - 1, y - 1);
                ns.length++;
            }
            //left
            ns.cells[1][0] = (this.cell(x - 1, y));
            ns.length++;
            //bottom-left
            if (y < this.height - 1) {
                ns.cells[2][0] = (this.cell(x - 1, y + 1));
                ns.length++;
            }
        }
        //top
        if (y > 0) {
            ns.cells[0][1] = this.cell(x, y - 1);
            ns.length++;
        }
        //bottom
        if (y < this.height - 1) {
            ns.cells[2][1] = this.cell(x, y + 1);
            ns.length++;
        }
        if (x < this.width - 1) {
            //top-right
            if (y > 0) {
                ns.cells[0][2] = this.cell(x + 1, y - 1);
                ns.length++;
            }
            //right
            ns.cells[1][1] = (this.cell(x + 1, y));
            ns.length++;
            //bottom-right
            if (y < this.height - 1) {
                ns.cells[2][2] = (this.cell(x + 1, y + 1));
                ns.length++;
            }
        }
        return ns;
    };
    Grid.prototype.update = function (updateCell) {
        var nextGrid = this.cells == this.grid1 ? this.grid2 : this.grid1;
        for (var i = 0; i < this.width; ++i)
            for (var j = 0; j < this.height; ++j) {
                var c = this.cell(i, j);
                var ns = this.neighbors(i, j);
                var nextCell = updateCell(c, ns);
                nextGrid[j * this.width + i] = nextCell || c;
            }
        this.cells = nextGrid;
    };
    return Grid;
}());
//CELL class
var Cell = (function () {
    function Cell(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Cell;
}());
//NEIGHBORHOOD class
var Neighborhood = (function () {
    function Neighborhood() {
        this.length = 0;
        this.cells = [[null, null, null], [null, null], [null, null, null]];
    }
    Neighborhood.prototype.cell = function (x, y) {
        if (y == 0)
            return this.cells[1][x == -1 ? 0 : 1];
        else
            return this.cells[y + 1][x + 1];
    };
    return Neighborhood;
}());
var canvas;
var ctx;
var ww, hh, w, h, mh, mw; //middle
var grid;
var mousedown = false;
//ONLOAD
window.onload = function () {
    canvas = document.getElementById("canvas1");
    ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight * 0.9;
    canvas.width = window.innerWidth * 0.989;
    //FACTOR
    var factor = 25;
    ww = Math.floor(canvas.width / factor);
    hh = Math.floor(canvas.height / factor);
    w = (canvas.width / ww);
    h = (canvas.height / hh);
    grid = new Grid(ww, hh);
    //middle
    mh = hh / 2, mw = ww / 2;
    var d = 0.1;
    //when clicking on canvas:
    var x, y;
    function doEvent(pageX, pageY) {
        x = Math.floor((pageX - canvas.offsetLeft) / w);
        y = Math.floor((pageY - canvas.offsetTop) / h);
        grid.glub(x, y, d);
        //c.x -= d*3;
        //c.y -= d;
    }
    canvas.addEventListener("mousedown", function (event) {
        mousedown = true;
        doEvent(event.pageX, event.pageY);
    }, false);
    canvas.addEventListener("touchstart", function (event) {
        mousedown = true;
        doEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    }, false);
    canvas.addEventListener("mouseup", function (event) {
        mousedown = false;
    }, false);
    canvas.addEventListener("mousemove", function (event) {
        if (paused || !mousedown)
            return;
        doEvent(event.pageX, event.pageY);
    }, false);
    canvas.addEventListener("touchmove", function (event) {
        if (paused || !mousedown)
            return;
        doEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    }, false);
    main();
};
function apply(c, m) {
    var cx = c.x * m[0][0] + c.y * m[1][0] + c.z * m[2][0];
    var cy = c.x * m[0][1] + c.y * m[1][1] + c.z * m[2][1];
    var cz = c.x * m[0][2] + c.y * m[1][2] + c.z * m[2][2];
    return new Cell(cx, cy, cz);
}
//UPDATE()
var lastRate = 0;
var avgRate = 0;
function update(framerate) {
    /*function updateCell(c : Cell, n : Cell, m : number[][], l : number) : Cell
    {
        if (c==null || n==null)
            return;

        /*
        l = Math.max(2,l);
        var cn = [(c.x-n.x)*(1/l), (c.y-n.y)*(1/l), (c.z-n.z)*(1/l)];

        n.x += cn[0];
        n.y += cn[1];
        n.z += cn[2];
        //apply(n,m);

        n.y = Math.max(-1,Math.min(1,n.y))
        n.x = Math.max(-1,Math.min(1,n.x))
        n.z = Math.max(-1,Math.min(1,n.z))

        if (isNaN(n.x))  n.x = 0;
        if (isNaN(n.y))  n.y = 0;
        if (isNaN(n.z))  n.z = 0;
         
    }
    
    var mRight = [[1,0,0],[0,1,0],[0.7,0,0.7]];
    var mLeft = [[1,0,0],[0,1,0],[-0.7,0,0.7]];
    var mTop = [[1,0,0],[0,1,0],[0,0.7,0.7]];
    var mBottom = [[1,0,0],[0,1,0],[0,-0.7,0.7]];
    var mIdent = [[1,0,0],[0,1,0],[0,0,1]];*/
    grid.update(function (c, ns) {
        var z = 0;
        for (var i = -1; i < 2; ++i)
            for (var j = -1; j < 2; ++j) {
                var f = i == 0 || j == 0 ? 1 : 0.707;
                var n = ns.cell(i, j);
                if (n != null) {
                    if (n.z > c.z) {
                        z += (n.z / ns.length) * f;
                    }
                    else if (n.z < c.z) {
                        z -= (n.z / ns.length) * f;
                    }
                    else {
                        //z -= 0.1;
                    }
                }
            }
        return apply(new Cell(c.x, c.y, c.z + z), [[1, 0, 0], [0, 1, 0], [0, 0, 0.8]]);
    });
    /*
    for(var i=0; i < grid.width; ++i)
    for(var j=0; j < grid.height; ++j)
    {
        var c = grid.cell(i,j);
        var ns = grid.neighbors(i,j);
        var ns2 = [];
        var ms = [];

        var a = [[-1,0], [1,0],  [0,-1], [0,1]];
        for(var k=0; k < a.length; ++k)
        {
            var n = ns.cell(a[k][0],a[k][1]);
            if (n != null)
            {
                ns2.push(n);
                ms.push(ns.matrix(a[k][0],a[k][1]));
            }
        }


        var x = [0,0,0];

        for(var k=0; k < ns2.length; ++k)
        {
            x[0] += ns2[k].x;
            x[1] += ns2[k].y;
            x[2] += ns2[k].z;
        }
                


        for(var k=ns2.length-1; k > -1; --k)
            updateCell(c,ns2[k],ms[k],ns2.length);
        
        
        var y = ns2.length/(ns2.length+1);
        //y = (-2/3);
        var nc = [(x[0]-c.x)*y, (x[1]-c.y)*y, (x[2]-c.z)*y];
        c.x += nc[0];
        c.y += nc[1];
        c.z += nc[2] * 0.001;


        //die off
        c.x *= 0.99;
        c.y *= 0.99;
        c.z *= 0.99;


        c.z = Math.max(0,Math.min(1,c.z));

        if (isNaN(c.z))
            c.z = 0;
    }*/
    avgRate = (framerate + lastRate) / 2;
    lastRate = framerate;
}
//RENDER()
function render() {
    //var bgColor = `rgb(0,0,0)`;
    //ctx.fillStyle = bgColor;
    //ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.lineWidth = 1;
    for (var i = 0; i < grid.width; ++i)
        for (var j = 0; j < grid.height; ++j) {
            var c = grid.cell(i, j);
            var M = (Math.sqrt(c.x * c.x + c.y * c.y + c.z * c.z)); //magnitude
            var x = Math.max(0, Math.min(255, Math.floor(255 * M * 30)));
            ctx.fillStyle = "rgb(0," + x + "," + x + ")";
            ctx.fillRect(w * i, h * j, w + 1, h + 1);
        }
    var renderVector = true;
    if (renderVector) {
        for (var i = 0; i < grid.width; ++i)
            for (var j = 0; j < grid.height; ++j) {
                var c = grid.cell(i, j);
                //ctx.strokeStyle = "rgba(0,205,0,0.25)";
                var mw = w * i + w / 2;
                var mh = h * j - h / 2;
                var lw = mw + c.x * 100 * w;
                var lh = mh + c.y * 100 * h;
                var grd = ctx.createLinearGradient(mw, mh, lw, lh);
                grd.addColorStop(0, "black");
                grd.addColorStop(1, "green");
                ctx.strokeStyle = grd;
                ctx.lineWidth = 1 + c.z * 1000;
                ctx.beginPath();
                ctx.moveTo(mw - 0.7, mh - 0.7);
                //ctx.lineTo(lw + 0.7, lh + 0.7);
                ctx.moveTo(mw + 10, mh + 10);
                ctx.closePath();
                ctx.stroke();
                //ctx.fillStyle = "rgba(255,0,0,1)";
                //ctx.fillRect(w * i + w/2 + c.x*100 * w - 1, h * j - h/2 + c.y*100 * h - 1,1+Math.abs(c.z*100),1+Math.abs(c.z*100))
            }
    }
    //dot
    ctx.fillStyle = "red";
    ctx.fillRect(canvas.width - 3, canvas.height - 3, 2, 2);
}
//MAIN()
var then = Date.now();
var paused = false;
function main() {
    // Request to do this again ASAP
    if (!paused)
        requestAnimationFrame(main);
    var now = Date.now();
    var delta = now - then;
    update(1 / (delta / 1000));
    render();
    then = now;
}
;
//# sourceMappingURL=app.js.map