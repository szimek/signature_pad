export interface BasicPoint {
    x: number;
    y: number;
    time: number;
}
export declare class Point implements BasicPoint {
    x: number;
    y: number;
    time: number;
    constructor(x: number, y: number, time?: number);
    distanceTo(start: BasicPoint): number;
    equals(other: BasicPoint): boolean;
    velocityFrom(start: BasicPoint): number;
}
