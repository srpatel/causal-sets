import Font from "@/utils/Font";
import * as PIXI from "pixi.js";
import _ from "underscore";
import Board from "./Board";
import Node from "./Node";
import Colour from "@/utils/Colour";
import { Actions } from "pixi-actions";

export default class ImmediatePanel extends PIXI.Container {
  private background: PIXI.Sprite;
  private lblDesc: PIXI.BitmapText;
  private lblPoints: PIXI.BitmapText;
  target: number;
  highlightNodes: Set<Node> = new Set<Node>();
  points: number = 0;
  possibleTargets = _.shuffle([0, 1]);
  constructor() {
    super();

    this.target = this.randomTarget();

    this.background = PIXI.Sprite.from("circle.png");
    this.background.anchor.set(0.5);
    this.background.tint = Colour.SPACETIME_BG;
    this.addChild(this.background);

    this.lblDesc = new PIXI.BitmapText({
      text: "",
      style: {
        ...Font.makeFontOptions("small"),
        wordWrap: true,
        wordWrapWidth: 150,
      },
    });
    this.updateText();
    this.lblDesc.anchor.set(0.5);
    this.lblDesc.position.set(0, -30);
    this.lblDesc.tint = Colour.DARK;
    this.addChild(this.lblDesc);

    this.lblPoints = new PIXI.BitmapText({
      text: "0",
      style: Font.makeFontOptions("medium"),
    });
    this.lblPoints.anchor.set(0.5, 1);
    this.lblPoints.position.set(0, 150 / 2 - 10);
    this.lblPoints.tint = Colour.DARK;
    this.addChild(this.lblPoints);
  }

  updateText() {
    let text = "";
    if (this.target == 1) {
      text = `${this.target} new edge with a single tile:\n+5`;
    } else if (this.target == 5) {
      text = `${this.target}+ new edges with a single tile:\n+5`;
    } else {
      text = `${this.target} new edges with a single tile:\n+5`;
    }
    this.lblDesc.text = text;
  }

  randomTarget() {
    if (this.possibleTargets.length == 0) {
      this.possibleTargets = _.shuffle([2, 3, 4, 5]);
    }
    return this.possibleTargets.pop();
  }

  madeConnections(num: number) {
    if (this.target == num || (this.target > num && this.target == 5)) {
      this.target = this.randomTarget();
      this.updateText();
      this.points += 5;
      this.lblPoints.text = "" + this.points;
      Actions.sequence(
        Actions.tintTo(this.background, 0x06aa22, 0.2),
        Actions.tintTo(this.background, Colour.SPACETIME_BG, 0.2),
      ).play();
    }
  }
}
