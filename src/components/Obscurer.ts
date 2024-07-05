import * as PIXI from "pixi.js";

export default class Obscurer extends PIXI.Container {
  private hole = PIXI.Sprite.from("cutout.png");
  private tx: number = -1;
  private ty: number = -1;
  constructor() {
    super();

    const components = [this.hole];
    for (const c of components) {
      c.tint = 0;
      c.alpha = 0.72;
      this.addChild(c);
    }

    PIXI.Ticker.shared.add(() => {
      const x = this.tx - this.hole.width / 2;
      const y = this.ty - this.hole.height / 2;
      this.hole.position.set(
        this.hole.x + (x - this.hole.x) / 5,
        this.hole.y + (y - this.hole.y) / 5,
      );
    });
  }

  setHole(tx: number, ty: number): void {
    if (this.tx == -1 && this.ty == -1) {
      this.tx = tx;
      this.ty = ty;
      const x = this.tx - this.hole.width / 2;
      const y = this.ty - this.hole.height / 2;
      this.hole.position.set(x, y);
    }
    this.tx = tx;
    this.ty = ty;
  }
}
