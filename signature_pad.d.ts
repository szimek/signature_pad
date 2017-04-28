declare class Point {
    x: number;
    y: number;
    time: number;
    constructor(x: number, y: number, time: number);
    velocityFrom(start: Point): number;
    distanceTo(start: Point): number;
}

declare class CurveControl {
    c1: Point;
    c2: Point;
    constructor(c1: Point, c2: Point);
}

declare class Bezier {
    startPoint: Point;
    control1: CurveControl;
    control2: CurveControl;
    endPoint: Point;
    constructor(startPoint, control1, control2, endPoint);
    length(): number;
    _point(t: number, start: number, c1: number, c2: number, end: number): number;
}

declare class SignaturePadOptions {
    velocityFilterWeight: number;
    minWidth: number;
    maxWidth: number;
    dotSize: Function;
    penColor: string;
    backgroundColor: string;
    onEnd: Function;
    onBegin: Function;
}

declare class SignaturePad {
    points: Array<Point>;
    _lastVelocity: number;
    _lastWidth: number;
    _isEmpty: boolean;
    _mouseButtonDown: boolean;
    _ctx: CanvasRenderingContext2D;
    _canvas: HTMLCanvasElement;
    velocityFilterWeight: number;
    minWidth: number;
    maxWidth: number;
    dotSize: Function;
    penColor: string;
    backgroundColor: string;
    onEnd: Function;
    onBegin: Function;

    constructor(canvas: Element, options?: SignaturePadOptions);
    clear(): void;
    isEmpty(): boolean;
    fromDataURL(dataUrl: string);
    toDataURL(): string;
    _strokeBegin(event: Event): void;
    _strokeUpdate(event: Event): void;
    _strokeDraw(point: Point): void;
    _strokeEnd(event: Event): void;
    _handleMouseEvents(): void;
    _handleTouchEvents(): void;
    _reset(): void;
    _createPoint(event: Event): Point;
    _addPoint(point: Point): void;
    _calculateCurveControlPoints(point1: Point, point2: Point, point3: Point): void;

    _addCurve(curve: Bezier): void;
    _drawPoint(x: number, y: number, size: number): void;
    _drawCurve(curve: Bezier, startWidth: number, endWidth: number): void;
    _strokeWidth(velocity: number): void;
}
