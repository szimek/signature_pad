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

import { Bezier } from './bezier';
import { BasicPoint, Point } from './point';
import { throttle } from './throttle';

declare global {
  // tslint:disable-next-line:interface-name
  interface Window {
    PointerEvent: typeof PointerEvent;
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

export default class SignaturePadBase {
  // Public stuff
  public dotSize: number | (() => number);
  /** 笔迹最小宽度 */
  public minWidth: number;
  /** 笔迹最大宽度 */
  public maxWidth: number;
  public minDistance: number;
  public backgroundColor: string;
  public penColor: string;
  public throttle: number;
  public velocityFilterWeight: number;

  /* tslint:disable: variable-name */
  public ctx: CanvasRenderingContext2D;
  public lastPoints: Point[]; // Stores up to 4 most recent points; used to generate a new curve
  public data: PointGroup[]; // Stores all points in groups (one group per line or dot)
  public lastVelocity: number;
  public lastWidth: number;
  /** 手写笔迹绘制 */
  protected strokeMoveUpdate: (
    event: MouseEvent | Touch | WechatMiniprogram.Touch,
  ) => void;

  /* tslint:enable: variable-name */
  protected _isEmpty: boolean;

  constructor(
    protected canvas: HTMLCanvasElement | WechatMiniprogram.Canvas,
    protected options: Options = {},
  ) {
    this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
    this.minWidth = options.minWidth || 0.5;
    this.maxWidth = options.maxWidth || 2.5;
    this.throttle = ('throttle' in options ? options.throttle : 16) as number; // in milisecondss
    this.minDistance = ('minDistance' in options
      ? options.minDistance
      : 5) as number; // in pixels
    this.dotSize =
      options.dotSize ||
      function dotSize(this: SignaturePadBase): number {
        return (this.minWidth + this.maxWidth) / 2;
      };
    this.penColor = options.penColor || 'black';
    this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';

    this.strokeMoveUpdate = this.throttle
      ? throttle(SignaturePadBase.prototype._strokeUpdate, this.throttle)
      : SignaturePadBase.prototype._strokeUpdate;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    this.clear();
  }

  public clear(): void {
    const { ctx: ctx, canvas } = this;

    // Clear canvas using background color
    ctx.fillStyle = this.backgroundColor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this.data = [];
    this.reset();
    this._isEmpty = true;
  }

  public isEmpty(): boolean {
    return this._isEmpty;
  }

  public toData(): PointGroup[] {
    return this.data;
  }

  // Private methods
  public strokeBegin(
    event: MouseEvent | Touch | WechatMiniprogram.Touch,
  ): void {
    const newPointGroup = {
      color: this.penColor,
      points: [],
    };

    this.data.push(newPointGroup);
    this.reset();
    this._strokeUpdate(event);
  }

  private _strokeUpdate(
    event: MouseEvent | Touch | WechatMiniprogram.Touch,
  ): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore wechatMiniProgram declaration error
    const x = event.clientX || event.x;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore wechatMiniProgram declaration error
    const y = event.clientY || event.y;

    const point = this._createPoint(x, y);
    const lastPointGroup = this.data[this.data.length - 1];
    const lastPoints = lastPointGroup.points;
    const lastPoint =
      lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
    const isLastPointTooClose = lastPoint
      ? point.distanceTo(lastPoint) <= this.minDistance
      : false;
    const color = lastPointGroup.color;

    // Skip this point if it's too close to the previous one
    if (!lastPoint || !(lastPoint && isLastPointTooClose)) {
      const curve = this._addPoint(point);

      if (!lastPoint) {
        this._drawDot({ color, point });
      } else if (curve) {
        this._drawCurve({ color, curve });
      }

      lastPoints.push({
        time: point.time,
        x: point.x,
        y: point.y,
      });
    }
  }

  public strokeEnd(event: MouseEvent | Touch | WechatMiniprogram.Touch): void {
    this._strokeUpdate(event);
  }

  // Called when a new line is started
  public reset(): void {
    this.lastPoints = [];
    this.lastVelocity = 0;
    this.lastWidth = (this.minWidth + this.maxWidth) / 2;
    this.ctx.fillStyle = this.penColor;
  }

  private _createPoint(x: number, y: number): Point {
    let rect;
    if (
      window &&
      window.HTMLCanvasElement &&
      this.canvas instanceof window.HTMLCanvasElement
    ) {
      rect = this.canvas.getBoundingClientRect();
    } else {
      rect = { left: 0, top: 0 };
    }

    return new Point(x - rect.left, y - rect.top, new Date().getTime());
  }

  // Add point to lastPoints array and generate a new curve if there are enough points (i.e. 3)
  protected _addPoint(point: Point): Bezier | null {
    const { lastPoints } = this;

    lastPoints.push(point);

    if (lastPoints.length > 2) {
      // To reduce the initial lag make it work with 3 points
      // by copying the first point to the beginning.
      if (lastPoints.length === 3) {
        lastPoints.unshift(lastPoints[0]);
      }

      // _points array will always have 4 points here.
      const widths = this._calculateCurveWidths(lastPoints[1], lastPoints[2]);
      const curve = Bezier.fromPoints(lastPoints, widths);

      // Remove the first element from the list, so that there are no more than 4 points at any time.
      lastPoints.shift();

      return curve;
    }

    return null;
  }

  private _calculateCurveWidths(
    startPoint: Point,
    endPoint: Point,
  ): { start: number; end: number } {
    const velocity =
      this.velocityFilterWeight * endPoint.velocityFrom(startPoint) +
      (1 - this.velocityFilterWeight) * this.lastVelocity;

    const newWidth = this._strokeWidth(velocity);

    const widths = {
      end: newWidth,
      start: this.lastWidth,
    };

    this.lastVelocity = velocity;
    this.lastWidth = newWidth;

    return widths;
  }

  private _strokeWidth(velocity: number): number {
    return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
  }

  private _drawCurveSegment(x: number, y: number, width: number): void {
    const ctx = this.ctx;

    ctx.moveTo(x, y);
    ctx.arc(x, y, width, 0, 2 * Math.PI, false);
    this._isEmpty = false;
  }

  protected _drawCurve({
    color,
    curve,
  }: {
    color: string;
    curve: Bezier;
  }): void {
    const ctx = this.ctx;
    const widthDelta = curve.endWidth - curve.startWidth;
    // '2' is just an arbitrary number here. If only lenght is used, then
    // there are gaps between curve segments :/
    const drawSteps = Math.floor(curve.length()) * 2;

    ctx.beginPath();
    ctx.fillStyle = color;

    for (let i = 0; i < drawSteps; i += 1) {
      // Calculate the Bezier (x, y) coordinate for this step.
      const t = i / drawSteps;
      const tt = t * t;
      const ttt = tt * t;
      const u = 1 - t;
      const uu = u * u;
      const uuu = uu * u;

      let x = uuu * curve.startPoint.x;
      x += 3 * uu * t * curve.control1.x;
      x += 3 * u * tt * curve.control2.x;
      x += ttt * curve.endPoint.x;

      let y = uuu * curve.startPoint.y;
      y += 3 * uu * t * curve.control1.y;
      y += 3 * u * tt * curve.control2.y;
      y += ttt * curve.endPoint.y;

      const width = Math.min(
        curve.startWidth + ttt * widthDelta,
        this.maxWidth,
      );
      this._drawCurveSegment(x, y, width);
    }

    ctx.closePath();
    ctx.fill();
  }

  protected _drawDot({
    color,
    point,
  }: {
    color: string;
    point: BasicPoint;
  }): void {
    const ctx = this.ctx;
    const width =
      typeof this.dotSize === 'function' ? this.dotSize() : this.dotSize;

    ctx.beginPath();
    this._drawCurveSegment(point.x, point.y, width);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}
