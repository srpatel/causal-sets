import * as PIXI from "pixi.js";
import _ from "underscore";
import Diamond from "@/components/Diamond";
import Node from "@/components/Node";
import Colour from "@/utils/Colour";
import { Actions } from "pixi-actions";
import Edge from "./Edge";

export default class Board extends PIXI.Container {
  dimension: number;
  private backgroundDiamonds: Diamond[] = [];
  private background: PIXI.Container = new PIXI.Container();
  foregroundDiamonds: Diamond[] = [];
  private potentialDiamond: Diamond = new Diamond({ isBackground: false });
  nodes: Node[] = [];
  roots: Node[] = [];
  edges: Edge[] = [];
  private foreground: PIXI.Container = new PIXI.Container();
  private nodesHolder: PIXI.Container = new PIXI.Container();
  private onClickBackgroundDiamond: (d: Diamond) => void;
  boardShapeGraphic = new PIXI.Graphics();
  edgesHolder = new PIXI.Container();
  coneHolder = new PIXI.Container();
  coneGraphics = new PIXI.Graphics();
  previousEdges: [Node, Node][] = [];
  constructor(
    dimension: number,
    onClickBackgroundDiamond: (d: Diamond) => void,
  ) {
    super();

    this.dimension = dimension;
    this.onClickBackgroundDiamond = onClickBackgroundDiamond;

    this.addChild(this.background);
    this.addChild(this.foreground);
    this.addChild(this.edgesHolder);
    this.addChild(this.nodesHolder);

    this.coneHolder.addChild(this.coneGraphics);
    this.coneGraphics.setFillStyle({ color: 0xffffff, alpha: 0.4 });
    this.addChild(this.coneHolder);

    const points = [
      -Diamond.WIDTH * this.dimension,
      0,
      0,
      -Diamond.HEIGHT * this.dimension,
      Diamond.WIDTH * this.dimension,
      0,
      0,
      Diamond.HEIGHT * this.dimension,
      -Diamond.WIDTH * this.dimension,
      0,
    ];
    this.boardShapeGraphic.poly(points).fill(0xffffff);
    this.addChild(this.boardShapeGraphic);
    this.coneHolder.mask = this.boardShapeGraphic;

    // Draw a bunch of diamonds to make the board
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
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
          d.alpha = 0.2;
          this.potentialDiamond.position.set(d.x, d.y);
          this.potentialDiamond.visible = true;
        });
        d.on("pointerleave", () => {
          d.alpha = 0.2;
          this.potentialDiamond.position.set(d.x, d.y);
          this.potentialDiamond.visible = false;
        });

        // Place the

        // Click to place the selected diamond here...
        d.on("pointerdown", () => {
          if (this.onClickBackgroundDiamond) this.onClickBackgroundDiamond(d);
        });
      }
    }

    this.potentialDiamond.alpha = 0.5;
    this.background.addChild(this.potentialDiamond);
    this.potentialDiamond.visible = false;
  }

  setPotential(diamond: Diamond) {
    this.potentialDiamond.copyNodes(diamond);
  }

  positionDiamond(diamond: Diamond) {
    let x =
      (diamond.coords[0] + diamond.coords[1] - (this.dimension - 1)) *
      Diamond.WIDTH;
    let y = (diamond.coords[0] - diamond.coords[1]) * Diamond.HEIGHT;
    diamond.position.set(x, y);
  }

  airDropBlanks() {
    let decalation = 0;
    const dropDistance = 40;
    // For every coord without a tile, create a blank tile and airdrop it in
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        let found = false;
        for (const d of this.foregroundDiamonds) {
          if (d.coords[0] == i && d.coords[1] == j) {
            found = true;
            break;
          }
        }
        if (!found) {
          const d = new Diamond({ isBackground: false });
          d.coords = [i, j];
          this.addDiamond(d);
          d.alpha = 0;
          d.position.y -= dropDistance;
          Actions.sequence(
            Actions.delay(decalation++ * 0.2),
            Actions.parallel(
              Actions.fadeIn(d, 0.4),
              Actions.moveTo(d, d.x, d.y + dropDistance, 0.4),
            ),
          ).play();
        }
      }
    }
  }

  addDiamond(diamond: Diamond, andRecalculate: boolean = true) {
    for (const d of this.foregroundDiamonds) {
      if (
        d.coords[0] == diamond.coords[0] &&
        d.coords[1] == diamond.coords[1]
      ) {
        return { didAdd: false, numNewEdges: 0 };
      }
    }

    this.foregroundDiamonds.push(diamond);
    this.foreground.addChild(diamond);
    this.positionDiamond(diamond);
    for (const p of diamond.points) {
      p.x += diamond.x;
      p.y += diamond.y;
      this.nodes.push(p);
      this.nodesHolder.addChild(p);

      p.cursor = "pointer";
      p.eventMode = "static";
      p.on("pointerenter", () => {
        this.setConeForNode(p);
      });
      p.on("pointerleave", () => {
        this.setConeForNode(null);
      });
    }

    if (!andRecalculate) {
      return { didAdd: true, numNewEdges: 0 };
    }

    const numNewEdges = this.drawEdges();

    // Update scoring of nodes!
    for (const node of this.nodes) {
      if (node.type == "normal") {
        continue;
      }
      node.scoring = false;
      if (node.type == "maximal") {
        node.scoring = node.upConnections.length == 0;
      } else if (node.type == "minimal") {
        node.scoring = node.downConnections.length == 0;
      } else if (node.type == "post") {
        const p = node.getPast();
        const f = node.getFuture();
        node.scoring = 1 + p.size + f.size == this.nodes.length;
      } else if (node.type == "five") {
        node.scoring = node.numConnections() >= 4;
      } else if (node.type == "two") {
        node.scoring = node.numConnections() == 2;
      } else if (node.type == "chain") {
        // ??? part of a longest chain?
      }
    }
    return { didAdd: true, numNewEdges };
  }

  setConeForNode(n: Node) {
    if (!n) {
      this.coneHolder.visible = false;
      for (const o of this.nodes) {
        o.alpha = 1;
      }
      for (const o of this.edges) {
        o.alpha = 1;
      }
      return;
    }
    this.coneHolder.visible = true;
    this.coneGraphics.clear();

    // Draw the cone from this node!
    const d = 500;
    const points1 = [n.x, n.y, n.x + d, n.y - d, n.x - d, n.y - d, n.x, n.y];
    const poly1 = new PIXI.Polygon(points1);
    this.coneGraphics.poly(points1).fill();
    const points2 = [n.x, n.y, n.x + d, n.y + d, n.x - d, n.y + d, n.x, n.y];
    const poly2 = new PIXI.Polygon(points2);
    this.coneGraphics.poly(points2).fill();

    // All nodes are opaque iff they are in one of the cones
    for (const o of this.nodes) {
      o.alpha =
        o == n || poly1.contains(o.x, o.y) || poly2.contains(o.x, o.y)
          ? 1
          : 0.2;
    }
    for (const o of this.edges) {
      o.alpha =
        (o.from == n ||
          poly1.contains(o.from.x, o.from.y) ||
          poly2.contains(o.from.x, o.from.y)) &&
        (o.to == n ||
          poly1.contains(o.to.x, o.to.y) ||
          poly2.contains(o.to.x, o.to.y))
          ? 1
          : 0.2;
    }
  }

  drawEdges() {
    const currentEdges: [Node, Node][] = [];
    let numNew = 0;
    this.edgesHolder.removeChildren();
    this.roots = [];
    this.edges = [];

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
        p.reset();
        //p.setColour(0x7ba0d9);
      }
    }
    // topological sort
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

          // This is no longer a root
          const index = roots.indexOf(potential);
          if (index >= 0) {
            roots.splice(index, 1);
          }

          // Draw the line!
          const edge = new Edge(node.point, potential.point);
          this.edges.push(edge);
          this.edgesHolder.addChild(edge);
          node.point.downConnections.push(potential.point);
          potential.point.upConnections.push(node.point);
          let found = false;
          for (const p of this.previousEdges) {
            if (p[0] == node.point && p[1] == potential.point) {
              found = true;
              break;
            }
          }
          if (!found) {
            numNew++;
          }
          currentEdges.push([node.point, potential.point]);
        }
      }
    }

    // Root nodes
    for (const r of roots) {
      this.roots.push(r.point);
    }
    this.previousEdges = currentEdges;
    return numNew;
  }
}
