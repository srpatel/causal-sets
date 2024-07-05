import * as PIXI from "pixi.js";
import Panel from "./Panel";
import Font from "@/utils/Font";
import Colour from "@/utils/Colour";

export default class MessagePanel extends PIXI.Container {
  constructor(message: string) {
    super();

    const panel = new Panel();
    panel.tint = Colour.SPACETIME_BG;
    const label = new PIXI.BitmapText({
      text: message,
      style: {
        ...Font.makeFontOptions("medium"),
        wordWrap: true,
        wordWrapWidth: 520,
      },
    });
    label.anchor.set(0.5);
    label.tint = Colour.DARK;

    panel.width = label.width + 40;
    panel.height = label.height + 45;
    label.position.set(panel.width / 2, panel.height / 2 - 5);

    this.addChild(panel);
    this.addChild(label);
  }
}
