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
//GRID<TCELL> class
var Grid = (function () {
    function Grid(width, height) {
        this.cells = [];
        this.grid1 = [];
        this.grid2 = [];
        this.wall = this.createCell();
        this.width = width;
        this.height = height;
        for (var i = 0; i < width * height; ++i) {
            this.grid1.push(this.createCell());
            this.grid2.push(this.createCell());
        }
        this.cells = this.grid1;
    }
    Grid.prototype.reflectLeftWall = function (cell) {
        return false;
    };
    Grid.prototype.reflectRightWall = function (cell) {
        return false;
    };
    Grid.prototype.cell = function (x, y) {
        return this.cells[y * this.width + x];
    };
    Grid.prototype.setCell = function (x, y, cell) {
        this.cells[y * this.width + x] = cell;
    };
    Grid.prototype.neighbors = function (x, y) {
        var ns = new Neighborhood();
        var c = this.cell(x, y);
        if (x > 0) {
            //top-left
            if (y > 0) {
                ns.cells[0][0] = this.cell(x - 1, y - 1);
                ns.length++;
            }
            //left
            ns.cells[1][0] = (this.cell(x - 1, y));
            ns.matrixes[1][0] = [[1, 0, 0], [0, 1, 0], [0.707, 0, 0.707]];
            ns.length++;
            //bottom-left
            if (y < this.height - 1) {
                ns.cells[2][0] = (this.cell(x - 1, y + 1));
                ns.length++;
            }
        }
        else {
            //left wall
            ns.cells[1][0] = this.wall;
            ns.matrixes[1][0] = [[this.reflectLeftWall(c) ? -1 : 1, 0, 0], [0, 1, 0], [0, 0, 1]];
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
            ns.matrixes[1][1] = [[1, 0, 0], [0, 1, 0], [-0.707, 0, 0.707]];
            ns.length++;
            //bottom-right
            if (y < this.height - 1) {
                ns.cells[2][2] = (this.cell(x + 1, y + 1));
                ns.length++;
            }
        }
        else {
            //right-wall
            ns.cells[1][1] = this.wall;
            ns.matrixes[1][1] = [[this.reflectRightWall(c) ? -1 : 1, 0, 0], [0, 1, 0], [0, 0, 1]];
        }
        return ns;
    };
    Grid.prototype.update = function (updateCell) {
        var nextGrid = (this.cells == this.grid1 ? this.grid2 : this.grid1);
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
//NEIGHBORHOOD class
var Neighborhood = (function () {
    function Neighborhood() {
        this.length = 0;
        this.cells = [[null, null, null], [null, null], [null, null, null]];
        this.matrixes = [[null, null, null], [null, null], [null, null, null]];
    }
    Neighborhood.prototype.cell = function (x, y) {
        if (y == 0)
            return this.cells[1][x == -1 ? 0 : 1];
        else
            return this.cells[y + 1][x + 1];
    };
    Neighborhood.prototype.matrix = function (x, y) {
        if (y == 0)
            return this.matrixes[1][x == -1 ? 0 : 1];
        else
            return this.matrixes[y + 1][x + 1];
    };
    return Neighborhood;
}());
//# sourceMappingURL=grid.js.map