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
  definitions: Definition[] = [];
  pages: Page[] = [];
  constructor() {
    super(true);

    this.panel.width = 550;
    this.panel.height = 780;

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
      const definition = new Definition(
        "objective-antichain.png",
        "Anti-chain",
        "A collection of nodes where no two nodes are connected by an edge or a chain.",
      );
      this.definitions.push(definition);
    }
    {
      const definition = new Definition(
        "objective-chain.png",
        "Chain",
        "A sequence of nodes connected by edges, like a chain of beads on a string.",
      );
      this.definitions.push(definition);
    }
    {
      const definition = new Definition(
        "glossary-lightcone.png",
        "Light-cone",
        "Light-cones are the rectangular regions above and below each node. Edges are always drawn within the light-cones and never cross light-cone boundaries.",
      );
      this.definitions.push(definition);
    }
    {
      const definition = new Definition(
        "node-maximal.png",
        "Maximal node",
        "A node that has no upward edges emanating from it.",
      );
      this.definitions.push(definition);
    }
    {
      const definition = new Definition(
        "node-minimal.png",
        "Minimal node",
        "A node that has no downward edges emanating from it.",
      );
      this.definitions.push(definition);
    }
    {
      const definition = new Definition(
        "glossary-past.png",
        "Past node",
        "A node in the lower light-cone.",
      );
      this.definitions.push(definition);
    }
    {
      const definition = new Definition(
        "glossary-future.png",
        "Future node",
        "A node in the upper light-cone.",
      );
      this.definitions.push(definition);
    }

    // 1. Turn definitions into pages (3 defs per page)
    // 2. Add pages to the screen
    // 3. Add page icons at the bottom of the screen
    let current = [];
    for (const d of this.definitions) {
      current.push(d);
      if (
        current.length == 3 ||
        d == this.definitions[this.definitions.length - 1]
      ) {
        const page = new Page([...current]);
        this.addChild(page);
        this.pages.push(page);
        current = [];
      }
    }
  }

  onSizeChanged(): void {
    super.onSizeChanged();
    this.title.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + 50,
    );

    for (let i = 0; i < this.pages.length; i++) {
      this.pages[i].position.set(
        this.panel.x + this.panel.width / 2 + i * this.panel.width,
        this.panel.y + 100,
      );
    }
  }
}
