import Font from "@/utils/Font";
import * as PIXI from "pixi.js";
import _ from "underscore";

export default class ObjectivePanel extends PIXI.Container {
  private background: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  private lblDesc: PIXI.BitmapText;
  private lblPoints: PIXI.BitmapText;
  constructor(type: number) {
    super();

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
      text: "0",
      style: Font.makeFontOptions("tiny"),
    });
    this.lblPoints.anchor.set(0.5, 1);
    this.lblPoints.position.set(0, 150 / 2 - 10);
    this.lblPoints.tint = 0xcccccc;
    this.addChild(this.lblPoints);

    // fn to update/calc score?
  }
}
