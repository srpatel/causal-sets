import * as PIXI from "pixi.js";
import { Actions } from "pixi-actions";

import App from "@/App";
import Screen from "@screens/Screen";
import Spacetime from "@/components/Spacetime";
import Diamond from "@/components/Diamond";
import Board from "@/components/Board";

export default class MainScreen extends Screen {
  private diamonds: Diamond[] = [null, null, null, null];
  private highlighter: Diamond = new Diamond({ isBackground: false });
  private selectedDiamond: Diamond = null;
  private board: Board;
  constructor() {
    super();

    this.board = new Board((d: Diamond) => {
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

    // Draw four diamonds which are our next pieces (one in each corner, pre-filled with dots)
    for (let i = 0; i < 4; i++) {
      this.drawDiamond(i);
    }

    this.addChild(this.board);
  }

  private drawDiamond(pos: number) {
    const d = new Diamond({ isBackground: false });
    this.diamonds[pos] = d;
    d.eventMode = "static";
    d.cursor = "pointer";
    d.sprinklePoints(0 + Math.floor(Math.random() * 3));
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

    if (this.selectedDiamond)
      this.highlighter.position.set(
        this.selectedDiamond.x,
        this.selectedDiamond.y,
      );
  }
}
