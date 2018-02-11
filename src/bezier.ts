import { IBasicPoint, Point } from "./point";

export class Bezier {
  constructor(
    public startPoint: Point,
    public control2: IBasicPoint,
    public control1: IBasicPoint,
    public endPoint: Point,
    public startWidth: number,
    public endWidth: number,
  ) {}

  // Returns approximated length. Code taken from https://www.lemoda.net/maths/bezier-length/index.html.
  public length(): number {
    const steps = 10;
    let length = 0;
    let px;
    let py;

    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const cx = this.point(
        t,
        this.startPoint.x,
        this.control1.x,
        this.control2.x,
        this.endPoint.x,
      );
      const cy = this.point(
        t,
        this.startPoint.y,
        this.control1.y,
        this.control2.y,
        this.endPoint.y,
      );

      if (i > 0) {
        const xdiff = cx - (px as number);
        const ydiff = cy - (py as number);

        length += Math.sqrt((xdiff * xdiff) + (ydiff * ydiff));
      }

      px = cx;
      py = cy;
    }

    return length;
  }

  // Calculate parametric value of x or y given t and the four point coordinates of a cubic bezier curve.
  private point(t: number, start: number, c1: number, c2: number, end: number): number {
    return (       start * (1.0 - t) * (1.0 - t)  * (1.0 - t))
         + (3.0 *  c1    * (1.0 - t) * (1.0 - t)  * t)
         + (3.0 *  c2    * (1.0 - t) * t          * t)
         + (       end   * t         * t          * t);
  }
}
