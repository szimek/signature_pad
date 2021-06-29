/**
 * The main idea and some parts of the code (e.g. drawing variable width Bézier curve) are taken from:
 * http://corner.squareup.com/2012/07/smoother-signatures.html
 *
 * Implementation of interpolation using cubic Bézier curves is taken from:
 * http://www.benknowscode.com/2012/09/path-interpolation-using-cubic-bezier_9742.html
 *
 * Algorithm for approximated length of a Bézier curve is taken from:
 * http://www.lemoda.net/maths/bezier-length/index.html
 */
import { BasicPoint } from './point';
declare global {
    interface CSSStyleDeclaration {
        msTouchAction: string | null;
    }
}
export interface Options {
    dotSize?: number | (() => number);
    minWidth?: number;
    maxWidth?: number;
    minDistance?: number;
    backgroundColor?: string;
    penColor?: string;
    throttle?: number;
    velocityFilterWeight?: number;
    onBegin?: (event: MouseEvent | Touch) => void;
    onEnd?: (event: MouseEvent | Touch) => void;
}
export interface PointGroup {
    color: string;
    points: BasicPoint[];
}
export interface SkiaPointGroup {
    color: string;
    path: string;
}
export default class SignaturePad {
    private canvas;
    private options;
    dotSize: number | (() => number);
    minWidth: number;
    maxWidth: number;
    minDistance: number;
    backgroundColor: string;
    penColor: string;
    throttle: number;
    velocityFilterWeight: number;
    onBegin?: (event: MouseEvent | Touch) => void;
    onEnd?: (event: MouseEvent | Touch) => void;
    private _ctx;
    private _mouseButtonDown;
    private _isEmpty;
    private _lastPoints;
    private _data;
    private _lastVelocity;
    private _lastWidth;
    private _strokeMoveUpdate;
    constructor(canvas: HTMLCanvasElement, options?: Options);
    clear(): void;
    fromDataURL(dataUrl: string, options?: {
        ratio?: number;
        width?: number;
        height?: number;
    }, callback?: (error?: string | Event) => void): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    on(): void;
    off(): void;
    isEmpty(): boolean;
    fromData(pointGroups: PointGroup[]): void;
    toData(): PointGroup[];
    private _handleMouseDown;
    private _handleMouseMove;
    private _handleMouseUp;
    private _handleTouchStart;
    private _handleTouchMove;
    private _handleTouchEnd;
    private _strokeBegin;
    private _strokeUpdate;
    private _strokeEnd;
    private _handlePointerEvents;
    private _handleMouseEvents;
    private _handleTouchEvents;
    private _reset;
    private _createPoint;
    private _addPoint;
    private _calculateCurveWidths;
    private _strokeWidth;
    private _drawCurveSegment;
    private _drawCurve;
    private _drawDot;
    private _fromData;
    private _toSVG;
    /**
     * Turn an undefined color string into hex
     *
     * @param color A undefined color representation
     * @returns A hex color string
     * @see https://stackoverflow.com/a/47355187
     */
    private _colorToHex;
    toSkiaPath(): string;
    fromSkiaPath(skiaPath: string): void;
}
