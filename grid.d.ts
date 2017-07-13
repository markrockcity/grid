declare function randi(min: any, max: any): any;
declare function rand(min: any, max: any): any;
declare type UpdateCellFn<TCell> = (c: TCell, ns: Neighborhood<TCell>) => TCell;
declare abstract class Grid<TCell> {
    private cells;
    readonly width: number;
    readonly height: number;
    private grid1;
    private grid2;
    private readonly wall;
    constructor(width: number, height: number);
    abstract createCell(): TCell;
    reflectLeftWall(cell: TCell): boolean;
    reflectRightWall(cell: TCell): boolean;
    cell(x: number, y: number): TCell;
    setCell(x: number, y: number, cell: TCell): void;
    neighbors(x: number, y: number): Neighborhood<TCell>;
    update(updateCell: UpdateCellFn<TCell>): void;
}
declare class Neighborhood<TCell> {
    length: number;
    readonly cells: TCell[][];
    readonly matrixes: number[][][][];
    constructor();
    cell(x: number, y: number): TCell;
    matrix(x: number, y: number): number[][];
}
