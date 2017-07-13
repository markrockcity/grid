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

declare type UpdateICellFn = (c : ICell, ns: INeighborhood) => ICell
declare type UpdateCellFn<TCell extends ICell> = (c : TCell, ns : Neighborhood<TCell>) => TCell;

//CELL interface
interface ICell
{
    getRenderStyle() : string | CanvasGradient | CanvasPattern
    update(ns: INeighborhood) : ICell
}

//GRID interface
interface IGrid
{
    width : number;
    height: number;
    cell(x:number, y:number) : ICell
    activateCell(x:number, y:number, data : number) //data = e.g., button pressed
    neighbors(x:number, y:number) : INeighborhood
    update(framerate : number)
}

//GRID<TCELL> class
abstract class Grid<TCell extends ICell> implements IGrid
{
    private cells : TCell[] = [];

    readonly width : number;
    readonly height: number;

    private grid1 : TCell[] = [];
    private grid2 : TCell[] = [];

    private readonly wall = this.createCell();

    
    constructor(width: number, height: number)
    {
       this.width = width;
       this.height = height;

       for(var i=0; i<width*height; ++i)
       {
           this.grid1.push(this.createCell());
           this.grid2.push(this.createCell());
       }

       this.cells = this.grid1;
    }

    abstract createCell() : TCell;
    abstract activateCell(x: number, y: number, data: number );

    reflectLeftWall(cell : TCell) : boolean
    {
        return false;
    }

    reflectRightWall(cell : TCell) : boolean
    {
        return false;
    }

    cell(x:number, y:number) : TCell
    {
        return this.cells[y*this.width+x];
    }

    
    setCell(x:number, y:number, cell: TCell)
    {
        this.cells[y*this.width+x] = cell;
    }

    neighbors(x:number, y:number) : Neighborhood<TCell>
    {
        var ns = new Neighborhood<TCell>();
        var c  = this.cell(x,y);

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
            ns.matrixes[1][0] = [[1,0,0],[0,1,0],[0.707,0,0.707]];
            ns.length++;


            //bottom-left
            if (y < this.height-1)
            {
                ns.cells[2][0]=(this.cell(x-1,y+1));
                ns.length++;
            }

        }
        else
        {
            //left wall
            ns.cells[1][0] = this.wall;
            ns.matrixes[1][0] = [[this.reflectLeftWall(c) ? -1 : 1, 0, 0],[0,1,0],[0,0,1]];
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
            ns.matrixes[1][1] = [[1,0,0],[0,1,0],[-0.707,0,0.707]];
            ns.length++;

            //bottom-right
            if (y < this.height-1)
            {
                ns.cells[2][2]=(this.cell(x+1,y+1));
                ns.length++;
            }
        }
        else
        {
            //right-wall
            ns.cells[1][1] = this.wall;
            ns.matrixes[1][1] = [[this.reflectRightWall(c) ? -1 : 1, 0, 0],[0,1,0],[0,0,1]];
        }


        return ns;
    }


    update(framerate : number) : void
    {
        var nextGrid = (this.cells==this.grid1 ? this.grid2 : this.grid1);

        for(var i=0; i < this.width; ++i)
        for(var j=0; j < this.height; ++j)
        {
            var c  = this.cell(i,j);
            var ns = this.neighbors(i,j);
            
            var nextCell = <TCell> c.update(ns);
            nextGrid[j*this.width+i] = nextCell || c;
        }

        this.cells = nextGrid;
    }
}

//NEIGHBORHOOD INTERFACE
interface INeighborhood 
{
    cell(x:number, y:number) : ICell
}

//NEIGHBORHOOD class
class Neighborhood<TCell extends ICell> implements INeighborhood
{
    length = 0;
    readonly cells : TCell[][];
    readonly matrixes: number[][][][] // e.g., matrixes[x][y] = [[...],[...],[...]]

    constructor()
    {
        this.cells = [[null,null,null],[null,null],[null,null,null]];
        this.matrixes = [[null,null,null],[null,null],[null,null,null]];
    }
    
    cell(x:number, y:number) : TCell 
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
