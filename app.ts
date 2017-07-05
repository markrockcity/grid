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

    glub(x:number, y:number, d:number)
    {
        var c = this.cells[y*this.width+x];
        this.cells[y*this.width+x] = new Cell(c.x,c.y,c.z+d);
    }

    neighbors(x:number, y:number) : Neighborhood
    {
        var ns = new Neighborhood();

        if (x > 0)
        {
            //top-left
            if (y > 0)
            {
                ns.cells[0][0] = this.cell(x-1, y-1);
                ns.length++;
            }

            //left
            ns.cells[1][0]=(this.cell(x-1,y));
            ns.length++;


            //bottom-left
            if (y < this.height-1)
            {
                ns.cells[2][0]=(this.cell(x-1,y+1));
                ns.length++;
            }

        }

        //top
        if (y > 0)
        {
            ns.cells[0][1] = this.cell(x,y-1);
            ns.length++;
        }

        //bottom
        if (y < this.height-1)
        {
            ns.cells[2][1] = this.cell(x,y+1);
            ns.length++;
        }

        
        if (x < this.width-1)
        {
            //top-right
            if (y > 0)
            {
                ns.cells[0][2] = this.cell(x+1, y-1);
                ns.length++;
            }

            //right
            ns.cells[1][1]=(this.cell(x+1,y));
            ns.length++;

            //bottom-right
            if (y < this.height-1)
            {
                ns.cells[2][2]=(this.cell(x+1,y+1));
                ns.length++;
            }
        }


        return ns;
    }

    

    update(updateCell : UpdateCellFn) : void
    {
        var nextGrid = this.cells == this.grid1 ? this.grid2 : this.grid1;

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
    cells  = [[null,null,null],[null,null],[null,null,null]];
    
    cell(x:number, y:number) : Cell 
    {
        if (y==0) 
            return this.cells[1][x==-1 ? 0 : 1]
        else
            return this.cells[y+1][x+1];
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
    function doEvent(pageX : number, pageY : number)
    {
        x = Math.floor((pageX-canvas.offsetLeft) / w);
        y = Math.floor((pageY-canvas.offsetTop) / h);
        grid.glub(x,y,d);
        //c.x -= d*3;
        //c.y -= d;
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

function apply(c : Cell, m : number[][])
{
   var cx = c.x * m[0][0] + c.y * m[1][0] + c.z * m[2][0];
   var cy = c.x * m[0][1] + c.y * m[1][1] + c.z * m[2][1];
   var cz = c.x * m[0][2] + c.y * m[1][2] + c.z * m[2][2];

   cx = Math.max(0,Math.min(1,cx));
   cy = Math.max(0,Math.min(1,cy));
   cz = Math.max(0,Math.min(1,cz));

   return new Cell(cx,cy,cz);
}


//UPDATE()
var lastRate = 0;
var avgRate  = 0; 
function update(framerate)
{

    grid.update((c:Cell, ns:Neighborhood) =>
    {
        var z = 0;

        for(var i=-1; i < 2; ++i)
        for(var j=-1; j < 2; ++j)
        {
            if (i==0 && j==0) 
                continue;
            
            var f = i==0 || j==0 ? 1 : 1;

            var n = ns.cell(i,j);            
            if (n != null)
            {
               
                c = apply(c, [[1,0,0],[0,1,0],[(i),j,1.001]]);                        
            }
        }


       //return new Cell(c.x, c.y, z);

         return c
    });
   

    avgRate  = (framerate + lastRate)/2;
    lastRate = framerate;        
}



//RENDER()
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

        var M = (Math.sqrt(c.x*c.x + c.y*c.y + c.z*c.z)); //magnitude
        //var M = c.z;
        var x = Math.max(0,Math.min(255,Math.floor(255 * M)));
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

            var s = 4;
            var mw = w * i + w/2;
            var mh = h * j - h/2;
            var lw = mw + c.x*s * w ;
            var lh = mh + c.y*s * h;
            var grd=ctx.createLinearGradient(mw,mh,lw,lh);
            grd.addColorStop(0,"rgba(0,50,0,1)");
            grd.addColorStop(1,"rgba(0,255,0,1)");
            ctx.strokeStyle = grd;
            ctx.lineWidth = 1+c.z*s;
            ctx.beginPath();
            ctx.moveTo(mw, mh+h);
            ctx.lineTo(lw + 0.7, lh + 0.7);
            //ctx.lineTo(mw +10, mh + 10);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = "rgba(255,0,0,0.2)";
            ctx.fillRect(w * i + w/2 + c.x*s * w - 1, h * j - h/2 + c.y*s * h - 1,1+Math.abs(c.z*s),1+Math.abs(c.z*s))
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



