import { Point } from '../src/point';

describe('errors', () => {
  it('throws error when coords are invalid', () => {
    expect(() => {
      // @ts-expect-error x and y are supposed to be numbers
      new Point('1', '1.1.1');
    }).toThrow(/invalid/);
  });

  it('convert string x and y coords to number', () => {
    // @ts-expect-error x and y are supposed to be numbers
    const a = new Point('1', '1.1');

    expect(a.x).toBe(1);
    expect(a.y).toBe(1.1);
  });
});

describe('#distanceTo', () => {
  it('returns distance to other point', () => {
    const now = Date.now();
    const a = new Point(0, 0, 0, now);
    const b = new Point(4, 3, 0, now);

    expect(a.distanceTo(b)).toBe(5);
  });
});

describe('#equals', () => {
  it('returns true if points have the same attributes', () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 1, 0, now);

    expect(a.equals(b)).toBe(true);
  });

  it("returns false if points have the different 'x' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(2, 1, 0, now);

    expect(a.equals(b)).toBe(false);
  });

  it("returns false if points have the different 'y' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 2, 0, now);

    expect(a.equals(b)).toBe(false);
  });

  it("returns false if points have the different 'time' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 1, 0, now + 1);

    expect(a.equals(b)).toBe(false);
  });

  it("returns false if points have the different 'pressure' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 1, 1, now);

    expect(a.equals(b)).toBe(false);
  });
});

describe('#velocityFrom', () => {
  it('returns 0 if times are equal', () => {
    const now = Date.now();
    const a = new Point(1, 1, 0, now);
    const b = new Point(1, 1, 0, now);

    expect(a.velocityFrom(b)).toBe(0);
  });

  it('returns velocity if times are different', () => {
    const now = Date.now();
    const a = new Point(0, 0, 0, now);
    const b = new Point(4, 3, 0, now + 10);

    expect(a.velocityFrom(b)).toBe(-0.5);
  });
});
