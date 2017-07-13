declare function randi(min: any, max: any): any;
declare function rand(min: any, max: any): any;
declare type UpdateICellFn = (c: ICell, ns: INeighborhood) => ICell;
declare type UpdateCellFn<TCell extends ICell> = (c: TCell, ns: Neighborhood<TCell>) => TCell;
interface ICell {
    getRenderStyle(): string | CanvasGradient | CanvasPattern;
    update(ns: INeighborhood): ICell;
}
interface IGrid {
    width: number;
    height: number;
    cell(x: number, y: number): ICell;
    activateCell(x: number, y: number, data: number): any;
    neighbors(x: number, y: number): INeighborhood;
    update(framerate: number): any;
}
declare abstract class Grid<TCell extends ICell> implements IGrid {
    private cells;
    readonly width: number;
    readonly height: number;
    private grid1;
    private grid2;
    private readonly wall;
    constructor(width: number, height: number);
    abstract createCell(): TCell;
    abstract activateCell(x: number, y: number, data: number): any;
    reflectLeftWall(cell: TCell): boolean;
    reflectRightWall(cell: TCell): boolean;
    cell(x: number, y: number): TCell;
    setCell(x: number, y: number, cell: TCell): void;
    neighbors(x: number, y: number): Neighborhood<TCell>;
    update(framerate: number): void;
}
interface INeighborhood {
    cell(x: number, y: number): ICell;
}
declare class Neighborhood<TCell extends ICell> implements INeighborhood {
    length: number;
    readonly cells: TCell[][];
    readonly matrixes: number[][][][];
    constructor();
    cell(x: number, y: number): TCell;
    matrix(x: number, y: number): number[][];
}
