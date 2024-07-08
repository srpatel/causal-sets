import { Action, Interpolations } from "pixi-actions";
import * as PIXI from "pixi.js";

export default class TintTo extends Action {
  time: number = 0;
  seconds: number;
  target: PIXI.Container;
  interpolation: any;
  startTint: PIXI.Color;
  tint: PIXI.Color;
  currentTint = new PIXI.Color();

  constructor(
    target: PIXI.Container,
    tint: number,
    seconds: number,
    interpolation = Interpolations.linear,
  ) {
    super();
    this.seconds = seconds;
    this.target = target;
    this.interpolation = interpolation;
    this.tint = new PIXI.Color(tint);
  }

  get timeDistance(): number {
    return Math.min(1, this.time / this.seconds);
  }

  tick(delta: number): boolean {
    if (this.time === 0) {
      this.startTint = new PIXI.Color(this.target.tint);
    }

    this.time += delta;

    const factor: number = this.interpolation(this.timeDistance);

    this.currentTint.setValue([
      this.startTint.red + (this.tint.red - this.startTint.red) * factor,
      this.startTint.green + (this.tint.green - this.startTint.green) * factor,
      this.startTint.blue + (this.tint.blue - this.startTint.blue) * factor,
    ]);
    this.target.tint = this.currentTint;
    return this.timeDistance >= 1;
  }

  reset() {
    super.reset();
    this.time = 0;
    return this;
  }
}
