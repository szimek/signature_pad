// TOOD: add more strict tslint rules

import { Bezier } from "./bezier";
import { IBasicPoint, Point } from "./point";
import { throttle } from "./throttle";

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

export type PointGroup = IBasicPoint[];

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
  private _points: Point[]; // Stores up to 4 most recent points; used to generate new curve
  private _data: PointGroup[]; // Stores all points in groups (one group per line or dot)
  private _lastVelocity: number;
  private _lastWidth: number;
  private _strokeMoveUpdate: (event: MouseEvent | Touch) => void;
  private _handleMouseDown: (event: MouseEvent) => void;
  private _handleMouseMove: (event: MouseEvent) => void;
  private _handleMouseUp: (event: MouseEvent) => void;
  private _handleTouchStart: (event: TouchEvent) => void;
  private _handleTouchMove: (event: TouchEvent) => void;
  private _handleTouchEnd: (event: TouchEvent) => void;
  /* tslint:enable: variable-name */

  constructor(private canvas: HTMLCanvasElement, private options: IOptions = {}) {
    const self = this;

    this.velocityFilterWeight = options.velocityFilterWeight || 0.7;
    this.minWidth = options.minWidth || 0.5;
    this.maxWidth = options.maxWidth || 2.5;
    this.throttle = ("throttle" in options ? options.throttle : 16) as number; // in milisecondss
    this.minDistance = ("minDistance" in options ? options.minDistance : 5) as number; // in pixels

    if (this.throttle) {
      this._strokeMoveUpdate = throttle(SignaturePad.prototype._strokeUpdate, this.throttle);
    } else {
      this._strokeMoveUpdate = SignaturePad.prototype._strokeUpdate;
    }

    this.dotSize = options.dotSize || function (this: SignaturePad) {
      return (this.minWidth + this.maxWidth) / 2;
    };
    this.penColor = options.penColor || "black";
    this.backgroundColor = options.backgroundColor || "rgba(0,0,0,0)";
    this.onBegin = options.onBegin;
    this.onEnd = options.onEnd;

    this._ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.clear();

    // We need add these inline so they are available to unbind while still having
    // access to 'self' we could use _.bind but it's not worth adding a dependency.
    this._handleMouseDown = (event: MouseEvent) => {
      if (event.which === 1) {
        self._mouseButtonDown = true;
        self._strokeBegin(event);
      }
    };

    this._handleMouseMove = (event) => {
      if (self._mouseButtonDown) {
        self._strokeMoveUpdate(event);
      }
    };

    this._handleMouseUp = (event) => {
      if (event.which === 1 && self._mouseButtonDown) {
        self._mouseButtonDown = false;
        self._strokeEnd(event);
      }
    };

    this._handleTouchStart = (event) => {
      // Prevent scrolling.
      event.preventDefault();

      if (event.targetTouches.length === 1) {
        const touch = event.changedTouches[0];
        self._strokeBegin(touch);
      }
    };

    this._handleTouchMove = (event) => {
      // Prevent scrolling.
      event.preventDefault();

      const touch = event.targetTouches[0];
      self._strokeMoveUpdate(touch);
    };

    this._handleTouchEnd = (event) => {
      const wasCanvasTouched = event.target === self.canvas;
      if (wasCanvasTouched) {
        event.preventDefault();

        const touch = event.targetTouches[0];
        self._strokeEnd(touch);
      }
    };

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

  public fromDataURL(dataUrl: string, options: { ratio?: number, width?: number, height?: number } = {}): void {
    const image = new Image();
    const ratio = options.ratio || window.devicePixelRatio || 1;
    const width = options.width || (this.canvas.width / ratio);
    const height = options.height || (this.canvas.height / ratio);

    this._reset();
    image.src = dataUrl;
    image.onload = () => {
      this._ctx.drawImage(image, 0, 0, width, height);
    };
    this._isEmpty = false;
  }

  public toDataURL(type: string, encoderOptions: number) {
    switch (type) {
      case "image/svg+xml":
        return this._toSVG();
      default:
        return this.canvas.toDataURL(type, encoderOptions);
    }
  }

  public on(): void {
    this._handleMouseEvents();
    this._handleTouchEvents();
  }

  public off(): void {
    // Pass touch events to canvas element on mobile IE11 and Edge.
    this.canvas.style.msTouchAction = "auto";
    this.canvas.style.touchAction = "auto";

    this.canvas.removeEventListener("mousedown", this._handleMouseDown);
    this.canvas.removeEventListener("mousemove", this._handleMouseMove);
    document.removeEventListener("mouseup", this._handleMouseUp);

    this.canvas.removeEventListener("touchstart", this._handleTouchStart);
    this.canvas.removeEventListener("touchmove", this._handleTouchMove);
    this.canvas.removeEventListener("touchend", this._handleTouchEnd);
  }

  public isEmpty(): boolean {
    return this._isEmpty;
  }

  public fromData(pointGroups: PointGroup[]): void {
    this.clear();

    this._fromData(
      pointGroups,
      (curve: Bezier) => this._drawCurve(curve),
      (point: IBasicPoint) => this._drawDot(point),
    );

    this._data = pointGroups;
  }

  public toData(): PointGroup[] {
    return this._data;
  }

  // Private methods
  private _strokeBegin(event: MouseEvent | Touch): void {
    this._data.push([]);
    this._reset();
    this._strokeUpdate(event);

    if (typeof this.onBegin === "function") {
      this.onBegin(event);
    }
  }

  private _strokeUpdate(event: MouseEvent | Touch): void {
    const x = event.clientX;
    const y = event.clientY;

    const point = this._createPoint(x, y);
    const lastPointGroup = this._data[this._data.length - 1];
    const lastPoint = lastPointGroup && lastPointGroup[lastPointGroup.length - 1];
    const isLastPointTooClose = lastPoint && point.distanceTo(lastPoint) < this.minDistance;

    // Skip this point if it's too close to the previous one
    if (!(lastPoint && isLastPointTooClose)) {
      const curve = this._addPoint(point);

      if (curve) {
        this._drawCurve(curve);
      }

      this._data[this._data.length - 1].push({
        color: this.penColor,
        time: point.time,
        x: point.x,
        y: point.y,
      });
    }
  }

  private _strokeEnd(event: MouseEvent | Touch): void {
    const canDrawCurve = this._points.length > 2;
    const point = this._points[0]; // Point instance

    if (!canDrawCurve && point) {
      this._drawDot(point);
    }

    if (point) {
      const lastPointGroup = this._data[this._data.length - 1];
      const lastPoint = lastPointGroup[lastPointGroup.length - 1]; // plain object

      // When drawing a dot, there's only one point in a group, so without this check
      // such group would end up with exactly the same 2 points.
      if (!point.equals(lastPoint)) {
        lastPointGroup.push({
          color: this.penColor,
          time: point.time,
          x: point.x,
          y: point.y,
        });
      }
    }

    if (typeof this.onEnd === "function") {
      this.onEnd(event);
    }
  }

  private _handleMouseEvents(): void {
    this._mouseButtonDown = false;

    this.canvas.addEventListener("mousedown", this._handleMouseDown);
    this.canvas.addEventListener("mousemove", this._handleMouseMove);
    document.addEventListener("mouseup", this._handleMouseUp);
  }

  private _handleTouchEvents(): void {
    // Pass touch events to canvas element on mobile IE11 and Edge.
    this.canvas.style.msTouchAction = "none";
    this.canvas.style.touchAction = "none";

    this.canvas.addEventListener("touchstart", this._handleTouchStart);
    this.canvas.addEventListener("touchmove", this._handleTouchMove);
    this.canvas.addEventListener("touchend", this._handleTouchEnd);
  }

  // Called when a new curve is started
  private _reset(): void {
    this._points = [];
    this._lastVelocity = 0;
    this._lastWidth = (this.minWidth + this.maxWidth) / 2;
    this._ctx.fillStyle = this.penColor;
  }

  private _createPoint(x: number, y: number): Point {
    const rect = this.canvas.getBoundingClientRect();

    return new Point(
      x - rect.left,
      y - rect.top,
      this.penColor,
      new Date().getTime(),
    );
  }

  // Add point to "_points" array and generate new curve if there are enough points (i.e. 3)
  private _addPoint(point: Point): Bezier | null {
    const { _points } = this;
    let tmp;

    _points.push(point);

    if (_points.length > 2) {
      // To reduce the initial lag make it work with 3 points
      // by copying the first point to the beginning.
      if (_points.length === 3) {
        _points.unshift(_points[0]);
      }

      tmp = this._calculateCurveControlPoints(_points[0], _points[1], _points[2]);
      const { c2 } = tmp;
      tmp = this._calculateCurveControlPoints(_points[1], _points[2], _points[3]);
      const c3 = tmp.c1;
      const widths = this._calculateCurveWidths(_points[1], _points[2]);
      const curve = new Bezier(_points[1], c2, c3, _points[2], widths.start, widths.end);

      // Remove the first element from the list, so that we always have no
      // more than 4 points in "points" array.
      _points.shift();

      return curve;
    }

    return null;
  }

  private _calculateCurveControlPoints(
    s1: IBasicPoint,
    s2: IBasicPoint,
    s3: IBasicPoint,
  ): {
    c1: IBasicPoint,
    c2: IBasicPoint,
  } {
    const dx1 = s1.x - s2.x;
    const dy1 = s1.y - s2.y;
    const dx2 = s2.x - s3.x;
    const dy2 = s2.y - s3.y;

    const m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
    const m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };

    const l1 = Math.sqrt((dx1 * dx1) + (dy1 * dy1));
    const l2 = Math.sqrt((dx2 * dx2) + (dy2 * dy2));

    const dxm = (m1.x - m2.x);
    const dym = (m1.y - m2.y);

    const k = l2 / (l1 + l2);
    const cm = { x: m2.x + (dxm * k), y: m2.y + (dym * k) };

    const tx = s2.x - cm.x;
    const ty = s2.y - cm.y;

    return {
      c1: new Point(m1.x + tx, m1.y + ty, this.penColor),
      c2: new Point(m2.x + tx, m2.y + ty, this.penColor),
    };
  }

  private _calculateCurveWidths(startPoint: Point, endPoint: Point): { start: number, end: number} {
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

  private _drawCurve(curve: Bezier): void {
    const ctx = this._ctx;
    const widthDelta = curve.endWidth - curve.startWidth;
    const drawSteps = Math.floor(curve.length());

    ctx.beginPath();
    ctx.fillStyle = curve.startPoint.color;

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

  private _drawDot(point: IBasicPoint): void {
    const ctx = this._ctx;
    const width = typeof this.dotSize === "function" ? this.dotSize() : this.dotSize;

    ctx.beginPath();
    this._drawCurveSegment(point.x, point.y, width);
    ctx.closePath();
    ctx.fillStyle = point.color;
    ctx.fill();
  }

  private _fromData(
    pointGroups: PointGroup[],
    drawCurve: SignaturePad["_drawCurve"],
    drawDot: SignaturePad["_drawDot"],
  ): void {
    for (const group of pointGroups) {
      if (group.length > 1) {
        for (let j = 0; j < group.length; j += 1) {
          const basicPoint = group[j];
          const point = new Point(basicPoint.x, basicPoint.y, basicPoint.color, basicPoint.time);

          if (j === 0) {
            // First point in a group. Nothing to draw yet.

            // All points in the group have the same color, so it's enough to set
            // penColor just at the beginning.
            this.penColor = point.color;

            this._reset();
            this._addPoint(point);
          } else if (j !== group.length - 1) {
            // Middle point in a group.
            const curve = this._addPoint(point);
            if (curve) {
              drawCurve(curve);
            }
          } else {
            // Last point in a group. Do nothing.
          }
        }
      } else {
        this._reset();
        const point = group[0];
        drawDot(point);
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
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svg.setAttribute("width", this.canvas.width.toString());
    svg.setAttribute("height", this.canvas.height.toString());

    this._fromData(
      pointGroups,

      (curve: Bezier) => {
        const path = document.createElement("path");
        const color = curve.startPoint.color;

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
          path.setAttribute("d", attr);
          path.setAttribute("stroke-width", (curve.endWidth * 2.25).toFixed(3));
          path.setAttribute("stroke", color);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke-linecap", "round");

          svg.appendChild(path);
        }
        /* eslint-enable no-restricted-globals */
      },

      (rawPoint: IBasicPoint) => {
        const circle = document.createElement("circle");
        const dotSize = typeof this.dotSize === "function" ? this.dotSize() : this.dotSize;
        circle.setAttribute("r", dotSize.toString());
        circle.setAttribute("cx", rawPoint.x.toString());
        circle.setAttribute("cy", rawPoint.y.toString());
        circle.setAttribute("fill", rawPoint.color);

        svg.appendChild(circle);
      },
    );

    const prefix = "data:image/svg+xml;base64,";
    const header = "<svg"
      + " xmlns=\"http://www.w3.org/2000/svg\""
      + " xmlns:xlink=\"http://www.w3.org/1999/xlink\""
      + ` viewBox="${minX} ${minY} ${maxX} ${maxY}"`
      + ` width="${maxX}"`
      + ` height="${maxY}"`
      + ">";
    let body = svg.innerHTML;

    // IE hack for missing innerHTML property on SVGElement
    if (body === undefined) {
      const dummy = document.createElement("dummy");
      const nodes = svg.childNodes;
      dummy.innerHTML = "";

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < nodes.length; i += 1) {
        dummy.appendChild(nodes[i].cloneNode(true));
      }

      body = dummy.innerHTML;
    }

    const footer = "</svg>";
    const data = header + body + footer;

    return prefix + btoa(data);
  }
}
