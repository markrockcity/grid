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
        this.width = width;
        this.height = height;
        for (var i = 0; i < width * height; ++i)
            this.cells.push(new Cell(0, 0, 0));
    }
    Grid.prototype.cell = function (x, y) {
        return this.cells[y * this.width + x];
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
            //bottom-left
            if (y < this.height - 1)
                ns.cells[2][0] = (this.cell(x - 1, y + 1));
        }
        //top
        if (y > 0) {
            ns.cells[0][1] = this.cell(x, y - 1);
        }
        //bottom
        if (y < this.height - 1) {
            ns.cells[2][1] = this.cell(x, y + 1);
        }
        if (x < this.width - 1) {
            //top-right
            if (y > 0) {
                ns.cells[0][2] = this.cell(x + 1, y - 1);
                ns.length++;
            }
            //right
            ns.cells[1][1] = (this.cell(x + 1, y));
            //bottom-right
            if (y < this.height - 1)
                ns.cells[2][2] = (this.cell(x + 1, y + 1));
        }
        return ns;
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
//ONLOAD
window.onload = function () {
    canvas = document.getElementById("canvas1");
    ctx = canvas.getContext("2d");
    canvas.height = window.innerHeight * 0.9;
    canvas.width = window.innerWidth * 0.9;
    var factor = 10;
    ww = Math.floor(canvas.width / factor);
    hh = Math.floor(canvas.height / factor);
    w = (canvas.width / ww);
    h = (canvas.height / hh);
    grid = new Grid(ww, hh);
    //middle
    mh = hh / 2, mw = ww / 2;
    //when clicking on canvas:
    canvas.addEventListener("click", function (event) {
        if (paused)
            return;
        var x = Math.floor((event.pageX - canvas.offsetLeft) / w);
        var y = Math.floor((event.pageY - canvas.offsetTop) / h);
        grid.cell(x, y).z = 1;
    }, false);
    main();
};
//UPDATE()
var lastRate = 0;
var avgRate = 0;
function update(framerate) {
    function updateCell(c, n, m, l) {
        if (c.z > n.z) {
            var x = c.z / 8;
            c.z -= x;
            n.z += x;
            c.z = Math.max(0, Math.min(1, c.z));
            if (isNaN(c.z))
                c.z = 0;
        }
    }
    for (var i = 0; i < grid.width; ++i)
        for (var j = 0; j < grid.height; ++j) {
            var c = grid.cell(i, j);
            var ns = grid.neighbors(i, j);
            //top
            var n = ns.cell(0, -1);
            if (n != null)
                updateCell(c, n, null, ns.length);
            //left
            var n = ns.cell(-1, 0);
            if (n != null)
                updateCell(c, n, null, ns.length);
            //right
            var n = ns.cell(1, 0);
            if (n != null)
                updateCell(c, n, null, ns.length);
            //bottom
            var n = ns.cell(0, 1);
            if (n != null)
                updateCell(c, n, null, ns.length);
        }
    avgRate = (framerate + lastRate) / 2;
    lastRate = framerate;
}
//RENDER()
function render() {
    //var bgColor = `rgb(0,0,0)`;
    //ctx.fillStyle = bgColor;
    //ctx.fillRect(0,0,canvas.width,canvas.height);
    for (var i = 0; i < grid.width; ++i)
        for (var j = 0; j < grid.height; ++j) {
            //var alt = i % 2 == 0 && j % 2 > 0 || i % 2 > 0 && j % 2 == 0;
            //ctx.fillStyle =  alt ? "rgb(220,190,91)" : "rgb(255,220,190)";
            var x = Math.max(0, Math.min(255, Math.floor(255 * grid.cell(i, j).z * 20)));
            ctx.fillStyle = "rgb(" + x + "," + x + "," + x + ")";
            ctx.fillRect(w * i, h * j, w + 1, h + 1);
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