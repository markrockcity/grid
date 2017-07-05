declare function randi(min: any, max: any): any;
declare function rand(min: any, max: any): any;
declare type UpdateCellFn = (c: Cell, ns: Neighborhood) => Cell;
declare class Grid {
    private cells;
    readonly width: number;
    readonly height: number;
    private grid1;
    private grid2;
    constructor(width: number, height: number);
    cell(x: number, y: number): Cell;
    glub(x: number, y: number, d: number): void;
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
    cells: any[][];
    cell(x: number, y: number): Cell;
}
declare var canvas: HTMLCanvasElement;
declare var ctx: CanvasRenderingContext2D;
declare var ww: any, hh: any, w: any, h: any, mh: any, mw: number;
declare var grid: Grid;
declare var mousedown: boolean;
declare function apply(c: Cell, m: number[][]): Cell;
declare var lastRate: number;
declare var avgRate: number;
declare function update(framerate: any): void;
declare function render(): void;
declare var then: number;
declare var paused: boolean;
declare function main(): void;
