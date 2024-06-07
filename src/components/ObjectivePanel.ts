import Font from "@/utils/Font";
import * as PIXI from "pixi.js";
import _ from "underscore";
import Board from "./Board";
import Node from "./Node";

export default class ObjectivePanel extends PIXI.Container {
  private background: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  private lblDesc: PIXI.BitmapText;
  private lblPoints: PIXI.BitmapText;
  private type: number;
  highlightNodes: Set<Node> = new Set<Node>();
  points: number = 0;
  constructor(type: number) {
    super();

    this.type = type;

    this.background.anchor.set(0.5);
    this.background.width = 200;
    this.background.height = 150;
    this.addChild(this.background);

    let text = "";

    if (type == 0) {
      text = "+1 for each node in longest chain";
    } else if (type == 1) {
      text = "+1 for each connection to gold nodes";
    } else if (type == 2) {
      text = "+10 for each post";
    } else if (type == 3) {
      text = "+1 for each node in longest anti-chain (broken)";
    } else if (type == 4) {
      text = "+3 for each root node";
    }

    this.lblDesc = new PIXI.BitmapText({
      text,
      style: {
        ...Font.makeFontOptions("small"),
        wordWrap: true,
        wordWrapWidth: 150,
      },
    });
    this.lblDesc.anchor.set(0.5);
    this.lblDesc.position.set(0, 0);
    this.lblDesc.tint = 0;
    this.addChild(this.lblDesc);

    this.lblPoints = new PIXI.BitmapText({
      text: "",
      style: Font.makeFontOptions("tiny"),
    });
    this.lblPoints.anchor.set(0.5, 1);
    this.lblPoints.position.set(0, 150 / 2 - 10);
    this.lblPoints.tint = 0xcccccc;
    this.addChild(this.lblPoints);

    // fn to update/calc score?
  }

  calculate(board: Board) {
    if (this.type == 0) {
      // longest chain...
      let num = 0;
      this.highlightNodes.clear();
      for (const r of board.roots) {
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

          for (const adj of n.downConnections) {
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
            for (const adj of currentNode.upConnections) {
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
    } else if (this.type == 1) {
      // gold connections...
      let num = 0;
      this.highlightNodes.clear();
      for (const n of board.nodes) {
        if (n.type != "normal") {
          this.highlightNodes.add(n);
          num += n.upConnections.length + n.downConnections.length;
        }
      }
      this.points = num;
    } else if (this.type == 2) {
      // posts -- related to everything means "past" + "future" is all nodes
      let num = 0;
      this.highlightNodes.clear();
      for (const n of board.nodes) {
        const p = n.getPast();
        const f = n.getFuture();
        const isPost = 1 + p.size + f.size == board.nodes.length;
        if (isPost) {
          num += 10;
          this.highlightNodes.add(n);
        }
      }
      this.points = num;
    } else if (this.type == 3) {
      // anti-chain
      let antichain = 0;
      let antichainSource = null;
      for (const n of board.nodes) {
        const p = n.getPast();
        const f = n.getFuture();
        const antichainCurrent = board.nodes.length - (1 + p.size + f.size);
        if (antichainCurrent > antichain) {
          antichainSource = n;
          antichain = antichainCurrent;
        }
      }
      this.highlightNodes.clear();
      if (antichainSource) {
        this.highlightNodes.add(antichainSource);
        const p = antichainSource.getPast();
        const f = antichainSource.getFuture();
        for (const n of board.nodes) {
          if (n == antichainSource) continue;
          if (p.has(n)) continue;
          if (f.has(n)) continue;
          this.highlightNodes.add(n);
        }
      }
      this.points = this.highlightNodes.size;
    } else if (this.type == 4) {
      // roots
      let num = 0;
      this.highlightNodes.clear();
      for (const n of board.nodes) {
        if (n.upConnections.length == 0) {
            num += 1;
            this.highlightNodes.add(n);
        }
      }
      this.points = num * 3;
    }

    this.lblPoints.text = "" + this.points;
  }
}
