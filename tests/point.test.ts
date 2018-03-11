import { Point } from "../src/point";

describe("#distanceTo", () => {
  it("returns distance to other point", () => {
    const now = Date.now();
    const a = new Point(0, 0, now);
    const b = new Point(4, 3, now);

    expect(a.distanceTo(b)).toBe(5);
  });
});

describe("#equals", () => {
  it("returns true if points have the same attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, now);
    const b = new Point(1, 1, now);

    expect(a.equals(b)).toBe(true);
  });

  it("returns false if points have the different 'x' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, now);
    const b = new Point(2, 1, now);

    expect(a.equals(b)).toBe(false);
  });

  it("returns false if points have the different 'y' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, now);
    const b = new Point(1, 2, now);

    expect(a.equals(b)).toBe(false);
  });

  it("returns false if points have the different 'time' attributes", () => {
    const now = Date.now();
    const a = new Point(1, 1, now);
    const b = new Point(1, 1, now + 1);

    expect(a.equals(b)).toBe(false);
  });
});

describe("#velocityFrom", () => {
  it("returns 0 if times are equal", () => {
    const now = Date.now();
    const a = new Point(1, 1, now);
    const b = new Point(1, 1, now);

    expect(a.velocityFrom(b)).toBe(0);
  });

  it("returns velocity if times are different", () => {
    const now = Date.now();
    const a = new Point(0, 0, now);
    const b = new Point(4, 3, now + 10);

    expect(a.velocityFrom(b)).toBe(-0.5);
  });
});
