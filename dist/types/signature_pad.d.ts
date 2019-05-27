import { IBasicPoint } from './point';
declare global {
    interface Window {
        PointerEvent: typeof PointerEvent;
    }
}
export interface IOptions {
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
export interface IPointGroup {
    color: string;
    points: IBasicPoint[];
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
    constructor(canvas: HTMLCanvasElement, options?: IOptions);
    clear(): void;
    fromDataURL(dataUrl: string, options?: {
        ratio?: number;
        width?: number;
        height?: number;
    }, callback?: (error?: ErrorEvent) => void): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    on(): void;
    off(): void;
    isEmpty(): boolean;
    fromData(pointGroups: IPointGroup[]): void;
    toData(): IPointGroup[];
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
}
