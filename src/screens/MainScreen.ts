import * as PIXI from "pixi.js";
import _ from "underscore";
import { Actions } from "pixi-actions";

import App from "@/App";
import Screen from "@screens/Screen";
import Spacetime from "@/components/Spacetime";
import Diamond from "@/components/Diamond";
import Board from "@/components/Board";
import ObjectivePanel from "@/components/ObjectivePanel";

export default class MainScreen extends Screen {
  private diamonds: Diamond[] = [null, null, null, null];
  private highlighter: Diamond = new Diamond({ isBackground: false });
  private selectedDiamond: Diamond = null;
  private deck: Diamond[] = [];
  private objectivePanels: ObjectivePanel[] = [];
  private board: Board;
  constructor() {
    super();

    this.board = new Board(4, (d: Diamond) => {
      if (this.selectedDiamond) {
        const index = this.diamonds.indexOf(this.selectedDiamond);
        this.diamonds[index] = null;
        // Remove event listener...
        this.selectedDiamond.removeAllListeners();

        // Draw a new diamond from the deck
        const newd = this.drawDiamond(index);
        newd.position.set(this.selectedDiamond.x, this.selectedDiamond.y);

        // Place this diamond ontop of the board in the right place.
        // TODO : Don't allow placing where there is already a diamond
        this.selectedDiamond.position.set(d.x, d.y);
        this.selectedDiamond.coords = [...d.coords];
        this.board.addDiamond(this.selectedDiamond);
        this.selectedDiamond = null;
        this.updateSelectedDiamond();

        // TODO : Update score?
      }
    });

    this.addChild(this.highlighter);
    this.highlighter.tint = 0xff0000;
    this.highlighter.scale.set(1.2);
    this.highlighter.visible = false;

    const deckSize = this.board.dimension * this.board.dimension + 4;
    for (let i = 0; i < deckSize; i++) {
      const d = new Diamond({ isBackground: false });
      if (i < 6) {
        // Scoring diamond, one of four types
        d.scoringPoint(i);
      } else {
        // Normal diamond
        d.sprinklePoints(1 + Math.floor(Math.random() * 3));
      }
      this.deck.push(d);
    }
    this.deck = _.shuffle(this.deck);

    // Draw four diamonds which are our next pieces (one in each corner, pre-filled with dots)
    for (let i = 0; i < 4; i++) {
      this.drawDiamond(i);
    }

    // Add three/four scoring panels
    // - 1pt per node in longest chain (hover over scoring panel to see longest chain)
    // - 1pt for each connection to (gold) (hover to see golds + connections)
    // - 10pt for each post (hover over scoring panel to see the posts)
    // - 3pt for each root node (hover to see)
    this.objectivePanels.push(new ObjectivePanel());
    this.objectivePanels.push(new ObjectivePanel());
    this.objectivePanels.push(new ObjectivePanel());
    this.objectivePanels.push(new ObjectivePanel());
    for (const o of this.objectivePanels)
      this.addChild(o)
    // Update scoring recalculates all of them.

    this.addChild(this.board);
  }

  private drawDiamond(pos: number) {
    const d = this.deck.pop();
    this.diamonds[pos] = d;
    d.eventMode = "static";
    d.cursor = "pointer";

    this.addChild(d);

    // Click the diamond to select it
    d.on("pointerdown", () => {
      if (this.selectedDiamond == d) {
        this.selectedDiamond = null;
      } else {
        this.selectedDiamond = d;
      }
      this.updateSelectedDiamond();
    });

    return d;
  }

  private updateSelectedDiamond() {
    this.highlighter.visible = !!this.selectedDiamond;
    if (this.selectedDiamond)
      this.highlighter.position.set(
        this.selectedDiamond.x,
        this.selectedDiamond.y,
      );
  }

  setSize(width: number, height: number) {
    if (!width || !height) return;
    this.board.position.set(width / 2, height / 2);

    for (let i = 0; i < 4; i++) {
      const d = this.diamonds[i];
      if (!d) continue;
      const x = i % 2;
      const y = Math.floor(i / 2);
      d.position.set(
        width / 2 + (x - 0.5) * this.board.width,
        height / 2 + (y - 0.5) * this.board.height * 0.6,
      );
    }

    if (this.selectedDiamond) {
      this.highlighter.position.set(
        this.selectedDiamond.x,
        this.selectedDiamond.y,
      );
    }

    // Objective panels
    const dy = (height / this.objectivePanels.length);
    for (let i = 0; i < this.objectivePanels.length; i++) {
      const o = this.objectivePanels[i];
      o.position.set(width - o.width / 2 - 50, i * dy + dy/2);
    }
  }
}
