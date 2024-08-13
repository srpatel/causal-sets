import * as PIXI from "pixi.js";
import Button from "@/components/Button";
import Modal from "./Modal";
import App from "@/App";
import MainScreen from "./MainScreen";
import Font from "@/utils/Font";
import Colour from "@/utils/Colour";
import Board from "@/components/Board";
import { Actions } from "pixi-actions";
import Definition from "./glossary/Definition";
import Page from "./glossary/Page";

export default class GlossaryModal extends Modal {
  title: PIXI.BitmapText;
  subtitle: PIXI.BitmapText;
  pages: Page[] = [];
  currentPage: number = 0;
  circles: PIXI.Sprite[] = [];
  constructor() {
    super(true);

    // TODO : Allow swipe to change pages

    this.panel.eventMode = "static";
    this.panel.width = 550;
    this.panel.height = 780;

    this.subtitle = new PIXI.BitmapText({
      text: "[ Tap to close ]",
      style: {
        ...Font.makeFontOptions("medium"),
        wordWrap: true,
        wordWrapWidth: 520,
      },
    });
    this.subtitle.anchor.set(0.5);
    this.subtitle.tint = 0xffffff;
    this.addChild(this.subtitle);

    this.title = new PIXI.BitmapText({
      text: "GLOSSARY",
      style: {
        ...Font.makeFontOptions("big"),
      },
    });
    this.title.anchor.set(0.5);
    this.title.tint = Colour.SPACETIME_BG;
    this.addChild(this.title);

    // Add 4 definitions
    {
      // Page 1
      const defns = [
        new Definition(
          "glossary-lightcone.png",
          "Light-cone",
          "Light-cones are the rectangular regions above and below each node. Edges are always drawn within the light-cones and never cross light-cone boundaries.",
        ),
        new Definition(
          "glossary-chain.png",
          "Chain",
          "A sequence of nodes connected by edges, like a chain of beads on a string.",
        ),
        new Definition(
          "glossary-antichain.png",
          "Anti-chain",
          "A collection of nodes where no two nodes are connected by an edge or a chain.",
        ),
      ];
      const page = new Page(defns);
      this.addChild(page);
      this.pages.push(page);
    }
    {
      // Page 2
      const defns = [
        new Definition(
          "glossary-maximal.png",
          "Maximal node",
          "A node that has no upward edges emanating from it.",
        ),
        new Definition(
          "glossary-minimal.png",
          "Minimal node",
          "A node that has no downward edges emanating from it.",
        ),
        new Definition(
          "glossary-past.png",
          "Past node",
          "A node in the lower light-cone.",
        ),
        new Definition(
          "glossary-future.png",
          "Future node",
          "A node in the upper light-cone.",
        ),
      ];
      const page = new Page(defns);
      this.addChild(page);
      this.pages.push(page);
    }

    // Add a circle for each page!
    for (let i = 0; i < this.pages.length; i++) {
      const circle = PIXI.Sprite.from("coins-1.png");
      circle.anchor.set(0.5);
      circle.scale.set(0.8);
      circle.tint = Colour.SPACETIME_BG;
      circle.alpha = i == this.currentPage ? 1 : 0.2;
      this.addChild(circle);
      this.circles.push(circle);

      circle.eventMode = "static";
      circle.on("pointerdown", () => {
        this.setPage(i);
      });

      this.pages[i].alpha = this.currentPage == i ? 1 : 0;
    }
  }

  setPage(p: number) {
    if (this.currentPage == p) return;

    for (let i = 0; i < this.circles.length; i++) {
      this.circles[i].alpha = i == p ? 1 : 0.2;
    }

    const oldPage = this.pages[this.currentPage];
    const newPage = this.pages[p];

    // Fade out this page, and move to the left/right
    const dx = p < this.currentPage ? this.panel.width : -this.panel.width;
    Actions.parallel(
      Actions.fadeOut(oldPage, 0.2),
      Actions.moveTo(
        oldPage,
        this.panel.x + this.panel.width / 2 + dx,
        this.panel.y + this.panel.height / 2 - oldPage.height / 2,
        0.2,
      ),
    ).play();
    newPage.x = this.panel.x + this.panel.width / 2 - dx;
    newPage.y = this.panel.y + this.panel.height / 2 - newPage.height / 2;
    Actions.parallel(
      Actions.fadeIn(newPage, 0.2),
      Actions.moveTo(
        newPage,
        this.panel.x + this.panel.width / 2,
        this.panel.y + this.panel.height / 2 - newPage.height / 2,
        0.2,
      ),
    ).play();

    this.currentPage = p;
  }

  onSizeChanged(): void {
    super.onSizeChanged();
    this.title.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + 50,
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

    this.subtitle.position.set(this.screenWidth / 2, this.screenHeight - 50);
  }
}
