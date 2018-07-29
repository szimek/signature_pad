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
import { IBasicPoint, Point } from './point';
import { throttle } from './throttle';

declare global  {
  // tslint:disable-next-line:interface-name
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
  // Public stuff
  public dotSize: number | (() => number);
  public minWidth: number;
  public maxWidth: number;
  public minDistance: number;
  public backgroundColor: string;
  public penColor: string;
  public throttle: number;
  public velocityFilterWeight: number;
  public onBegin?: (event: MouseEvent | Touch) => void;
  public onEnd?: (event: MouseEvent | Touch) => void;

  // Private stuff
  /* tslint:disable: variable-name */
  private _ctx: CanvasRenderingContext2D;
  private _mouseButtonDown: boolean;
  private _isEmpty: boolean;
  private _lastPoints: Point[]; // Stores up to 4 most recent points; used to generate a new curve
  private _data: IPointGroup[]; // Stores all points in groups (one group per line or dot)
  private _lastVelocity: number;
  private _lastWidth: number;
  private _strokeMoveUpdate: (event: MouseEvent | Touch) => void;
  /* tslint:enable: variable-name */

  constructor(private canvas: HTMLCanvasElement, private options: IOptions = {}) {
    this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
    this.minWidth = options.minWidth || 0.5;
    this.maxWidth = options.maxWidth || 2.5;
    this.throttle = ('throttle' in options ? options.throttle : 16) as number; // in milisecondss
    this.minDistance = ('minDistance' in options ? options.minDistance : 5) as number; // in pixels

    if (this.throttle) {
      this._strokeMoveUpdate = throttle(SignaturePad.prototype._strokeUpdate, this.throttle);
    } else {
      this._strokeMoveUpdate = SignaturePad.prototype._strokeUpdate;
    }

    this.dotSize = options.dotSize || function (this: SignaturePad) {
      return (this.minWidth + this.maxWidth) / 2;
    };
    this.penColor = options.penColor || 'black';
    this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0)';
    this.onBegin = options.onBegin;
    this.onEnd = options.onEnd;

    this._ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.clear();

    // Enable mouse and touch event handlers
    this.on();
  }

  public clear(): void {
    const ctx = this._ctx;
    const canvas = this.canvas;

    // Clear canvas using background color
    ctx.fillStyle = this.backgroundColor;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    this._data = [];
    this._reset();
    this._isEmpty = true;
  }

  public fromDataURL(
    dataUrl: string,
    options: { ratio?: number, width?: number, height?: number } = {},
    callback?: (error?: ErrorEvent) => void,
  ): void {
    const image = new Image();
    const ratio = options.ratio || window.devicePixelRatio || 1;
    const width = options.width || (this.canvas.width / ratio);
    const height = options.height || (this.canvas.height / ratio);

    this._reset();

    image.onload = () => {
      this._ctx.drawImage(image, 0, 0, width, height);
      if (callback) { callback(); }
    };
    image.onerror = (error) => {
      if (callback) { callback(error); }
    };
    image.src = dataUrl;

    this._isEmpty = false;
  }

  public toDataURL(type = 'image/png', encoderOptions?: number) {
    switch (type) {
      case 'image/svg+xml':
        return this._toSVG();
      default:
        return this.canvas.toDataURL(type, encoderOptions);
    }
  }

  public on(): void {
    // Disable panning/zooming when touching canvas element
    this.canvas.style.touchAction = 'none';
    this.canvas.style.msTouchAction = 'none';

    if (window.PointerEvent) {
      this._handlePointerEvents();
    } else {
      this._handleMouseEvents();

      if ('ontouchstart' in window) {
         this._handleTouchEvents();
      }
    }
  }

  public off(): void {
    // Enable panning/zooming when touching canvas element
    this.canvas.style.touchAction = 'auto';
    this.canvas.style.msTouchAction = 'auto';

    this.canvas.removeEventListener('pointerdown', this._handleMouseDown);
    this.canvas.removeEventListener('pointermove', this._handleMouseMove);
    document.removeEventListener('pointerup', this._handleMouseUp);

    this.canvas.removeEventListener('mousedown', this._handleMouseDown);
    this.canvas.removeEventListener('mousemove', this._handleMouseMove);
    document.removeEventListener('mouseup', this._handleMouseUp);

    this.canvas.removeEventListener('touchstart', this._handleTouchStart);
    this.canvas.removeEventListener('touchmove', this._handleTouchMove);
    this.canvas.removeEventListener('touchend', this._handleTouchEnd);
  }

  public isEmpty(): boolean {
    return this._isEmpty;
  }

  public fromData(pointGroups: IPointGroup[]): void {
    this.clear();

    this._fromData(
      pointGroups,
      ({ color, curve }) => this._drawCurve({ color, curve }),
      ({ color, point }) => this._drawDot({ color, point }),
    );

    this._data = pointGroups;
  }

  public toData(): IPointGroup[] {
    return this._data;
  }

  // Event handlers
  private _handleMouseDown = (event: MouseEvent): void => {
    if (event.which === 1) {
      this._mouseButtonDown = true;
      this._strokeBegin(event);
    }
  }

  private _handleMouseMove = (event: MouseEvent): void => {
    if (this._mouseButtonDown) {
      this._strokeMoveUpdate(event);
    }
  }

  private _handleMouseUp = (event: MouseEvent): void => {
    if (event.which === 1 && this._mouseButtonDown) {
      this._mouseButtonDown = false;
      this._strokeEnd(event);
    }
  }

  private _handleTouchStart = (event: TouchEvent): void => {
    // Prevent scrolling.
    event.preventDefault();

    if (event.targetTouches.length === 1) {
      const touch = event.changedTouches[0];
      this._strokeBegin(touch);
    }
  }

  private _handleTouchMove = (event: TouchEvent): void => {
    // Prevent scrolling.
    event.preventDefault();

    const touch = event.targetTouches[0];
    this._strokeMoveUpdate(touch);
  }

  private _handleTouchEnd = (event: TouchEvent): void => {
    const wasCanvasTouched = event.target === this.canvas;
    if (wasCanvasTouched) {
      event.preventDefault();

      const touch = event.changedTouches[0];
      this._strokeEnd(touch);
    }
  }

  // Private methods
  private _strokeBegin(event: MouseEvent | Touch): void {
    const newPointGroup = {
      color: this.penColor,
      points: [],
    };

    this._data.push(newPointGroup);
    this._reset();
    this._strokeUpdate(event);

    if (typeof this.onBegin === 'function') {
      this.onBegin(event);
    }
  }

  private _strokeUpdate(event: MouseEvent | Touch): void {
    const x = event.clientX;
    const y = event.clientY;

    const point = this._createPoint(x, y);
    const lastPointGroup = this._data[this._data.length - 1];
    const lastPoints = lastPointGroup.points;
    const lastPoint = lastPoints.length > 0 && lastPoints[lastPoints.length - 1];
    const isLastPointTooClose = lastPoint ? point.distanceTo(lastPoint) <= this.minDistance : false;
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

  private _strokeEnd(event: MouseEvent | Touch): void {
    this._strokeUpdate(event);

    if (typeof this.onEnd === 'function') {
      this.onEnd(event);
    }
  }

  private _handlePointerEvents(): void {
    this._mouseButtonDown = false;

    this.canvas.addEventListener('pointerdown', this._handleMouseDown);
    this.canvas.addEventListener('pointermove', this._handleMouseMove);
    document.addEventListener('pointerup', this._handleMouseUp);
  }

  private _handleMouseEvents(): void {
    this._mouseButtonDown = false;

    this.canvas.addEventListener('mousedown', this._handleMouseDown);
    this.canvas.addEventListener('mousemove', this._handleMouseMove);
    document.addEventListener('mouseup', this._handleMouseUp);
  }

  private _handleTouchEvents(): void {
    this.canvas.addEventListener('touchstart', this._handleTouchStart);
    this.canvas.addEventListener('touchmove', this._handleTouchMove);
    this.canvas.addEventListener('touchend', this._handleTouchEnd);
  }

  // Called when a new line is started
  private _reset(): void {
    this._lastPoints = [];
    this._lastVelocity = 0;
    this._lastWidth = (this.minWidth + this.maxWidth) / 2;
    this._ctx.fillStyle = this.penColor;
  }

  private _createPoint(x: number, y: number): Point {
    const rect = this.canvas.getBoundingClientRect();

    return new Point(
      x - rect.left,
      y - rect.top,
      new Date().getTime(),
    );
  }

  // Add point to _lastPoints array and generate a new curve if there are enough points (i.e. 3)
  private _addPoint(point: Point): Bezier | null {
    const { _lastPoints } = this;

    _lastPoints.push(point);

    if (_lastPoints.length > 2) {
      // To reduce the initial lag make it work with 3 points
      // by copying the first point to the beginning.
      if (_lastPoints.length === 3) {
        _lastPoints.unshift(_lastPoints[0]);
      }

      // _points array will always have 4 points here.
      const widths = this._calculateCurveWidths(_lastPoints[1], _lastPoints[2]);
      const curve = Bezier.fromPoints(_lastPoints, widths);

      // Remove the first element from the list, so that there are no more than 4 points at any time.
      _lastPoints.shift();

      return curve;
    }

    return null;
  }

  private _calculateCurveWidths(startPoint: Point, endPoint: Point): { start: number, end: number } {
    const velocity = (this.velocityFilterWeight * endPoint.velocityFrom(startPoint))
    + ((1 - this.velocityFilterWeight) * this._lastVelocity);

    const newWidth = this._strokeWidth(velocity);

    const widths = {
      end: newWidth,
      start: this._lastWidth,
    };

    this._lastVelocity = velocity;
    this._lastWidth = newWidth;

    return widths;
  }

  private _strokeWidth(velocity: number): number {
    return Math.max(this.maxWidth / (velocity + 1), this.minWidth);
  }

  private _drawCurveSegment(x: number, y: number, width: number): void {
    const ctx = this._ctx;

    ctx.moveTo(x, y);
    ctx.arc(x, y, width, 0, 2 * Math.PI, false);
    this._isEmpty = false;
  }

  private _drawCurve({ color, curve }: { color: string, curve: Bezier }): void {
    const ctx = this._ctx;
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

      const width = curve.startWidth + (ttt * widthDelta);
      this._drawCurveSegment(x, y, width);
    }

    ctx.closePath();
    ctx.fill();
  }

  private _drawDot({ color, point }: { color: string, point: IBasicPoint }): void {
    const ctx = this._ctx;
    const width = typeof this.dotSize === 'function' ? this.dotSize() : this.dotSize;

    ctx.beginPath();
    this._drawCurveSegment(point.x, point.y, width);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  private _fromData(
    pointGroups: IPointGroup[],
    drawCurve: SignaturePad['_drawCurve'],
    drawDot: SignaturePad['_drawDot'],
  ): void {
    for (const group of pointGroups) {
      const { color, points } = group;

      if (points.length > 1) {
        for (let j = 0; j < points.length; j += 1) {
          const basicPoint = points[j];
          const point = new Point(basicPoint.x, basicPoint.y, basicPoint.time);

          // All points in the group have the same color, so it's enough to set
          // penColor just at the beginning.
          this.penColor = color;

          if (j === 0) {
            this._reset();
          }

          const curve = this._addPoint(point);

          if (curve) {
            drawCurve({ color, curve });
          }
        }
      } else {
        this._reset();

        drawDot({
          color,
          point: points[0],
        });
      }
    }
  }

  private _toSVG(): string {
    const pointGroups = this._data;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const minX = 0;
    const minY = 0;
    const maxX = this.canvas.width / ratio;
    const maxY = this.canvas.height / ratio;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('width', this.canvas.width.toString());
    svg.setAttribute('height', this.canvas.height.toString());

    this._fromData(
      pointGroups,

      ({ color, curve }: { color: string, curve: Bezier }) => {
        const path = document.createElement('path');

        // Need to check curve for NaN values, these pop up when drawing
        // lines on the canvas that are not continuous. E.g. Sharp corners
        // or stopping mid-stroke and than continuing without lifting mouse.
        /* eslint-disable no-restricted-globals */
        if (!isNaN(curve.control1.x) &&
            !isNaN(curve.control1.y) &&
            !isNaN(curve.control2.x) &&
            !isNaN(curve.control2.y)) {
          const attr = `M ${curve.startPoint.x.toFixed(3)},${curve.startPoint.y.toFixed(3)} `
                    + `C ${curve.control1.x.toFixed(3)},${curve.control1.y.toFixed(3)} `
                    + `${curve.control2.x.toFixed(3)},${curve.control2.y.toFixed(3)} `
                    + `${curve.endPoint.x.toFixed(3)},${curve.endPoint.y.toFixed(3)}`;
          path.setAttribute('d', attr);
          path.setAttribute('stroke-width', (curve.endWidth * 2.25).toFixed(3));
          path.setAttribute('stroke', color);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-linecap', 'round');

          svg.appendChild(path);
        }
        /* eslint-enable no-restricted-globals */
      },

      ({ color, point }: { color: string, point: IBasicPoint }) => {
        const circle = document.createElement('circle');
        const dotSize = typeof this.dotSize === 'function' ? this.dotSize() : this.dotSize;
        circle.setAttribute('r', dotSize.toString());
        circle.setAttribute('cx', point.x.toString());
        circle.setAttribute('cy', point.y.toString());
        circle.setAttribute('fill', color);

        svg.appendChild(circle);
      },
    );

    const prefix = 'data:image/svg+xml;base64,';
    const header = '<svg'
      + ' xmlns="http://www.w3.org/2000/svg"'
      + ' xmlns:xlink="http://www.w3.org/1999/xlink"'
      + ` viewBox="${minX} ${minY} ${maxX} ${maxY}"`
      + ` width="${maxX}"`
      + ` height="${maxY}"`
      + '>';
    let body = svg.innerHTML;

    // IE hack for missing innerHTML property on SVGElement
    if (body === undefined) {
      const dummy = document.createElement('dummy');
      const nodes = svg.childNodes;
      dummy.innerHTML = '';

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < nodes.length; i += 1) {
        dummy.appendChild(nodes[i].cloneNode(true));
      }

      body = dummy.innerHTML;
    }

    const footer = '</svg>';
    const data = header + body + footer;

    return prefix + btoa(data);
  }
}
