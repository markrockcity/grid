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
    var factor = Math.pow(2, 4);
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
    cx = Math.max(0, Math.min(1, cx));
    if (isNaN(cx))
        cx = 0;
    cy = Math.max(0, Math.min(1, cy));
    if (isNaN(cy))
        cy = 0;
    cz = Math.max(0, Math.min(1, cz));
    if (isNaN(cz))
        cz = 0;
    return new Cell(cx, cy, cz);
}
//UPDATE()
var lastRate = 0;
var avgRate = 0;
function update(framerate) {
    grid.update(function (c, ns) {
        var z = 0;
        for (var i = -1; i < 2; ++i)
            for (var j = -1; j < 2; ++j) {
                if (i == 0 && j == 0)
                    continue;
                var f = i == 0 || j == 0 ? 1 : 0.7;
                var n = ns.cell(i, j);
                if (n != null) {
                    c = apply(c, [[1, 0, 0], [0, 1, 0], [0.01 * n.z * i, 0.99 * n.z * j, 1]]);
                }
            }
        //return new Cell(c.x, c.y, z);
        return c;
    });
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
            //var M = c.z;
            var x = Math.max(0, Math.min(255, Math.floor(255 * (M / 2))));
            ctx.fillStyle = "rgba(0," + x + "," + x + ",1)";
            ctx.fillRect(w * i, h * j, w + 1, h + 1);
        }
    var renderVector = true;
    if (renderVector) {
        for (var i = 0; i < grid.width; ++i)
            for (var j = 0; j < grid.height; ++j) {
                var c = grid.cell(i, j);
                //ctx.strokeStyle = "rgba(0,205,0,0.25)";
                var s = 4;
                var mw = w * i + w / 2;
                var mh = h * j - h / 2;
                var lw = mw + c.x * s * w;
                var lh = mh + c.y * s * h;
                var grd = ctx.createLinearGradient(mw, mh, lw, lh);
                grd.addColorStop(0, "rgba(0,10,0,0.7)");
                grd.addColorStop(1, "rgba(0,255,0,1)");
                ctx.strokeStyle = grd;
                ctx.lineWidth = 1 + c.z * s * (s / 2);
                ctx.beginPath();
                ctx.moveTo(mw - 0.7, mh + h - 0.7);
                ctx.lineTo(lw + 0.7, lh + 0.7);
                //ctx.lineTo(mw +10, mh + 10);
                ctx.closePath();
                ctx.stroke();
                ctx.fillStyle = "rgba(255,0,0,0.7)";
                ctx.fillRect(w * i + w / 2 + c.x * s * w - 1, h * j + (h / 2) * (c.x + c.y == 0 ? 1 : -1) + c.y * s * h - 1, 1 + Math.abs(c.z * s), 1 + Math.abs(c.z * s));
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