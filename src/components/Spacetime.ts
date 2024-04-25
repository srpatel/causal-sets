import * as PIXI from "pixi.js";
import _ from "underscore";
import { Actions } from "pixi-actions";

import App from "@/App";
import Screen from "@screens/Screen";
import Node from "./Node";

export default class Spacetime extends PIXI.Container {
  private area: PIXI.Graphics = new PIXI.Graphics();
  private shape: PIXI.Polygon;
  private pointsHolder: PIXI.Container = new PIXI.Container();
  private edgesHolder: PIXI.Graphics = new PIXI.Graphics();
  private points: Node[] = [];
  private lightCone: PIXI.Graphics = new PIXI.Graphics();
  constructor() {
    super();

    // Put the Shape in the middle
    this.addChild(this.area);
    this.addChild(this.edgesHolder);
    this.addChild(this.pointsHolder);
    this.addChild(this.lightCone);

    this.lightCone.visible = false;
    const cone = new PIXI.Polygon(0, 0, 2000, 2000, -2000, 2000, 0, 0);
    this.lightCone.beginFill(0xff0000, 0.2);
    this.lightCone.drawPolygon(cone);

    // Draw the shape (diamond, for now)
    this.area.beginFill(0xffffff);
    const size = 400;
    // prettier-ignore
    this.shape = new PIXI.Polygon(
      0, -size * 2,
      size, 0,
      0, size * 2,
      -size, 0,
      0, -size * 2
    );
    this.area.drawShape(this.shape);
  }

  sprinklePoints(num: number) {
    this.lightCone.visible = false;
    // Clear all old points
    while (this.points.length > 0) {
      this.points.pop();
    }
    this.pointsHolder.removeChildren();

    const targetNumPoints = num;
    while (this.points.length < targetNumPoints) {
      const x = Math.random() * this.area.width - this.area.width / 2;
      const y = Math.random() * this.area.height - this.area.height / 2;
      if (!this.shape.contains(x, y)) {
        // Outside the area, generate another point!
        continue;
      }

      // Inside the area! Put a point here.
      const node = new Node();
      node.setColour(0x7ba0d9);
      this.pointsHolder.addChild(node);
      node.position.set(x, y);
      this.points.push(node);

      // Hover over node to show the light cone
      node.eventMode = "dynamic";
      node.on("pointerover", () => {
        this.lightCone.visible = true;
        this.lightCone.position.set(x, y);
      });
      node.on("pointerout", () => {
        this.lightCone.visible = false;
      });
    }
  }

  drawEdges() {
    this.edgesHolder.clear();
    const sortedPoints = _.sortBy(this.points, (n) => -n.y);
    const roots = [...this.points];

    // Start with the lowest points, and work upwards
    // prettier-ignore
    const cone = new PIXI.Polygon(
      0, 0,
      2000, 2000,
      -2000, 2000,
      0, 0,
    );
    for (let i = 0; i < sortedPoints.length; i++) {
      const node = sortedPoints[i];
      // Draw the light cone for this point...
      for (let j = i - 1; j >= 0; j--) {
        // Find all points which fall within (can only be elements with lower index)
        const potential = sortedPoints[j];
        const isTimelike = cone.contains(
          potential.x - node.x,
          potential.y - node.y,
        );
        if (isTimelike) {
          // Are they already connected?
          if (node.isPast(potential)) {
            continue;
          }

          // Connect them!
          node.setPast(potential);

          // This is no longer a root
          const index = roots.indexOf(potential);
          if (index >= 0) {
            roots.splice(index, 1);
          }

          // Draw the line!
          this.edgesHolder
            .lineStyle(1, 0)
            .moveTo(node.x, node.y)
            .lineTo(potential.x, potential.y);
        }
      }
    }

    // Recolour the root nodes
    for (const r of roots) {
      r.setColour(0xff0000);
    }
  }
}
