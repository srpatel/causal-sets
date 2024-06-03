import * as PIXI from "pixi.js";
import _ from "underscore";
import { Actions } from "pixi-actions";

import App from "@/App";
import Screen from "@screens/Screen";
import Node, { ScoringType } from "./Node";
import Colour from "@/utils/Colour";

export default class Diamond extends PIXI.Container {
  static readonly HEIGHT = 90;
  static readonly WIDTH = 90;
  coords = [-1, -1];
  private area: PIXI.Graphics = new PIXI.Graphics();
  private pointsHolder: PIXI.Container = new PIXI.Container();
  private shape: PIXI.Polygon;
  points: Node[] = [];
  constructor(props: { isBackground: boolean, colour?: PIXI.ColorSource }) {
    super();

    // Put the Shape in the middle
    this.addChild(this.area);
    this.addChild(this.pointsHolder);

    // Draw the shape (diamond, for now)
    // prettier-ignore
    this.shape = new PIXI.Polygon(
      0, -Diamond.HEIGHT,
      Diamond.WIDTH, 0,
      0, Diamond.HEIGHT,
      -Diamond.WIDTH, 0,
      0, -Diamond.HEIGHT
    );

    const colour = props.colour ?? Colour.SPACETIME_BG;
    
    if (props.isBackground) {
      this.area.poly(this.shape.points).fill(colour);
        this.area.poly(this.shape.points).stroke({
            color: 0,
            width: 2,
        });
    } else {
      this.area.poly(this.shape.points).fill(colour);
    }
  }

  scoringPoint(type: ScoringType) {
    const node = new Node(type);
    this.pointsHolder.addChild(node);
    node.position.set(0, 0);
    this.points.push(node);
  }

  sprinklePoints(num: number) {
    // Clear all old points
    while (this.points.length > 0) {
      this.points.pop();
    }
    this.pointsHolder.removeChildren();

    const targetNumPoints = num;
    // TODO : More efficient, and don't overlap edge
    while (this.points.length < targetNumPoints) {
      const x = Math.random() * this.area.width - this.area.width / 2;
      const y = Math.random() * this.area.height - this.area.height / 2;
      if (!this.shape.contains(x, y)) {
        // Outside the area, generate another point!
        continue;
      }

      // Inside the area! Put a point here.
      const node = new Node("normal");
      this.pointsHolder.addChild(node);
      node.position.set(x, y);
      this.points.push(node);
    }
  }
}
