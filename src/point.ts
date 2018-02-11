// Interface for point data structure used e.g. in SignaturePad#fromData method
export interface IBasicPoint {
  x: number;
  y: number;
  time: number;
  color: string;
}

export class Point implements IBasicPoint {
  public time: number;

  constructor(public x: number, public y: number, public color: string, time?: number) {
    this.time = time || Date.now();
  }

  public velocityFrom(start: IBasicPoint): number {
    return (this.time !== start.time) ? this.distanceTo(start) / (this.time - start.time) : 1;
  }

  public distanceTo(start: IBasicPoint): number {
    return Math.sqrt(Math.pow(this.x - start.x, 2) + Math.pow(this.y - start.y, 2));
  }

  public equals(other: IBasicPoint): boolean {
    return this.x === other.x && this.y === other.y && this.time === other.time;
  }
}
