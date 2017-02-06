function Bezier(startPoint, control1, control2, endPoint) {
  this.startPoint = startPoint;
  this.control1 = control1;
  this.control2 = control2;
  this.endPoint = endPoint;
}

// Returns approximated length.
Bezier.prototype.length = function () {
  const steps = 10;
  let length = 0;
  let px;
  let py;

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const cx = this._point(
      t,
      this.startPoint.x,
      this.control1.x,
      this.control2.x,
      this.endPoint.x,
    );
    const cy = this._point(
      t,
      this.startPoint.y,
      this.control1.y,
      this.control2.y,
      this.endPoint.y,
    );
    if (i > 0) {
      const xdiff = cx - px;
      const ydiff = cy - py;
      length += Math.sqrt((xdiff * xdiff) + (ydiff * ydiff));
    }
    px = cx;
    py = cy;
  }

  return length;
};

/* eslint-disable no-multi-spaces, space-in-parens */
Bezier.prototype._point = function (t, start, c1, c2, end) {
  return (       start * (1.0 - t) * (1.0 - t)  * (1.0 - t))
       + (3.0 *  c1    * (1.0 - t) * (1.0 - t)  * t)
       + (3.0 *  c2    * (1.0 - t) * t          * t)
       + (       end   * t         * t          * t);
};
/* eslint-enable no-multi-spaces, space-in-parens */

export default Bezier;
