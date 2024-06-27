import Colour from "@/utils/Colour";
import * as PIXI from "pixi.js";
import Node from "./Node";

export default class Edge extends PIXI.Graphics {
  from: Node;
  to: Node;
  constructor(from: Node, to: Node) {
    super();

    this.from = from;
    this.to = to;

    this.setStrokeStyle({ width: 3, color: Colour.DARK });

    this.moveTo(from.x, from.y).lineTo(to.x, to.y).stroke();
  }
}
