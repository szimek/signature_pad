// Interface for point data structure used e.g. in SignaturePad#fromData method
export interface BasicPoint {
  x: number;
  y: number;
  pressure: number;
  time: number;
}

export class Point implements BasicPoint {
  public pressure: number;
  public time: number;

  constructor(
    public x: number,
    public y: number,
    pressure?: number,
    time?: number,
  ) {
    this.pressure = pressure || 0;
    this.time = time || Date.now();
  }

  public distanceTo(start: BasicPoint): number {
    return Math.sqrt(
      Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2),
    );
  }

  public equals(other: BasicPoint): boolean {
    return this.x === other.x && this.y === other.y && this.time === other.time;
  }

  public velocityFrom(start: BasicPoint): number {
    return this.time !== start.time
      ? this.distanceTo(start) / (this.time - start.time)
      : 0;
  }
}
