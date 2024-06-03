import Colour from "@/utils/Colour";
import * as PIXI from "pixi.js";

export type ScoringType =
  | "chain"
  | "five"
  | "maximal"
  | "minimal"
  | "post"
  | "two";

export default class Node extends PIXI.Container {
  downConnections: Node[] = [];
  upConnections: Node[] = [];
  type: string;
  private past: Set<Node> = null;
  private future: Set<Node> = null;
  private g: PIXI.Graphics = new PIXI.Graphics();
  private sprite: PIXI.Sprite = null;
  private _scoring: boolean;
  constructor(type: "normal" | ScoringType) {
    super();

    this.type = type;

    this.addChild(this.g);

    if (type == "normal") {
      this.g.circle(0, 0, 4).fill(Colour.DARK);
    } else {
      // ....
      this.sprite = PIXI.Sprite.from("node-" + type + "-incomplete.png");
      this.scoring = false;
      this.sprite.anchor.set(0.5);
      this.sprite.scale.set(0.2);
      this.addChild(this.sprite);
    }
  }

  set scoring(b: boolean) {
    this._scoring = b;
    const suffix = b ? "" : "-incomplete";
    this.sprite.texture = PIXI.Texture.from("node-" + this.type + suffix + ".png");
  }

  isPast(node: Node): boolean {
    if (node == this) return true;
    for (const p of this.downConnections) {
      if (p.isPast(node)) return true;
    }
    return false;
  }

  reset() {
    this.past = null;
    this.future = null;
    this.downConnections = [];
    this.upConnections = [];
  }

  numConnections() {
    return this.downConnections.length + this.upConnections.length;
  }

  getPast(): Set<Node> {
    if (this.past) return this.past;
    let past = new Set<Node>();
    for (const p of this.downConnections) {
      past.add(p);
      for (const pp of p.getPast()) {
        past.add(pp);
      }
    }
    this.past = past;
    return past;
  }

  getFuture(): Set<Node> {
    if (this.future) return this.future;
    let future = new Set<Node>();
    for (const p of this.upConnections) {
      future.add(p);
      for (const pp of p.getFuture()) {
        future.add(pp);
      }
    }
    this.future = future;
    return future;
  }
}
