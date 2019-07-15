// Interface for point data structure used e.g. in SignaturePad#fromData method
export interface IBasicPoint {
  acceleration: number;
  time: number;
  velocity: number;
  x: number;
  y: number;
}

export class Point implements IBasicPoint {
  public time: number;
  public velocity: number = 0;
  public acceleration: number = 0;

  constructor(
    public x: number,
    public y: number,
    time?: number
  ) {
    this.time = time || Date.now();
  }

  public distanceTo(start: IBasicPoint): number {
    return Math.sqrt(
      Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2)
    );
  }

  public equals(other: IBasicPoint): boolean {
    return this.x === other.x && this.y === other.y && this.time === other.time;
  }

  public accelerationFrom(start: IBasicPoint): number {
    if (this.time === start.time) {
      this.acceleration = 0
    } else {
      this.acceleration = this._velocityDiff(start) / (this.time - start.time)
    }

    return this.acceleration
  }

  public velocityFrom(start: IBasicPoint): number {
    if (this.time === start.time) {
      this.velocity = 0
    } else {
      this.velocity = this.distanceTo(start) / (this.time - start.time)
    }

    return this.velocity
  }

  private _velocityDiff(start: IBasicPoint): number {
    const velocity = this.velocityFrom(start)

    return velocity - start.velocity
  }
}
