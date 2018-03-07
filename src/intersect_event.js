import Point from './point';
import Bezier from './bezier';

function IntersectEvent(opts) {
  this.context = opts.context;
  this.callback = opts.callback;
  this.hitOff = opts.hitOff || 0;

  this._reset();
}

IntersectEvent.prototype = {
  get velocityFilterWeight() {
    return this.context.velocityFilterWeight;
  },
  get minWidth() {
    return this.context.minWidth;
  },
  get maxWidth() {
    return this.context.maxWidth;
  },
  get dotSize() {
    return this.context.dotSize;
  },
};

IntersectEvent.prototype._reset = function () {
  this.points = [];
  this._lastVelocity = 0;
  this._lastWidth = (this.minWidth + this.maxWidth) / 2;

  this.hitResult = {
    hit: false,
    crossX: 0,
    crossY: 0,
  };
};

IntersectEvent.prototype._addPoint = function (point) {
  const points = this.points;
  let tmp;

  points.push(point);

  if (points.length > 2) {
    // To reduce the initial lag make it work with 3 points
    // by copying the first point to the beginning.
    if (points.length === 3) points.unshift(points[0]);

    tmp = this.context._calculateCurveControlPoints.call(this, points[0], points[1], points[2]);
    const c2 = tmp.c2;
    tmp = this.context._calculateCurveControlPoints.call(this, points[1], points[2], points[3]);
    const c3 = tmp.c1;
    const curve = new Bezier(points[1], c2, c3, points[2]);
    const widths = this.context._calculateCurveWidths.call(this, curve);

    // Remove the first element from the list,
    // so that we always have no more than 4 points in points array.
    points.shift();

    return { curve, widths };
  }

  return {};
};

IntersectEvent.prototype._drawPoint = function (x, y, size) {
  const d = Math.sqrt(Math.pow(x - this.hitPoint.x, 2) + Math.pow(y - this.hitPoint.y, 2));
  if (d < (size + this.hitOff)) {
    this.hitResult.hit = true;
    this.hitResult.crossX = x;
    this.hitResult.crossY = y;
  }
};

IntersectEvent.prototype._drawCurve = function (curve, startWidth, endWidth) {
  const widthDelta = endWidth - startWidth;
  const drawSteps = Math.floor(curve.length());

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

    const width = startWidth + (ttt * widthDelta);
    this._drawPoint(x, y, width);
    if (this.hitResult.hit) break;
  }
};

IntersectEvent.prototype._drawDot = function (point) {
  const width = (typeof this.dotSize) === 'function' ? this.dotSize() : this.dotSize;

  this._drawPoint(point.x, point.y, width);
};

IntersectEvent.prototype.intersectPath = function (group, hitPoint) {
  this._reset();
  this.hitPoint = {
    x: hitPoint.x,
    y: hitPoint.y,
  };

  if (group.length > 0) {
    if (group.length > 1) {
      for (let j = 0; j < group.length; j += 1) {
        const rawPoint = group[j];
        const point = new Point(rawPoint.x, rawPoint.y, rawPoint.time);
        if (j === 0) {
          // First point in a group. Nothing to draw yet.
          this._addPoint(point);
        } else if (j !== group.length - 1) {
          // Middle point in a group.
          const { curve, widths } = this._addPoint(point);
          if (curve && widths) {
            this._drawCurve(curve, widths.start, widths.end);
            if (this.hitResult.hit) break;
          }
        } else {
          // Last point in a group. Do nothing.
        }
      }
    } else {
      const rawPoint = group[0];
      this._drawDot(rawPoint);
    }
  }

  if (this.hitResult.hit) {
    this.callback({
      path: group,
      crossX: this.hitResult.crossX,
      crossY: this.hitResult.crossY,
    });
    this._reset();
  }
};

export default IntersectEvent;
