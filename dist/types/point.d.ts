export interface IBasicPoint {
    x: number;
    y: number;
    time: number;
}
export declare class Point implements IBasicPoint {
    x: number;
    y: number;
    time: number;
    constructor(x: number, y: number, time?: number);
    distanceTo(start: IBasicPoint): number;
    equals(other: IBasicPoint): boolean;
    velocityFrom(start: IBasicPoint): number;
}
