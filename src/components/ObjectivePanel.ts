import Font from "@/utils/Font";
import * as PIXI from "pixi.js";
import _ from "underscore";
import Board from "./Board";
import Node from "./Node";
import Colour from "@/utils/Colour";

type ObjectiveType =
  | "longest-chain"
  | "longest-antichain"
  | "most-edges"
  | "most-antiedges"
  | "one-past"
  | "one-future"
  | "none";

export function getRandomObjective() {
  const possibles: ObjectiveType[] = [
    "longest-chain",
    "longest-antichain",
    "most-edges",
    "most-antiedges",
    "one-past",
    "one-future",
  ];
  return _.sample(possibles);
}

export default class ObjectivePanel extends PIXI.Container {
  private background: PIXI.Sprite;
  private lblDesc: PIXI.BitmapText;
  private lblPoints: PIXI.BitmapText;
  private sprite: PIXI.Sprite;
  type: ObjectiveType;
  highlightNodes: Set<Node> = new Set<Node>();
  points: number = 0;
  constructor(type: ObjectiveType) {
    super();

    this.eventMode = "static";
    this.cursor = "pointer";

    this.type = type;

    this.background = PIXI.Sprite.from("circle.png");
    this.background.anchor.set(0.5);
    this.background.tint = Colour.SPACETIME_BG;
    this.addChild(this.background);

    let text = "";
    let spriteName = null;
    if (type == "longest-chain") {
      text = "+1 for each node in longest chain";
      spriteName = "objective-chain";
    } else if (type == "longest-antichain") {
      text = "+1 for each node in longest anti-chain";
      spriteName = "objective-antichain";
    } else if (type == "most-edges") {
      text = "+1 for each edge from node with most edges";
      spriteName = "objective-edges";
    } else if (type == "most-antiedges") {
      text = "+1 for each anti-edge from node with most anti-edges";
      spriteName = "objective-antiedges";
    } else if (type == "one-past") {
      text = "+1 for each node with exactly one past node";
      spriteName = "objective-onepast";
    } else if (type == "one-future") {
      text = "+1 for each node with exactly one future node";
      spriteName = "objective-onefuture";
    }

    const sprite = PIXI.Sprite.from(spriteName + ".png");
    this.sprite = sprite;
    sprite.tint = Colour.DARK;
    sprite.anchor.set(0.5);
    sprite.scale.set(0.8);
    sprite.y = -15;
    this.addChild(sprite);

    this.lblDesc = new PIXI.BitmapText({
      text,
      style: {
        ...Font.makeFontOptions("small"),
        wordWrap: true,
        wordWrapWidth: 150,
      },
    });
    this.lblDesc.anchor.set(0.5);
    this.lblDesc.position.set(0, -15);
    this.lblDesc.tint = Colour.DARK;
    this.lblDesc.visible = false;
    this.addChild(this.lblDesc);

    this.lblPoints = new PIXI.BitmapText({
      text: "",
      style: Font.makeFontOptions("medium"),
    });
    this.lblPoints.anchor.set(0.5, 1);
    this.lblPoints.position.set(0, 150 / 2 + 15);
    this.lblPoints.tint = Colour.DARK;
    this.addChild(this.lblPoints);

    this.on("pointerenter", () => {
      this.lblDesc.visible = true;
      if (this.sprite) {
        this.sprite.alpha = 0.2;
      }
    });
    this.on("pointerleave", () => {
      this.lblDesc.visible = false;
      if (this.sprite) {
        this.sprite.alpha = 1;
      }
    });
  }

  calculate(board: Board) {
    if (this.type == "longest-chain" || this.type == "longest-antichain") {
      // longest chain...
      let num = 0;
      this.highlightNodes.clear();
      const roots =
        this.type == "longest-chain" ? board.roots : board.antiroots;
      for (const r of roots) {
        // Starting at each root node, find the longest chain!
        const distances: Map<Node, number> = new Map();
        for (const n of board.nodes) {
          distances.set(n, -Infinity);
        }
        distances.set(r, 1);

        const stack: Node[] = [];
        stack.push(r);

        while (stack.length > 0) {
          const n = stack.shift();
          const dist = distances.get(n);

          if (dist == -Infinity) continue;

          const connections =
            this.type == "longest-chain"
              ? n.downConnections
              : n.rightConnections;
          for (const adj of connections) {
            const currentDist = distances.get(adj);
            const proposedDist = dist + 1;
            if (proposedDist > currentDist) {
              distances.set(adj, proposedDist);
            }
            stack.push(adj);
          }
        }

        // Maximal distance
        let maxDist = 0;
        let maxRoot = null;
        for (const [node, distance] of distances.entries()) {
          if (distance > maxDist) {
            maxDist = distance;
            maxRoot = node;
          }
        }
        if (maxDist > num) {
          this.highlightNodes.clear();

          let currentDist = maxDist;
          let currentNode = maxRoot;
          while (currentDist > 0) {
            this.highlightNodes.add(currentNode);
            currentDist--;
            const connections =
              this.type == "longest-chain"
                ? currentNode.upConnections
                : currentNode.leftConnections;
            for (const adj of connections) {
              if (distances.get(adj) == currentDist) {
                currentNode = adj;
                break;
              }
            }
          }
          num = maxDist;
        }
      }
      this.points = num;
    } else if (this.type == "one-future") {
      let num = 0;
      this.highlightNodes.clear();
      for (const n of board.nodes) {
        const f = n.getFuture();
        if (f.size == 1) {
          num += 1;
          this.highlightNodes.add(n);
        }
      }
      this.points = num;
    } else if (this.type == "one-past") {
      let num = 0;
      this.highlightNodes.clear();
      for (const n of board.nodes) {
        const f = n.getPast();
        if (f.size == 1) {
          num += 1;
          this.highlightNodes.add(n);
        }
      }
      this.points = num;
    } else if (this.type == "most-edges" || this.type == "most-antiedges") {
      // node with most connections
      let numConnections = 0;
      let node = null;
      for (const n of board.nodes) {
        const num = n.upConnections.length + n.downConnections.length;
        const antinum = n.leftConnections.length + n.rightConnections.length;
        const actualNum = this.type == "most-edges" ? num : antinum;
        if (actualNum > numConnections) {
          numConnections = actualNum;
          node = n;
        }
      }
      this.highlightNodes.clear();
      this.highlightNodes.add(node);
      this.points = numConnections;
    }

    this.lblPoints.text = "" + this.points;
  }
}
