import * as PIXI from "pixi.js";
import _ from "underscore";
import Diamond from "@/components/Diamond";
import Node from "@/components/Node";

export default class Board extends PIXI.Container {
  private static readonly DIMENSION = [4, 4];
  private backgroundDiamonds: Diamond[] = [];
  private background: PIXI.Container = new PIXI.Container();
  private foregroundDiamonds: Diamond[] = [];
  private nodes: Node[] = [];
  private foreground: PIXI.Container = new PIXI.Container();
  private nodesHolder: PIXI.Container = new PIXI.Container();
  private onClickBackgroundDiamond: (d: Diamond) => void;
  private edgesHolder: PIXI.Graphics = new PIXI.Graphics();
  constructor(onClickBackgroundDiamond: (d: Diamond) => void) {
    super();

    this.onClickBackgroundDiamond = onClickBackgroundDiamond;

    this.addChild(this.background);
    this.addChild(this.foreground);
    this.addChild(this.edgesHolder);
    this.addChild(this.nodesHolder);

    this.edgesHolder.setStrokeStyle({width: 1, color: 0})

    // Draw a bunch of diamonds to make the board
    for (let i = 0; i < Board.DIMENSION[0]; i++) {
      for (let j = 0; j < Board.DIMENSION[1]; j++) {
        const d = new Diamond({ isBackground: true });
        d.coords = [i, j];
        d.eventMode = "static";
        d.cursor = "pointer";
        this.positionDiamond(d);
        d.alpha = 0.2;
        this.backgroundDiamonds.push(d);
        this.background.addChild(d);

        // Hover over diamond to make opaque!
        d.on("pointerenter", () => {
          d.alpha = 1;
        });
        d.on("pointerleave", () => {
          d.alpha = 0.2;
        });

        // Click to place the selected diamond here...
        d.on("pointerdown", () => {
          if (this.onClickBackgroundDiamond) this.onClickBackgroundDiamond(d);
        });
      }
    }
  }

  positionDiamond(diamond: Diamond) {
    let x = (diamond.coords[0] + diamond.coords[1] - (Board.DIMENSION[0] - 1)) * Diamond.WIDTH;
    let y = (diamond.coords[0] - diamond.coords[1]) * Diamond.HEIGHT;
    diamond.position.set(x, y);
  }

  addDiamond(diamond: Diamond) {
    // TODO : Coords?
    this.foregroundDiamonds.push(diamond);
    this.foreground.addChild(diamond);
    this.positionDiamond(diamond);
    for (const p of diamond.points) {
        p.x += diamond.x;
        p.y += diamond.y;
        this.nodes.push(p);
        this.nodesHolder.addChild(p);
    }
    this.drawEdges();
  }

  drawEdges() {
    this.edgesHolder.clear();

    // TODO : This could be made more efficient maybe... no need to recalculate old nodes?

    // Extract all points from nodes
    const points = [];
    for (const d of this.foregroundDiamonds) {
        for (const p of d.points) {
            points.push({
                point: p,
                diamond: d,
                x: p.x,
                y: p.y,
            });
            p.clearPast();
            p.setColour(0x7ba0d9);
        }
    }
    const sortedPoints = _.sortBy(points, (n) => -n.y);
    const roots = [...points];

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
          if (node.point.isPast(potential.point)) {
            continue;
          }

          // Connect them!
          node.point.setPast(potential.point);

          // This is no longer a root
          const index = roots.indexOf(potential);
          if (index >= 0) {
            roots.splice(index, 1);
          }

          // Draw the line!
          this.edgesHolder
            .moveTo(node.x, node.y)
            .lineTo(potential.x, potential.y)
            .stroke();
        }
      }
    }

    // Recolour the root nodes
    for (const r of roots) {
      r.point.setColour(0xff0000);
    }
  }
}
