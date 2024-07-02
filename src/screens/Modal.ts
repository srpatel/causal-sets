import * as PIXI from "pixi.js";
import Screen from "./Screen";
import App from "@/App";

export default class Modal extends Screen {
  background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  constructor() {
    super();

    // Background
    this.background.tint = 0;
    this.background.alpha = 0.8;
    this.background.eventMode = "static";
    this.background.on("pointerdown", () => {
      App.instance.popModal();
    });
    this.addChild(this.background);

    // Modal rectangle
  }
  onSizeChanged() {
    this.background.position.set(0, 0);
    this.background.width = this.screenWidth;
    this.background.height = this.screenHeight;
  }
  onAddedToStage(stage: PIXI.Container) {}
  onRemovedFromStage(stage: PIXI.Container) {}
}
