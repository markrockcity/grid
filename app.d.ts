declare class Grid1 extends Grid<Cell1> {
    activateCell(x: number, y: number, button: number): void;
    createCell(): Cell1;
    reflectLeftWall(c: Cell1): boolean;
    reflectRightWall(c: Cell1): boolean;
}
declare class Cell1 implements ICell {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    constructor(x: number, y: number, z: number);
    getRenderStyle(): string | CanvasGradient | CanvasPattern;
    update(ns: Neighborhood<Cell1>): Cell1;
}
declare var canvas: HTMLCanvasElement;
declare var ctx: CanvasRenderingContext2D;
declare var ww: any, hh: any, w: any, h: any, mh: any, mw: number;
declare var grid: IGrid;
declare var mousedown: boolean;
declare function apply(c: Cell1, m: number[][]): Cell1;
declare function sum(cells: Cell1[]): Cell1;
declare function zprod(cells: Cell1[]): number;
declare var lastRate: number;
declare var avgRate: number;
declare function update(framerate: number): void;
declare function render(): void;
declare var then: number;
declare var paused: boolean;
declare function main(): void;
