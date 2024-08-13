import * as PIXI from "pixi.js";
import Font from "@/utils/Font";
import Colour from "@/utils/Colour";

export default class Definition extends PIXI.Container {
  lblName: PIXI.BitmapText;
  lblDesc: PIXI.BitmapText;
  icon: PIXI.Sprite;
  constructor(icon: string, name: string, description: string) {
    super();

    // Icon
    // Title
    // Description

    this.icon = PIXI.Sprite.from(icon);
    this.icon.anchor.set(0.5, 0);
    if (!icon.startsWith("glossary-") && !icon.startsWith("node-")) {
      this.icon.tint = Colour.SPACETIME_BG;
    }
    this.addChild(this.icon);

    this.lblName = new PIXI.BitmapText({
      text: name,
      style: {
        ...Font.makeFontOptions("medium", "left"),
      },
    });
    this.lblName.anchor.set(0, 0);
    this.lblName.tint = Colour.SPACETIME_BG;
    this.addChild(this.lblName);

    this.lblDesc = new PIXI.BitmapText({
      text: description,
      style: {
        ...Font.makeFontOptions("small", "left"),
        wordWrap: true,
        wordWrapWidth: 334,
      },
    });
    this.lblDesc.anchor.set(0, 0);
    this.lblDesc.tint = Colour.SPACETIME_BG;
    this.addChild(this.lblDesc);

    // Width should be 500
    this.icon.position.set(83, 5);
    this.lblName.position.set(166, -10);
    this.lblDesc.position.set(166, 30);
  }
}
