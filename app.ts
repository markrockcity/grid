//random-integer()
function randi(min,max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//random-float()
function rand(min,max)
{
   return Math.random() * (max - min ) + min;
}

declare type UpdateCellFn = (c : Cell, ns : Neighborhood) => Cell;

//GRID class
class Grid
{
    private cells : Cell[] = [];

    readonly width : number;
    readonly height: number;

    private grid1 : Cell[] = [];
    private grid2 : Cell[] = [];

    private readonly wall = new Cell(0,0,0);

    
    constructor(width: number, height: number)
    {
       this.width = width;
       this.height = height;

       for(var i=0; i<width*height; ++i)
       {
           this.grid1.push(new Cell(0,0,0));
           this.grid2.push(new Cell(0,0,0));
       }

       this.cells = this.grid1;
    }

    cell(x:number, y:number) : Cell
    {
        return this.cells[y*this.width+x];
    }

    
    setCell(x:number, y:number, c:Cell)
    {
        this.cells[y*this.width+x] = c;
    }

    neighbors(x:number, y:number) : Neighborhood
    {
        var ns = new Neighborhood();
        var c  = this.cell(x,y);

        if (x > 0)
        {
            //top-left
            if (y > 0)
            {
                //ns.cells[0][0] = this.cell(x-1, y-1);
                //ns.length++;
            }

            //left
            ns.cells[1][0]=(this.cell(x-1,y));
            ns.matrixes[1][0] = [[1,0,0],[0,1,0],[0.707,0,0.707]];
            ns.length++;


            //bottom-left
            if (y < this.height-1)
            {
                //ns.cells[2][0]=(this.cell(x-1,y+1));
                //ns.length++;
            }

        }
        else
        {
            //left wall
            ns.cells[1][0] = this.wall;
            ns.matrixes[1][0] = [[c.x < 0 ? -1 : 1, 0, 0],[0,1,0],[0,0,1]];
        }

        //top
        if (y > 0)
        {
            //ns.cells[0][1] = this.cell(x,y-1);
            //ns.length++;
        }

        //bottom
        if (y < this.height-1)
        {
            //ns.cells[2][1] = this.cell(x,y+1);
            //ns.length++;
        }

        
        if (x < this.width-1)
        {
            //top-right
            if (y > 0)
            {
                //ns.cells[0][2] = this.cell(x+1, y-1);
                //ns.length++;
            }

            //right
            ns.cells[1][1]=(this.cell(x+1,y));
            ns.matrixes[1][1] = [[1,0,0],[0,1,0],[-0.707,0,0.707]];
            ns.length++;

            //bottom-right
            if (y < this.height-1)
            {
                //ns.cells[2][2]=(this.cell(x+1,y+1));
                //ns.length++;
            }
        }
        else
        {
            //right-wall
            ns.cells[1][1] = this.wall;
            ns.matrixes[1][1] = [[c.x > 0 ? -1 : 1, 0, 0],[0,1,0],[0,0,1]];
        }


        return ns;
    }

    

    update(updateCell : UpdateCellFn) : void
    {
        var nextGrid = (this.cells==this.grid1 ? this.grid2 : this.grid1);

        for(var i=0; i < this.width; ++i)
        for(var j=0; j < this.height; ++j)
        {
            var c  = this.cell(i,j);
            var ns = this.neighbors(i,j);
            
            var nextCell = updateCell(c,ns);
            nextGrid[j*this.width+i] = nextCell || c;
        }

        this.cells = nextGrid;
    }
}

//CELL class
class Cell
{
    readonly x : number;
    readonly y : number;
    readonly z : number;

    constructor(x : number, y : number, z : number)
    {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

//NEIGHBORHOOD class
class Neighborhood
{
    length = 0;
    readonly cells : Cell[][];
    readonly matrixes: number[][][][] // e.g., matrixes[x][y] = [[...],[...],[...]]

    constructor()
    {
        this.cells = [[null,null,null],[null,null],[null,null,null]];
        this.matrixes = [[null,null,null],[null,null],[null,null,null]];
    }
    
    cell(x:number, y:number) : Cell 
    {
        if (y==0) 
            return this.cells[1][x==-1 ? 0 : 1]
        else
            return this.cells[y+1][x+1];
    }    

    matrix(x:number, y:number) : number[][]
    {
        if (y==0) 
            return this.matrixes[1][x==-1 ? 0 : 1]
        else
            return this.matrixes[y+1][x+1];
    }    
}


var canvas : HTMLCanvasElement;
var ctx : CanvasRenderingContext2D;

var ww, hh, w, h, mh, mw : number; //middle

var grid : Grid;
var mousedown = false;

//ONLOAD
window.onload = () =>
{
    canvas = document.getElementById("canvas1") as HTMLCanvasElement;
    ctx = canvas.getContext("2d");

    canvas.height = window.innerHeight * 0.9;
    canvas.width  = window.innerWidth * 0.989;

    //FACTOR
    const factor = Math.pow(2,4);

    ww = Math.floor(canvas.width / factor);
    hh = Math.floor(canvas.height / factor);

    w = (canvas.width / ww); 
    h = (canvas.height / hh);

    grid = new Grid(ww,hh);

    //middle
    mh = hh/2, mw = ww/2;

    var d = 0.1;

    //when clicking on canvas:
    var x,y : number;

    // DO EVENT ////////////////////////////////////////////////////////////////
    function doEvent(pageX : number, pageY : number)
    {
        x = Math.floor((pageX-canvas.offsetLeft) / w);
        y = Math.floor((pageY-canvas.offsetTop) / h);
        var c = grid.cell(x,y);
        grid.setCell(x,y,c.z > 0 ? new Cell(0,0,0) : new Cell(-1, -1, c.z > 0 ? 0 : 1));
    }
    
    canvas.addEventListener("mousedown", event =>
    {
        mousedown = true;
        doEvent(event.pageX, event.pageY);
    },false);
    
    canvas.addEventListener("touchstart", event =>
    {
        mousedown = true;

        doEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    },false);
    
    canvas.addEventListener("mouseup", event =>
    {
       mousedown = false;
    },false);
    
    canvas.addEventListener("mousemove", event =>
    {
        if (paused || !mousedown)
            return;

        doEvent(event.pageX, event.pageY);
    }, 
    false);

    canvas.addEventListener("touchmove", event =>
    {
        if (paused || !mousedown)
            return;

        doEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY);
    }, 
    false);

    main();
};

//apply()
function apply(c : Cell, m : number[][])
{
   var cx = c.x * m[0][0] + c.y * m[1][0] + c.z * m[2][0];
   var cy = c.x * m[0][1] + c.y * m[1][1] + c.z * m[2][1];
   var cz = c.x * m[0][2] + c.y * m[1][2] + c.z * m[2][2];

   cx = Math.max(0,Math.min(1,cx)); if (isNaN(cx)) cx = 0;
   cy = Math.max(0,Math.min(1,cy)); if (isNaN(cy)) cy = 0;
   cz = Math.max(0,Math.min(1,cz)); if (isNaN(cz)) cz = 0;

   return new Cell(cx,cy,cz);
}

//sum()
function sum(cells:Cell[]) : Cell
{
   var sum = [0,0,0];
   for(var i = 0; i < cells.length; ++i)
   {
       sum[0] += cells[i].x;
       sum[1] += cells[i].y;
       sum[2] += cells[i].z;
   }
   return new Cell(sum[0],sum[1],sum[2]);
}

//zprod()
function zprod(cells:Cell[]) : number
{
    var prod = 1;
    for(var i = 0; i < cells.length; ++i)
        prod *= cells[i].z;
    return prod;
}


//UPDATE() ****************************************************************
var lastRate = 0;
var avgRate  = 0; 
function update(framerate)
{

    grid.update((c:Cell, ns:Neighborhood) =>
    {
        //var z = 0;
        
        //var rs : Cell[] = [];

        for(var i=-1; i < 2; ++i)
        for(var j=-1; j < 2; ++j)
        {
            if (i==0 && j==0) 
                continue;
            
            //var f = i==0 || j==0 ? 1 : 0.7;

            var n = ns.cell(i,j);    
            
           
            if (n != null)
            {
                //var c = new Cell((c.x-n.x)/ns.length, (c.y-n.y)/ns.length, (c.z-n.z)/ns.length);
                // var r = apply(c, ns.matrix(i,j));
                //rs.push(r);
            }
        }
               
        //var s = sum(rs);
        //var r = new Cell(s.x, s.y, 2 * ns.length * zprod(rs));

        //return r;
        return c;
       
    });
   

    avgRate  = (framerate + lastRate)/2;
    lastRate = framerate;        
}



//RENDER() ################################################################
function render()
{
    //var bgColor = `rgb(0,0,0)`;
    //ctx.fillStyle = bgColor;
    //ctx.fillRect(0,0,canvas.width,canvas.height);

    
    ctx.lineWidth = 1;

    for(var i=0; i < grid.width; ++i)
    for(var j=0; j < grid.height; ++j)
    {

        var c = grid.cell(i,j);

        //var M = (Math.sqrt(c.x*c.x + c.y*c.y + c.z*c.z)); //magnitude
        //var M = c.z;
        var x = Math.max(0,Math.min(255,Math.floor(512 * c.z)));
        ctx.fillStyle = `rgba(0,${x},${x},1)`
        ctx.fillRect(w * i , h * j, w+1, h+1);
    }

    var renderVector = true;

    if (renderVector)
    {
        for(var i=0; i < grid.width; ++i)
        for(var j=0; j < grid.height; ++j)
        {

            var c = grid.cell(i,j);

            //ctx.strokeStyle = "rgba(0,205,0,0.25)";

            var s = 1;
            var t = s * 5;
            var mw = w * i + w/2;
            var mh = h * j - h/2;
            var lw = mw + c.x*s * w ;
            var lh = mh + c.y*s * h;

            //line
            var grd=ctx.createLinearGradient(mw,mh,lw,lh);
            grd.addColorStop(0,"rgba(0,10,0,0.7)");
            grd.addColorStop(1,"rgba(0,255,0,1)");
            ctx.strokeStyle = grd;
            ctx.lineWidth = 1+c.z*t;
            ctx.beginPath();
            ctx.moveTo(mw, mh+h+0.5);
            ctx.lineTo(lw, lh+h+0.5);
            //ctx.lineTo(mw +10, mh + 10);
            ctx.closePath();
            ctx.stroke();

            //tip
            ctx.fillStyle = "rgba(255,0,0,0.7)";
            ctx.fillRect
                (w * i + (w/2) + c.x*s * w - Math.abs(c.z*t)/2, 
                 h * j + (h/2) + c.y*s * h - Math.abs(c.z*t)/2,
                 0.5+Math.abs(c.z*t),
                 0.5+Math.abs(c.z*t));
        }
    }


    //dot
    ctx.fillStyle="red";
    ctx.fillRect(canvas.width-3,canvas.height-3,2,2);
}

//MAIN()
var then = Date.now();
var paused = false;
function main() 
{
    // Request to do this again ASAP
    if (!paused)
        requestAnimationFrame(main);
    
    var now = Date.now();
    var delta = now - then;

    update(1/(delta/1000));
    render();

    then = now;
};



