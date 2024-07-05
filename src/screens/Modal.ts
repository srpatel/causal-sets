import * as PIXI from "pixi.js";
import Screen from "./Screen";
import App from "@/App";
import Colour from "@/utils/Colour";

export default class Modal extends Screen {
  background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  panel: PIXI.NineSliceSprite;
  constructor() {
    super();

    // Background
    this.background.tint = 0;
    this.background.alpha = 0.72;
    this.background.eventMode = "static";
    this.background.on("pointerdown", () => {
      App.instance.popModal();
    });
    this.addChild(this.background);

    // Modal rectangle
    this.panel = new PIXI.NineSliceSprite(PIXI.Texture.from("roundedrect.png"));
    this.panel.tint = Colour.SPACETIME_BG;
    this.addChild(this.panel);
    this.panel.width = 650;
    this.panel.height = 950;
  }
  onSizeChanged() {
    this.background.position.set(0, 0);
    this.background.width = this.screenWidth;
    this.background.height = this.screenHeight;

    this.panel.x = (this.screenWidth - this.panel.width) / 2;
    this.panel.y = (this.screenHeight - this.panel.height) / 2;
  }
  onAddedToStage(stage: PIXI.Container) {}
  onRemovedFromStage(stage: PIXI.Container) {}
}
