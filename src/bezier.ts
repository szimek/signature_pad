import { BasicPoint, Point } from './point';

export class Bezier {
  public static fromPoints(
    points: Point[],
    widths: { start: number; end: number },
  ): Bezier {
    const c2 = this.calculateControlPoints(points[0], points[1], points[2]).c2;
    const c3 = this.calculateControlPoints(points[1], points[2], points[3]).c1;

    return new Bezier(points[1], c2, c3, points[2], widths.start, widths.end);
  }

  private static calculateControlPoints(
    s1: BasicPoint,
    s2: BasicPoint,
    s3: BasicPoint,
  ): {
    c1: BasicPoint;
    c2: BasicPoint;
  } {
    const dx1 = s1.x - s2.x;
    const dy1 = s1.y - s2.y;
    const dx2 = s2.x - s3.x;
    const dy2 = s2.y - s3.y;

    const m1 = { x: (s1.x + s2.x) / 2.0, y: (s1.y + s2.y) / 2.0 };
    const m2 = { x: (s2.x + s3.x) / 2.0, y: (s2.y + s3.y) / 2.0 };

    const l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

    const dxm = m1.x - m2.x;
    const dym = m1.y - m2.y;

    const k = l1 + l2 == 0 ? 0 : l2 / (l1 + l2);
    const cm = { x: m2.x + dxm * k, y: m2.y + dym * k };

    const tx = s2.x - cm.x;
    const ty = s2.y - cm.y;

    return {
      c1: new Point(m1.x + tx, m1.y + ty),
      c2: new Point(m2.x + tx, m2.y + ty),
    };
  }

  constructor(
    public startPoint: Point,
    public control2: BasicPoint,
    public control1: BasicPoint,
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

        length += Math.sqrt(xdiff * xdiff + ydiff * ydiff);
      }

      px = cx;
      py = cy;
    }

    return length;
  }

  // Calculate parametric value of x or y given t and the four point coordinates of a cubic bezier curve.
  private point(
    t: number,
    start: number,
    c1: number,
    c2: number,
    end: number,
  ): number {
    // prettier-ignore
    return (       start * (1.0 - t) * (1.0 - t)  * (1.0 - t))
         + (3.0 *  c1    * (1.0 - t) * (1.0 - t)  * t)
         + (3.0 *  c2    * (1.0 - t) * t          * t)
         + (       end   * t         * t          * t);
  }
}
