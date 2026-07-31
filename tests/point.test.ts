import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Point } from '../src/point.js';

describe('errors', () => {
  it('throws error when coords are invalid', () => {
    assert.throws(() => {
      // @ts-expect-error x and y are supposed to be numbers
      new Point('1', '1.1.1');
    }, /invalid/);
  });

  it('convert string x and y coords to number', () => {
    // @ts-expect-error x and y are supposed to be numbers
    const a = new Point('1', '1.1');

    assert.strictEqual(a.x, 1);
    assert.strictEqual(a.y, 1.1);
  });
});

describe('#distanceTo', () => {
  it('returns distance to other point', () => {
    const now = Date.now();
    const a = new Point(0, 0, 0, now);
    const b = new Point(4, 3, 0, now);

    assert.strictEqual(a.distanceTo(b), 5);
  });
});

describe('#equals', () => {
  it('returns true if points have the same attributes', () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 1, 0, now);

    assert.strictEqual(a.equals(b), true);
  });

  it("returns false if points have the different 'x' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(2, 1, 0, now);

    assert.strictEqual(a.equals(b), false);
  });

  it("returns false if points have the different 'y' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 2, 0, now);

    assert.strictEqual(a.equals(b), false);
  });

  it("returns false if points have the different 'time' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 1, 0, now + 1);

    assert.strictEqual(a.equals(b), false);
  });

  it("returns false if points have the different 'pressure' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 1, 1, now);

    assert.strictEqual(a.equals(b), false);
  });
});

describe('#velocityFrom', () => {
  it('returns 0 if times are equal', () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 1, 0, now);

    assert.strictEqual(a.velocityFrom(b), 0);
  });

  it('returns velocity if times are different', () => {
    const now = Date.now();
    const a = new Point(0, 0, 0, now);
    const b = new Point(4, 3, 0, now + 10);

    assert.strictEqual(a.velocityFrom(b), -0.5);
  });
});
