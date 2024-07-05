import * as PIXI from "pixi.js";

export default class Panel extends PIXI.NineSliceSprite {
  constructor() {
    super(PIXI.Texture.from("roundedrect.png"));
  }
}
