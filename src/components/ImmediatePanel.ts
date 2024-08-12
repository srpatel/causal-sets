import Font from "@/utils/Font";
import * as PIXI from "pixi.js";
import _ from "underscore";
import Board from "./Board";
import Node from "./Node";
import Colour from "@/utils/Colour";
import { Actions } from "pixi-actions";

export default class ImmediatePanel extends PIXI.Container {
  background: PIXI.Sprite;
  private lblDesc: PIXI.BitmapText;
  private lblMultiplier: PIXI.BitmapText;
  lblPoints: PIXI.BitmapText;
  target: number;
  highlightNodes: Set<Node> = new Set<Node>();
  points: number = 0;
  possibleTargets = _.shuffle([0, 1]);
  constructor(tutorial: boolean) {
    super();

    this.eventMode = "static";
    this.cursor = "pointer";

    this.target = tutorial ? 99999 : this.randomTarget();

    this.background = PIXI.Sprite.from("circle.png");
    this.background.anchor.set(0.5);
    this.background.tint = Colour.SPACETIME_BG;
    this.addChild(this.background);

    const sprite = PIXI.Sprite.from("edge.png");
    sprite.anchor.set(0.5);
    sprite.scale.set(-1, 1);
    sprite.tint = Colour.DARK;
    sprite.x = 25;
    sprite.y = 0;
    this.addChild(sprite);

    const lblCross = new PIXI.BitmapText({
      text: "x",
      style: {
        ...Font.makeFontOptions("big"),
        wordWrap: true,
        wordWrapWidth: 150,
      },
    });
    lblCross.anchor.set(0.5);
    lblCross.position.set(0, -4);
    lblCross.tint = Colour.DARK;
    this.addChild(lblCross);

    this.lblMultiplier = new PIXI.BitmapText({
      text: "0",
      style: {
        ...Font.makeFontOptions("big"),
        wordWrap: true,
        wordWrapWidth: 150,
      },
    });
    this.lblMultiplier.anchor.set(1, 0.5);
    this.lblMultiplier.position.set(-15, 0);
    this.lblMultiplier.tint = Colour.DARK;
    this.addChild(this.lblMultiplier);

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
    this.lblDesc.tint = Colour.DARK;
    this.lblDesc.visible = false;
    this.addChild(this.lblDesc);

    this.lblPoints = new PIXI.BitmapText({
      text: "0",
      style: Font.makeFontOptions("medium"),
    });
    this.lblPoints.anchor.set(0.5, 1);
    this.lblPoints.position.set(0, 150 / 2 + 15);
    this.lblPoints.tint = Colour.DARK;
    this.addChild(this.lblPoints);

    this.on("pointerenter", () => {
      this.lblDesc.visible = true;
      sprite.alpha = 0.2;
      lblCross.alpha = 0.2;
      this.lblMultiplier.alpha = 0.2;
    });
    this.on("pointerleave", () => {
      this.lblDesc.visible = false;
      sprite.alpha = 1;
      lblCross.alpha = 1;
      this.lblMultiplier.alpha = 1;
    });
  }

  updateText() {
    let text = "";
    if (this.target == 1) {
      text = `${this.target} new edge with a single tile`;
    } else if (this.target == 5) {
      text = `${this.target}+ new edges with a single tile`;
    } else {
      text = `${this.target} new edges with a single tile`;
    }
    if (this.target == 5) {
      this.lblMultiplier.text = "" + this.target + "+";
    } else {
      this.lblMultiplier.text = "" + this.target;
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
    if (this.target == num || (this.target <= num && this.target == 5)) {
      this.target = this.randomTarget();
      this.points += 3;
      this.lblPoints.text = "" + this.points;
      Actions.sequence(
        Actions.tintTo(this.background, 0x06aa22, 0.2),
        Actions.tintTo(this.background, Colour.SPACETIME_BG, 0.2),
        Actions.runFunc(() => {
          this.updateText();
        }),
      ).play();
      return true;
    }
    return false;
  }
}
