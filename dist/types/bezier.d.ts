import { BasicPoint, Point } from './point';
export declare class Bezier {
    startPoint: Point;
    control2: BasicPoint;
    control1: BasicPoint;
    endPoint: Point;
    startWidth: number;
    endWidth: number;
    static fromPoints(points: Point[], widths: {
        start: number;
        end: number;
    }): Bezier;
    private static calculateControlPoints;
    constructor(startPoint: Point, control2: BasicPoint, control1: BasicPoint, endPoint: Point, startWidth: number, endWidth: number);
    length(): number;
    private point;
}
