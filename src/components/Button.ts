import * as PIXI from "pixi.js";

export default class Button extends PIXI.Container {
  private foreground: PIXI.Sprite;
  private background: PIXI.Sprite;
  handleClick: () => void;
  constructor(textureName: string, onclick: () => void) {
    super();
    
    this.handleClick = onclick;

    // Make a label!

    // Background
    this.foreground = PIXI.Sprite.from(textureName + ".png");

    // Shadow
    if (textureName.endsWith("small")) {
      this.background = PIXI.Sprite.from("btnbgsmall.png");
    } else {
      this.background = PIXI.Sprite.from("btnbg.png");
    }

    this.addChild(this.background);
    this.addChild(this.foreground);

    this.release();
    this.background.position.set(
      -this.foreground.width / 2,
      -this.foreground.height / 2 + this.background.height / 5
    );

    const ee = this as any;
    ee.interactive = true;
    ee.buttonMode = true;
    ee.cursor = "pointer";
    ee.on("pointerdown", this.press.bind(this));
    const onRelease = this.release.bind(this);
    ee.on("pointerup", onRelease);
    ee.on("pointerupoutside", onRelease);
    ee.on("pointertap", this.onClick.bind(this));
  }

  onClick() {
    if (this.handleClick) {
      this.handleClick();
    }
  }

  press() {
    this.foreground.position.set(
      -this.foreground.width / 2,
      -this.foreground.height / 2 + this.background.height / 5 - 5
    );
  }
  release() {
    this.foreground.position.set(
      -this.foreground.width / 2,
      -this.foreground.height / 2
    );
  }
}
