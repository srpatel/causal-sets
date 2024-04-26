import * as PIXI from "pixi.js";

export default class Node extends PIXI.Container {
  private past: Node[] = [];
  private g: PIXI.Graphics = new PIXI.Graphics();
  constructor() {
    super();

    this.addChild(this.g);

    this.g.circle(0, 0, 6).fill(0xffffff);
  }

  isPast(node: Node): boolean {
    if (node == this) return true;
    for (const p of this.past) {
      if (p.isPast(node)) return true;
    }
    return false;
  }

  setPast(node: Node): void {
    this.past.push(node);
  }

  clearPast() {
    this.past = [];
  }

  setColour(c: number) {
    this.g.tint = c;
  }
}
