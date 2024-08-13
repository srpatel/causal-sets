import * as PIXI from "pixi.js";
import Button from "@/components/Button";
import Modal from "./Modal";
import App from "@/App";
import MainScreen from "./MainScreen";
import Font from "@/utils/Font";
import Colour from "@/utils/Colour";
import Page from "./glossary/Page";

export default class AboutModal extends Modal {
  title: PIXI.BitmapText;
  subtitle1: PIXI.BitmapText;
  subtitle2: PIXI.BitmapText;
  undertitle: PIXI.BitmapText;
  pages: Page[] = [];
  currentPage: number = 0;
  circles: PIXI.Sprite[] = [];
  b1: Button;
  b2: Button;
  constructor() {
    super(true);

    // TODO : Allow swipe to change pages

    this.panel.eventMode = "static";
    this.panel.width = 400;
    this.panel.height = 450;

    this.undertitle = new PIXI.BitmapText({
      text: "[ Tap to close ]",
      style: {
        ...Font.makeFontOptions("medium"),
      },
    });
    this.undertitle.anchor.set(0.5);
    this.undertitle.tint = 0xffffff;
    this.addChild(this.undertitle);

    this.title = new PIXI.BitmapText({
      text: "CAUSETS",
      style: {
        ...Font.makeFontOptions("big"),
      },
    });
    this.title.anchor.set(0.5);
    this.title.tint = Colour.SPACETIME_BG;
    this.addChild(this.title);

    this.subtitle1 = new PIXI.BitmapText({
      text: "Causal Sets is a physical theory about the universe.\n \nFor more information:",
      style: {
        ...Font.makeFontOptions("small"),
        wordWrap: true,
        wordWrapWidth: 390,
      },
    });
    this.subtitle1.anchor.set(0.5);
    this.subtitle1.tint = Colour.SPACETIME_BG;
    this.addChild(this.subtitle1);

    this.subtitle2 = new PIXI.BitmapText({
      text: "Sponsored by the University of Edinburgh.",
      style: {
        ...Font.makeFontOptions("small"),
        wordWrap: true,
        wordWrapWidth: 390,
      },
    });
    this.subtitle2.anchor.set(0.5);
    this.subtitle2.tint = Colour.SPACETIME_BG;
    this.addChild(this.subtitle2);

    this.b1 = new Button("btnvideo", () => {});
    this.addChild(this.b1);

    this.b2 = new Button("btntutorial", () => {
      App.instance.popModal();
      App.instance.setScreen(new MainScreen(true));
    });
    this.addChild(this.b2);
  }

  onSizeChanged(): void {
    super.onSizeChanged();
    this.title.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + 50,
    );
    this.subtitle1.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + 50 + 100,
    );
    this.b1.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + 250,
    );
    this.b2.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + 330,
    );
    this.subtitle2.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + this.panel.height - 40,
    );

    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].position.set(
        this.panel.x + this.panel.width / 2,
        this.panel.y + this.panel.height / 2 - this.pages[i].height / 2,
      );
    }

    const gap = 35;
    for (let i = 0; i < this.circles.length; i++) {
      const c = this.circles[i];
      c.position.set(
        this.panel.x +
          this.panel.width / 2 -
          (gap * (this.circles.length - 1)) / 2 +
          gap * i,
        this.panel.y + this.panel.height - 40,
      );
    }

    this.undertitle.position.set(this.screenWidth / 2, this.screenHeight - 50);
  }
}
