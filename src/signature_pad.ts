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
import SignaturePadBase, { Options, PointGroup } from './signature_pad_base';

export default class SignaturePad extends SignaturePadBase {
  public onBegin?: (event: MouseEvent | Touch) => void;
  public onEnd?: (event: MouseEvent | Touch) => void;
  public canvas: HTMLCanvasElement;

  // Private stuff
  /* tslint:disable: variable-name */
  private _mouseButtonDown: boolean;

  constructor(canvas: HTMLCanvasElement, options: Options = {}) {
    super(canvas, options);
    this.onBegin = options.onBegin;
    this.onEnd = options.onEnd;

    // Enable mouse and touch event handlers
    this.on();
  }

  public fromDataURL(
    dataUrl: string,
    options: { ratio?: number; width?: number; height?: number } = {},
    callback?: (error?: string | Event) => void,
  ): void {
    const image = new Image();
    const ratio = options.ratio || window.devicePixelRatio || 1;
    const width = options.width || this.canvas.width / ratio;
    const height = options.height || this.canvas.height / ratio;

    this.reset();

    image.onload = (): void => {
      this.ctx.drawImage(image, 0, 0, width, height);
      if (callback) {
        callback();
      }
    };
    image.onerror = (error): void => {
      if (callback) {
        callback(error);
      }
    };
    image.src = dataUrl;

    this._isEmpty = false;
  }

  public toDataURL(type = 'image/png', encoderOptions?: number): string {
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

  public fromData(pointGroups: PointGroup[]): void {
    this.clear();

    this._fromData(
      pointGroups,
      ({ color, curve }) => this._drawCurve({ color, curve }),
      ({ color, point }) => this._drawDot({ color, point }),
    );

    this.data = pointGroups;
  }

  public toData(): PointGroup[] {
    return this.data;
  }

  // Event handlers
  private _handleMouseDown = (event: MouseEvent): void => {
    if (event.which === 1) {
      this._mouseButtonDown = true;
      this.strokeBegin(event);
    }
  };

  private _handleMouseMove = (event: MouseEvent): void => {
    if (this._mouseButtonDown) {
      this.strokeMoveUpdate(event);
    }
  };

  private _handleMouseUp = (event: MouseEvent): void => {
    if (event.which === 1 && this._mouseButtonDown) {
      this._mouseButtonDown = false;
      this.strokeEnd(event);
    }
  };

  private _handleTouchStart = (event: TouchEvent): void => {
    // Prevent scrolling.
    event.preventDefault();

    if (event.targetTouches.length === 1) {
      const touch = event.changedTouches[0];
      this.strokeBegin(touch);
    }
  };

  private _handleTouchMove = (event: TouchEvent): void => {
    // Prevent scrolling.
    event.preventDefault();

    const touch = event.targetTouches[0];
    this.strokeMoveUpdate(touch);
  };

  private _handleTouchEnd = (event: TouchEvent): void => {
    const wasCanvasTouched = event.target === this.canvas;
    if (wasCanvasTouched) {
      event.preventDefault();

      const touch = event.changedTouches[0];
      this.strokeEnd(touch);
    }
  };

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

  private _fromData(
    pointGroups: PointGroup[],
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
            this.reset();
          }

          const curve = this._addPoint(point);

          if (curve) {
            drawCurve({ color, curve });
          }
        }
      } else {
        this.reset();

        drawDot({
          color,
          point: points[0],
        });
      }
    }
  }

  private _toSVG(): string {
    const pointGroups = this.data;
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

      ({ color, curve }: { color: string; curve: Bezier }) => {
        const path = document.createElement('path');

        // Need to check curve for NaN values, these pop up when drawing
        // lines on the canvas that are not continuous. E.g. Sharp corners
        // or stopping mid-stroke and than continuing without lifting mouse.
        /* eslint-disable no-restricted-globals */
        if (
          !isNaN(curve.control1.x) &&
          !isNaN(curve.control1.y) &&
          !isNaN(curve.control2.x) &&
          !isNaN(curve.control2.y)
        ) {
          const attr =
            `M ${curve.startPoint.x.toFixed(3)},${curve.startPoint.y.toFixed(
              3,
            )} ` +
            `C ${curve.control1.x.toFixed(3)},${curve.control1.y.toFixed(3)} ` +
            `${curve.control2.x.toFixed(3)},${curve.control2.y.toFixed(3)} ` +
            `${curve.endPoint.x.toFixed(3)},${curve.endPoint.y.toFixed(3)}`;
          path.setAttribute('d', attr);
          path.setAttribute('stroke-width', (curve.endWidth * 2.25).toFixed(3));
          path.setAttribute('stroke', color);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-linecap', 'round');

          svg.appendChild(path);
        }
        /* eslint-enable no-restricted-globals */
      },

      ({ color, point }: { color: string; point: BasicPoint }) => {
        const circle = document.createElement('circle');
        const dotSize =
          typeof this.dotSize === 'function' ? this.dotSize() : this.dotSize;
        circle.setAttribute('r', dotSize.toString());
        circle.setAttribute('cx', point.x.toString());
        circle.setAttribute('cy', point.y.toString());
        circle.setAttribute('fill', color);

        svg.appendChild(circle);
      },
    );

    const prefix = 'data:image/svg+xml;base64,';
    const header =
      '<svg' +
      ' xmlns="http://www.w3.org/2000/svg"' +
      ' xmlns:xlink="http://www.w3.org/1999/xlink"' +
      ` viewBox="${minX} ${minY} ${maxX} ${maxY}"` +
      ` width="${maxX}"` +
      ` height="${maxY}"` +
      '>';
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
