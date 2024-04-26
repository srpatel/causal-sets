import * as PIXI from "pixi.js";
import _ from "underscore";

export default class ObjectivePanel extends PIXI.Container {
  private background: PIXI.Sprite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  constructor() {
    super();

    this.background.anchor.set(0.5);
    this.background.width = 200;
    this.background.height = 150;
    this.addChild(this.background);

    // TODO: Add text inside explaining...
    // ...

    // TODO: Add small text at the bottom for the current score
    // ...
  }
}
