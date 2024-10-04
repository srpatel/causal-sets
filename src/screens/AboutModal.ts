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
  moretitle: PIXI.BitmapText;
  subtitle1: PIXI.BitmapText;
  subtitle2: PIXI.BitmapText;
  undertitle: PIXI.BitmapText;
  pages: Page[] = [];
  currentPage: number = 0;
  circles: PIXI.Sprite[] = [];
  btnrow: Button[] = [];
  b2: Button;
  subpanel: PIXI.NineSliceSprite;
  constructor() {
    super(true);

    // TODO : Allow swipe to change pages

    this.panel.eventMode = "static";
    this.panel.width = 700;
    this.panel.height = 700;

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
      text: "Causal Set Theory is a physical theory which aims to explain what we see in our Universe. It tackles the problem of explaining how gravity behaves at all scales down to 10^-33cm, a million billion billion times smaller than the size of an atom. The theory's premise is that, at this unimaginably small scale, space and time themselves are made of a special kind of \"atoms\" - a smallest building block that cannot be reduced further. In this game, the atoms of spacetime are the dots you place on the grid. The way these atoms are connected tells us about causality: Can one point in spacetime influence another? Can light travel from one point to the next? It's the answers to these questions that tell us how our Universe began or whether it contains any Black Holes! We hope you have fun exploring this fantastic idea in this game.",
      style: {
        ...Font.makeFontOptions("small"),
        wordWrap: true,
        wordWrapWidth: 650,
      },
    });
    this.subtitle1.anchor.set(0.5);
    this.subtitle1.tint = Colour.SPACETIME_BG;
    this.addChild(this.subtitle1);

    this.moretitle = new PIXI.BitmapText({
      text: "Want to find out more?",
      style: {
        ...Font.makeFontOptions("medium"),
      },
    });
    this.moretitle.anchor.set(0.5);
    this.moretitle.tint = Colour.SPACETIME_BG;
    this.addChild(this.moretitle);

    this.subpanel = new PIXI.NineSliceSprite(
      PIXI.Texture.from("roundedrect.png"),
    );
    this.subpanel.tint = Colour.DARK;
    this.addChild(this.subpanel);
    this.subpanel.width = 700;
    this.subpanel.height = 100;

    this.subtitle2 = new PIXI.BitmapText({
      text: 'This game was commissioned by scientists at Imperial College London and the University of Edinburgh and funded by the STFC as part of the "Quantum Software for a Digital Universe" project.',
      style: {
        ...Font.makeFontOptions("small"),
        wordWrap: true,
        wordWrapWidth: 650,
      },
    });
    this.subtitle2.anchor.set(0.5);
    this.subtitle2.tint = Colour.SPACETIME_BG;
    this.addChild(this.subtitle2);

    {
      const b = new Button("btnytsmall", () => {
        // Fay Dowker lecture
        window.open("https://www.youtube.com/watch?v=VhHE86d-Th8", "_blank");
      });
      this.addChild(b);
      this.btnrow.push(b);
    }
    {
      const b = new Button("btnytsmall", () => {
        // Fay Dowker on podcast
        window.open(
          "https://youtu.be/M-g-CtFkZc4?si=9L2UlSaoiMSUtY_9",
          "_blank",
        );
      });
      this.addChild(b);
      this.btnrow.push(b);
    }
    {
      const b = new Button("btnytsmall", () => {
        // Nat video
        window.open("https://www.youtube.com/watch?v=SgWtprobBMM", "_blank");
      });
      this.addChild(b);
      this.btnrow.push(b);
    }
    {
      const b = new Button("btnpostersmall", () => {
        // Poster
        window.open("Salam_poster.pdf", "_blank");
      });
      this.addChild(b);
      this.btnrow.push(b);
    }

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
      this.panel.y + 50 + 200,
    );
    this.moretitle.position.set(
      this.panel.x + this.panel.width / 2,
      this.subtitle1.y + this.subtitle1.height / 2 + 60,
    );

    for (let i = 0; i < this.btnrow.length; i++) {
      const b = this.btnrow[i];
      b.position.set(
        this.panel.x +
          this.panel.width / 2 +
          i * 95 -
          (95 * (this.btnrow.length - 1)) / 2,
        this.panel.y + this.panel.height - 170,
      );
    }
    this.b2.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + this.panel.height - 60,
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

    this.subpanel.position.set(
      this.panel.x,
      this.panel.y + this.panel.height + 20,
    );
    this.subtitle2.position.set(
      this.subpanel.x + this.subpanel.width / 2,
      this.subpanel.y + this.subpanel.height / 2 - 4,
    );
  }
}
