import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { Bezier } from '../src/bezier.js';
import { Point } from '../src/point.js';

function freezeTimeAt(time: number, callback: () => void): void {
  const now = Date.now;
  Date.now = mock.fn(() => time);
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

      assert.deepStrictEqual(curve.startPoint, p2);
      assert.deepStrictEqual(
        curve.control1,
        new Point(78.57685352817168, 73.72818901535666),
      );
      assert.deepStrictEqual(
        curve.control2,
        new Point(12.375668721124931, 107.81751540843696),
      );
      assert.strictEqual(curve.endPoint, p3);
      assert.strictEqual(curve.startWidth, 0.5);
      assert.strictEqual(curve.endWidth, 2);
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

      assert.deepStrictEqual(curve.startPoint, p2);
      assert.deepStrictEqual(curve.control1, new Point(54.4, 10.9));
      assert.deepStrictEqual(curve.control2, new Point(54.4, 10.9));
      assert.strictEqual(curve.endPoint, p3);
      assert.strictEqual(curve.startWidth, 1);
      assert.strictEqual(curve.endWidth, 1);
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

    assert.strictEqual(curve.length(), 196.92750351842562); // close enough ¯\_(ツ)_/¯
  });
});
