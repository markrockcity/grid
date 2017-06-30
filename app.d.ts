declare function randi(min: any, max: any): any;
declare function rand(min: any, max: any): any;
declare class Grid {
    cells: Cell[];
    width: number;
    height: number;
    constructor(width: number, height: number);
    cell(x: number, y: number): Cell;
    neighbors(x: number, y: number): Neighborhood;
}
declare class Cell {
    x: number;
    y: number;
    z: number;
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
declare var lastRate: number;
declare var avgRate: number;
declare function update(framerate: any): void;
declare function render(): void;
declare var then: number;
declare var paused: boolean;
declare function main(): void;
