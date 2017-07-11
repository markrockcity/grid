declare function randi(min: any, max: any): any;
declare function rand(min: any, max: any): any;
declare type UpdateCellFn = (c: Cell, ns: Neighborhood) => Cell;
declare class Grid {
    private cells;
    readonly width: number;
    readonly height: number;
    private grid1;
    private grid2;
    private readonly wall;
    constructor(width: number, height: number);
    cell(x: number, y: number): Cell;
    setCell(x: number, y: number, c: Cell): void;
    neighbors(x: number, y: number): Neighborhood;
    update(updateCell: UpdateCellFn): void;
}
declare class Cell {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    constructor(x: number, y: number, z: number);
}
declare class Neighborhood {
    length: number;
    readonly cells: Cell[][];
    readonly matrixes: number[][][][];
    constructor();
    cell(x: number, y: number): Cell;
    matrix(x: number, y: number): number[][];
}
declare var canvas: HTMLCanvasElement;
declare var ctx: CanvasRenderingContext2D;
declare var ww: any, hh: any, w: any, h: any, mh: any, mw: number;
declare var grid: Grid;
declare var mousedown: boolean;
declare function apply(c: Cell, m: number[][]): Cell;
declare function sum(cells: Cell[]): Cell;
declare function zprod(cells: Cell[]): number;
declare var lastRate: number;
declare var avgRate: number;
declare function update(framerate: any): void;
declare function render(): void;
declare var then: number;
declare var paused: boolean;
declare function main(): void;
