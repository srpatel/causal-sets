import * as PIXI from "pixi.js";
import _ from "underscore";
import { Actions } from "pixi-actions";

import App from "@/App";
import Screen from "@screens/Screen";
import Node from "./Node";

export default class Diamond extends PIXI.Container {
  static readonly HEIGHT = 100;
  static readonly WIDTH = 50;
  coords = [-1, -1];
  private area: PIXI.Graphics = new PIXI.Graphics();
  private pointsHolder: PIXI.Container = new PIXI.Container();
  private shape: PIXI.Polygon;
  points: Node[] = [];
  constructor(props: { isBackground: boolean }) {
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
    
    if (props.isBackground) {
      this.area.poly(this.shape.points).fill(0xffffff);
        this.area.poly(this.shape.points).stroke({
            color: 0,
            width: 2,
        });
    } else {
      const c = new PIXI.Color([Diamond.makeColourComponent(), Diamond.makeColourComponent(), Diamond.makeColourComponent()]);
      this.area.poly(this.shape.points).fill(c.toNumber());
    }
  }

  private static makeColourComponent() {
    return 1; //Math.random() * 0.3 + 0.7;
  }

  scoringPoint(type: number) {
    // TODO: type
    // - 0 = +1 for each spacelike node
    // - 1 = +1 for each connection
    // - 2 = +5 points if a post
    // - 3 = +1 point for nodes below
    // For now, all of them are +1 point for connections
    const node = new Node("star");
    node.setColour(0xD7AB10);
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
      const node = new Node("circle");
      node.setColour(0);
      this.pointsHolder.addChild(node);
      node.position.set(x, y);
      this.points.push(node);
    }
  }
}
