//compilation of https://github.com/markrockcity/grid/blob/master/app.ts
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
//GRID class
var Grid1 = (function (_super) {
    __extends(Grid1, _super);
    function Grid1() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Grid1.prototype.activateCell = function (x, y, button) {
        var c = this.cell(x, y);
        this.setCell(x, y, new Cell1(c.x, c.y, button == 2 ? 0 : 2));
    };
    Grid1.prototype.createCell = function () {
        return new Cell1(0, 0, 0);
    };
    Grid1.prototype.reflectLeftWall = function (c) {
        return c.x < 0;
    };
    Grid1.prototype.reflectRightWall = function (c) {
        return c.x > 0;
    };
    return Grid1;
}(Grid));
var Cell1 = (function () {
    function Cell1(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Cell1.prototype.getRenderStyle = function () {
        var x = Math.max(0, Math.min(255, Math.floor(255 * this.z)));
        return "rgba(" + x + "," + x + "," + x + ",1)";
    };
    Cell1.prototype.update = function (ns) {
        var z = this.z;
        for (var i = -1; i < 2; ++i)
            for (var j = -1; j < 2; ++j) {
                if (i == 0 && j == 0)
                    continue;
                //var f = i==0 || j==0 ? 1 : 0.7;
                var n = ns.cell(i, j);
                if (n != null) {
                    //var c = new Cell((c.x-n.x)/ns.length, (c.y-n.y)/ns.length, (c.z-n.z)/ns.length);
                    // var r = apply(c, ns.matrix(i,j));
                    //rs.push(r);
                    var d = n.z - this.z;
                    if (d > 0.01)
                        z += 1 / 512;
                    else if (d < -0.01)
                        z -= 1 / 512;
                    else if (randi(0, 1000) < 2)
                        z -= 1 / 256;
                }
            }
        //var s = sum(rs);
        //var r = new Cell(s.x, s.y, 2 * ns.length * zprod(rs));
        //return r;
        return new Cell1(this.x, this.y, z);
    };
    return Cell1;
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
    grid = new Grid1(ww, hh);
    //middle
    mh = hh / 2, mw = ww / 2;
    var d = 0.1;
    //when clicking on canvas:
    var x, y;
    // DO EVENT ////////////////////////////////////////////////////////////////
    function doEvent(pageX, pageY, button) {
        if (button === void 0) { button = 0; }
        x = Math.floor((pageX - canvas.offsetLeft) / w);
        y = Math.floor((pageY - canvas.offsetTop) / h);
        grid.activateCell(x, y, button);
    }
    canvas.addEventListener("mousedown", function (event) {
        mousedown = true;
        //console.log(event.button);
        doEvent(event.pageX, event.pageY, event.button);
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
        doEvent(event.pageX, event.pageY, event.button);
    }, false);
    canvas.addEventListener("touchmove", function (event) {
        if (paused || !mousedown)
            return;
        doEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    }, false);
    canvas.addEventListener("contextmenu", function (ev) { return ev.preventDefault(); });
    //KEYDOWN EVENT
    document.addEventListener("keydown", function (event) {
        if (event.keyCode == 32) {
            if (!paused)
                paused = true;
            else {
                update(-1);
                render();
            }
        }
    });
    document.addEventListener("keyup", function (event) {
        if (event.keyCode == 27) {
            paused = false;
            main();
        }
    });
    main();
};
//apply()
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
    return new Cell1(cx, cy, cz);
}
//sum()
function sum(cells) {
    var sum = [0, 0, 0];
    for (var i = 0; i < cells.length; ++i) {
        sum[0] += cells[i].x;
        sum[1] += cells[i].y;
        sum[2] += cells[i].z;
    }
    return new Cell1(sum[0], sum[1], sum[2]);
}
//zprod()
function zprod(cells) {
    var prod = 1;
    for (var i = 0; i < cells.length; ++i)
        prod *= cells[i].z;
    return prod;
}
//UPDATE() ****************************************************************
var lastRate = 0;
var avgRate = 0;
function update(framerate) {
    grid.update(framerate);
    avgRate = (framerate + lastRate) / 2;
    lastRate = framerate;
}
//RENDER() ################################################################
function render() {
    //var bgColor = `rgb(0,0,0)`;
    //ctx.fillStyle = bgColor;
    //ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.lineWidth = 1;
    for (var i = 0; i < grid.width; ++i)
        for (var j = 0; j < grid.height; ++j) {
            var c = grid.cell(i, j);
            //var M = (Math.sqrt(c.x*c.x + c.y*c.y + c.z*c.z)); //magnitude
            //var M = c.z;
            ctx.fillStyle = c.getRenderStyle();
            ctx.fillRect(w * i, h * j, w + 1, h + 1);
        }
    var renderVector = false;
    if (c instanceof Cell1 && renderVector) {
        var cell = c;
        for (var i = 0; i < grid.width; ++i)
            for (var j = 0; j < grid.height; ++j) {
                var cellc = grid.cell(i, j);
                //ctx.strokeStyle = "rgba(0,205,0,0.25)";
                var s = 1;
                var t = s * 5;
                var mw = w * i + w / 2;
                var mh = h * j - h / 2;
                var lw = mw + cell.x * s * w;
                var lh = mh + cell.y * s * h;
                //line
                var grd = ctx.createLinearGradient(mw, mh, lw, lh);
                grd.addColorStop(0, "rgba(0,10,0,0.7)");
                grd.addColorStop(1, "rgba(0,255,0,1)");
                ctx.strokeStyle = grd;
                ctx.lineWidth = 1 + cell.z * t;
                ctx.beginPath();
                ctx.moveTo(mw, mh + h + 0.5);
                ctx.lineTo(lw, lh + h + 0.5);
                //ctx.lineTo(mw +10, mh + 10);
                ctx.closePath();
                ctx.stroke();
                //tip
                ctx.fillStyle = "rgba(255,0,0,0.7)";
                ctx.fillRect(w * i + (w / 2) + cell.x * s * w - Math.abs(cell.z * t) / 2, h * j + (h / 2) + cell.y * s * h - Math.abs(cell.z * t) / 2, 0.5 + Math.abs(cell.z * t), 0.5 + Math.abs(cell.z * t));
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