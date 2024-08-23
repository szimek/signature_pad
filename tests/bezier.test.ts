import { Bezier } from '../src/bezier';
import { Point } from '../src/point';

function freezeTimeAt(time: number, callback: () => void): void {
  const now = Date.now;
  Date.now = jest.fn().mockReturnValue(time);
  callback();
  Date.now = now;
}

describe('.fromPoints', () => {
  it('returns a new Bézier curve', () => {
    const now = Date.now();

    freezeTimeAt(now, () => {
      const p1 = new Point(100, 25);
      const p2 = new Point(10, 90);
      const p3 = new Point(110, 100);
      const p4 = new Point(132, 192);
      const curve = Bezier.fromPoints([p1, p2, p3, p4], { start: 0.5, end: 2 });

      expect(curve.startPoint).toEqual(p2);
      expect(curve.control1).toEqual(
        new Point(78.57685352817168, 73.72818901535666),
      );
      expect(curve.control2).toEqual(
        new Point(12.375668721124931, 107.81751540843696),
      );
      expect(curve.endPoint).toBe(p3);
      expect(curve.startWidth).toBe(0.5);
      expect(curve.endWidth).toBe(2);
    });
  });

  it('returns a new Bézier when points are equal and division by zero may occur', () => {
    const now = Date.now();

    freezeTimeAt(now, () => {
      const p1 = new Point(54.4, 10.9, 0.5);
      const p2 = new Point(54.4, 10.9, 0.5);
      const p3 = new Point(54.4, 10.9, 0.5);
      const p4 = new Point(54.4, 10.9, 0.5);
      const curve = Bezier.fromPoints([p1, p2, p3, p4], { start: 1, end: 1 });

      expect(curve.startPoint).toEqual(p2);
      expect(curve.control1).toEqual(new Point(54.4, 10.9));
      expect(curve.control2).toEqual(new Point(54.4, 10.9));
      expect(curve.endPoint).toBe(p3);
      expect(curve.startWidth).toBe(1);
      expect(curve.endWidth).toBe(1);
    });
  });
});

describe('#length', () => {
  it('returns approximated length', () => {
    const p1 = new Point(100, 25);
    const p2 = new Point(10, 90);
    const p3 = new Point(110, 100);
    const p4 = new Point(132, 192);
    const curve = new Bezier(p1, p2, p3, p4, 1, 1);

    expect(curve.length()).toBe(196.92750351842562); // close enough ¯\_(ツ)_/¯
  });
});
