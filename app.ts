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

//GRID class
class Grid
{
    cells : Cell[] = [];
    width : number;
    height: number;


    constructor(width: number, height: number)
    {
       this.width = width;
       this.height = height;

       for(var i=0; i<width*height; ++i)
           this.cells.push(new Cell(0,0,0));
    }

    cell(x:number, y:number) : Cell
    {
        return this.cells[y*this.width+x];
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
}

//CELL class
class Cell
{
    x : number;
    y : number;
    z : number;

    m : number[][];

    constructor(x : number, y : number, z : number, m:number[][] = [[1,0,0],[0,1,0],[0,0,1]])
    {
        this.x = x;
        this.y = y;
        this.z = z;

        this.m = m;
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

    matrix(x:number, y:number) : number[][]
    {
        return [[1,0,0],[0,1,0],[0,0,1]];
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
    const factor = 25;

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
        var c = grid.cell(x,y);
        //c.x -= d*3;
        c.y -= d;
        c.z += d;
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
   c.x = c.x * m[0][0] + c.x * m[1][0] + c.x * m[2][0];
   c.y = c.y * m[0][1] + c.y * m[1][1] + c.y * m[2][1];
   c.z = c.z * m[0][2] + c.z * m[1][2] + c.z * m[2][2];
}


//UPDATE()
var lastRate = 0;
var avgRate  = 0; 
function update(framerate)
{

    function updateCell(c : Cell, n : Cell, m : number[][], l : number)
    {
        if (c==null || n==null)
            return;

        //c = c + ((n-c)/2)

        //(n - c)/2
        /*
        var x = (l-1);
        var nc = [(n.x-c.x)*(x/l), (n.y-c.y)*(x/l), (n.z-c.z)*(x/l)];
        
        c.x += nc[0];
        c.y += nc[1];
        c.z += nc[2];*/


        //n = [n + ((n-c)/2)] * m
        //var cn = [(c.x-n.x)*(1/l), (c.y-n.y)*(1/l), (c.z-n.z)*(1/l)];

        //var x = 1;
        //var nc = [(n.x-c.x)*(x/l), (n.y-c.y)*(x/l), (n.z-c.z)*(x/l)]

        l = Math.max(2,l);
        var cn = [(c.x-n.x)*(1/l), (c.y-n.y)*(1/l), (c.z-n.z)*(1/l)];

        n.x += cn[0];
        n.y += cn[1];
        n.z += cn[2];
        apply(n,m);

        n.y = Math.max(-1,Math.min(1,n.y))
        n.x = Math.max(-1,Math.min(1,n.x))
        n.z = Math.max(-1,Math.min(1,n.z))

        if (isNaN(n.x))  n.x = 0;
        if (isNaN(n.y))  n.y = 0;
        if (isNaN(n.z))  n.z = 0;
        
        /*
        if (c.z > n.z) 
        {
            var x = c.z / l;
            c.z -= x;
            n.z += x;

            c.z = Math.max(0,Math.min(1,c.z))

            if (isNaN(c.z))
                c.z = 0;
        }
        else
        {
            c.z -= 0.00001;              
        }   */    
    }
    
    function updateCell2(c : Cell, ns : Cell[])
    {
        var x = c.z;
        c.z = 0;
        for(var i=ns.length-1; i > -1; --i)
            ns[i].z += (x/ns.length);
    } 
    

    var mRight = [[1,0,0],[0,1,0],[0.7,0,0.7]];
    var mLeft = [[1,0,0],[0,1,0],[-0.7,0,0.7]];
    var mTop = [[1,0,0],[0,1,0],[0,0.7,0.7]];
    var mBottom = [[1,0,0],[0,1,0],[0,-0.7,0.7]];
    var mIdent = [[1,0,0],[0,1,0],[0,0,1]];
   

    for(var i=0; i < grid.width; ++i)
    for(var j=0; j < grid.height; ++j)
    {
        var c = grid.cell(i,j);
        var ns = grid.neighbors(i,j);
        var ns2 = [];  
        var ms = [];

        
        //var top    = ns.cell(0,-1); if (top != null) ns2.push(top);
        //var left   = ns.cell(-1,0); if (left != null) ns2.push(left);
        //var right  = ns.cell(1,0); if (right != null) ns2.push(right);
       // var bottom = ns.cell(0,1); if (bottom != null) ns2.push(bottom);


        //var a = [[1,0], [0,-1], [0,1], [-1,1]];
        var a = [[-1,0], [1,0], [0,1], [0,-1], ]
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
                
        //updateCell(c,right,mRight,ns2.length);
        //updateCell(c,left,mLeft,ns2.length);
        //updateCell(c,top,mTop,ns2.length);

        for(var k=0; k < ns2.length; ++k)
            updateCell(c,ns2[k],ms[k],ns2.length);
        
        
        var y = ns2.length/(ns2.length+1);
        //y = (-2/3);
        var nc = [(x[0]-c.x)*y, (x[1]-c.y)*y, (x[2]-c.z)*y];
        c.x += nc[0];
        //c.x -= 0.00001;
        c.y += nc[1] * 0.001;
        c.z += nc[2] * 0.001;

        //for(var k=0; k < ns2.length; ++k)
        //    apply(c, ms[k])

        //updateCell2(c, ns2);

        c.x *= 0.99;
        c.y *= 0.99;
        c.z *= 0.99;


        c.z = Math.max(0,Math.min(1,c.z));

        if (isNaN(c.z))
            c.z = 0;
    }


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
        //var alt = i % 2 == 0 && j % 2 > 0 || i % 2 > 0 && j % 2 == 0;
        //ctx.fillStyle =  alt ? "rgb(220,190,91)" : "rgb(255,220,190)";

        var c = grid.cell(i,j);

        var M = (Math.sqrt(c.x*c.x + c.y*c.y + c.z*c.z));
        var x = Math.max(0,Math.min(255,Math.floor(255 * M * 30)));
        ctx.fillStyle = `rgb(0,0,${x})`
        ctx.fillRect(w * i , h * j, w+1, h+1);
/**/
    }

    var renderVector = true;

    if (renderVector)
    {
        for(var i=0; i < grid.width; ++i)
        for(var j=0; j < grid.height; ++j)
        {

            var c = grid.cell(i,j);

            //ctx.strokeStyle = "rgba(0,205,0,0.25)";

            var mw = w * i + w/2;
            var mh = h * j - h/2;
            var lw = mw + c.x*100 * w ;
            var lh = mh + c.y*100 * h;
            var grd=ctx.createLinearGradient(mw,mh,lw,lh);
            grd.addColorStop(0,"black");
            grd.addColorStop(1,"green");
            ctx.strokeStyle = grd;
            ctx.lineWidth = 1+c.z*1000;
            ctx.beginPath();
            ctx.moveTo(mw - 0.7, mh - 0.7);
            ctx.lineTo(lw + 0.7, lh + 0.7);
            ctx.closePath();
            ctx.stroke();
            //ctx.fillStyle = "rgba(255,0,0,1)";
            //ctx.fillRect(w * i + w/2 + c.x*100 * w - 1, h * j - h/2 + c.y*100 * h - 1,1+Math.abs(c.z*100),1+Math.abs(c.z*100))
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



