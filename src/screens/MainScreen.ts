import * as PIXI from "pixi.js";
import { Actions } from "pixi-actions";

import App from "@/App";
import Screen from "@screens/Screen";
import Spacetime from "@/components/Spacetime";
import Diamond from "@/components/Diamond";

export default class MainScreen extends Screen {
  private diamonds: Diamond[] = [];
  private backgroundDiamonds: Diamond[] = [];
  private board: PIXI.Container = new PIXI.Container();
  constructor() {
    super();

    // Draw a bunch of diamonds to make the board
    const dimension = [4, 4];
    for (let i = 0; i < dimension[0]; i++) {
      for (let j = 0; j < dimension[1]; j++) {
        const d = new Diamond({ isBackground: true });
        d.eventMode = "static";
        d.cursor = "pointer";
        let x = (i + j - (dimension[0] - 1)) * Diamond.WIDTH;
        let y = (i - j) * Diamond.HEIGHT;
        d.position.set(x, y);
        d.alpha = 0.2;
        this.backgroundDiamonds.push(d);
        this.board.addChild(d);

        // Hover over diamond to make opaque!
        d.on("pointerenter", () => {
          d.alpha = 1;
        });
        d.on("pointerleave", () => {
          d.alpha = 0.2;
        });

        // Click to place the selected diamond here...
        // ...
        // Recalculate (score +) links
        // ...
      }
    }

    // Draw four diamonds which are our next pieces (one in each corner, pre-filled with dots)
    for (let i = 0; i < 4; i++) {
      const d = new Diamond({ isBackground: false });
      this.diamonds.push(d);
      d.eventMode = "static";
      d.cursor = "pointer";
      d.sprinklePoints(1 + Math.floor(Math.random() * 3));
      this.addChild(d);

      // Click the diamond to select it
      // - Remove all borders
      // - Add border to this one
    }

    this.addChild(this.board);
  }

  setSize(width: number, height: number) {
    if (!width || !height) return;
    this.board.position.set(width / 2, height / 2);

    for (let i = 0; i < 4; i++) {
      const d = this.diamonds[i];
      const x = i % 2;
      const y = Math.floor(i / 2);
      d.position.set(
        width / 2 + (x - 0.5) * this.board.width,
        height / 2 + (y - 0.5) * this.board.height * 0.6,
      );
    }
    // Set scale of spacetime such that it fills the screen
    /*const sx = (width * 0.8) / 800;
    const sy = (height * 0.8) / 1600;
    this.spacetime.scale.set(Math.min(sx, sy));*/
  }
}
