import * as PIXI from "pixi.js";
import _ from "underscore";

import Screen from "@screens/Screen";
import Diamond from "@/components/Diamond";
import Board from "@/components/Board";
import ObjectivePanel from "@/components/ObjectivePanel";
import Font from "@/utils/Font";
import { ScoringType } from "@/components/Node";
import Colour from "@/utils/Colour";
export default class MainScreen extends Screen {
  private diamonds: Diamond[] = [null, null, null];
  private diamondCosts: PIXI.Sprite[] = [
    PIXI.Sprite.from("coins-3.png"),
    PIXI.Sprite.from("coins-2.png"),
    PIXI.Sprite.from("coins-1.png"),
  ];
  private highlighter: Diamond = new Diamond({
    isBackground: false,
    colour: Colour.HIGHLIGHT,
  });
  private selectedDiamond: Diamond = null;
  private deck1: Diamond[] = [];
  private deck2: Diamond[] = [];
  private deck3: Diamond[] = [];
  private objectivePanels: ObjectivePanel[] = [];
  private board: Board;
  private money: number = 20;
  private lblScore: PIXI.BitmapText;
  private lblMoney: PIXI.BitmapText;
  constructor() {
    super();

    this.board = new Board(4, (d: Diamond) => {
      if (this.selectedDiamond) {
        const index = this.diamonds.indexOf(this.selectedDiamond);
        const cost = 3 - index;
        if (this.money < cost) {
          // TODO : Flash money, we don't have enough!
          return;
        }
        this.money -= cost;

        this.diamonds[index] = null;
        // Remove event listener...
        this.selectedDiamond.removeAllListeners();

        // Draw a new diamond from the deck
        this.updateDisplay();
        this.onSizeChanged();

        // Place this diamond ontop of the board in the right place.
        // TODO : Don't allow placing where there is already a diamond
        this.selectedDiamond.position.set(d.x, d.y);
        this.selectedDiamond.coords = [...d.coords];
        this.board.addDiamond(this.selectedDiamond);
        this.selectedDiamond = null;
        this.updateSelectedDiamond();

        // Update score
        this.updateScore();
        this.updateMoneyLabel();

        // Is the game over?
        if (this.money <= 0) {
          // TODO : Game over! Place blanks, and do final scoring.
        }
      }
    });

    for (const s of this.diamondCosts) {
      s.anchor.set(0.5);
      s.scale.set(0.8);
      this.addChild(s);
    }

    // Title row
    // - title of game
    // - settings
    // - etc.
    this.addChild(this.board);
    this.addChild(this.highlighter);
    this.highlighter.scale.set(1.2);
    this.highlighter.visible = false;

    // Make 3 decks
    for (let i = 0; i < 15; i++) {
      const d = new Diamond({ isBackground: false });
      // Scoring diamond
      const type: ScoringType[] = [
        //"chain",
        "five",
        "maximal",
        "minimal",
        //"post",
        "two",
      ];
      d.scoringPoint(type[i % type.length]);
      this.deck1.push(d);
    }
    for (let i = 0; i < 16; i++) {
      const d = new Diamond({ isBackground: false });
      d.sprinklePoints(2 + Math.floor(Math.random() * 3));
      this.deck2.push(d);
    }
    for (let i = 0; i < 16; i++) {
      const d = new Diamond({ isBackground: false });
      d.sprinklePoints(1);
      this.deck3.push(d);
    }
    this.deck1 = _.shuffle(this.deck1);
    this.deck2 = _.shuffle(this.deck2);
    this.deck3 = _.shuffle(this.deck3);

    this.updateDisplay();

    // Add three/four scoring panels
    /*this.objectivePanels.push(new ObjectivePanel(0));
    this.objectivePanels.push(new ObjectivePanel(1));
    this.objectivePanels.push(new ObjectivePanel(2));
    //this.objectivePanels.push(new ObjectivePanel(3)); --- antichain broken
    this.objectivePanels.push(new ObjectivePanel(4));*/
    for (const o of this.objectivePanels) {
      o.calculate(this.board);
      this.addChild(o);

      o.eventMode = "static";
      o.cursor = "pointer";
      // Hover over an objective panel to see the highlighted nodes
      o.on("pointerenter", () => {
        for (const n of this.board.nodes) {
          n.alpha = o.highlightNodes.has(n) ? 1 : 0.2;
        }
        this.board.edgesHolder.alpha = 0.2;
      });
      o.on("pointerleave", () => {
        for (const n of this.board.nodes) {
          n.alpha = 1;
        }
        this.board.edgesHolder.alpha = 1;
      });
    }

    // Update scoring recalculates all of them.
    this.lblScore = new PIXI.BitmapText({
      text: "0",
      style: Font.makeFontOptions("large"),
    });
    this.lblScore.anchor.set(0.5);
    this.lblScore.position.set(0, 0);
    this.lblScore.tint = Colour.SPACETIME_BG;
    this.addChild(this.lblScore);

    this.lblMoney = new PIXI.BitmapText({
      text: "" + this.money,
      style: Font.makeFontOptions("medium"),
    });
    this.lblMoney.anchor.set(0.5);
    this.lblMoney.position.set(0, 0);
    this.lblMoney.tint = Colour.SPACETIME_BG;
    this.addChild(this.lblMoney);
  }

  private updateMoneyLabel() {
    this.lblMoney.text = "" + this.money;
  }

  private updateScore() {
    let score = 0;

    // Scoring objectives
    for (const o of this.objectivePanels) {
      o.calculate(this.board);
      score += o.points;
    }

    // Scoring nodes
    for (const n of this.board.nodes) {
      if (n.scoring) {
        score += 5;
      }
    }

    this.lblScore.text = "" + score;
  }

  private updateDisplay() {
    // Delete all the diamonds in the display?
    // Add the top of each deck.
    // When you place a tile, animate it, a fade in a new one from the corresponding deck
    const decks = [this.deck1, this.deck2, this.deck3];
    for (let i = 0; i < decks.length; i++) {
      // Only draw when there is a missing diamond...
      if (this.diamonds[i]) continue;
      const deck = decks[i];
      if (deck.length > 0) {
        const d = deck.pop();
        this.diamonds[i] = d;
        d.position.set(0, 0);
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
      }
    }
  }

  private updateSelectedDiamond() {
    this.highlighter.visible = !!this.selectedDiamond;
    if (this.selectedDiamond)
      this.highlighter.position.set(
        this.selectedDiamond.x,
        this.selectedDiamond.y,
      );
  }

  onSizeChanged() {
    const [width, height] = [this.screenWidth, this.screenHeight];
    if (!width || !height) return;

    const tileScale = Math.min(
      (0.6 * height) / (2 * Diamond.HEIGHT * this.board.dimension),
      1,
    );

    // 10% for title bar
    this.lblScore.position.set(width / 2, height * 0.05);

    // 60% for grid
    this.board.scale.set(tileScale);
    this.board.position.set(width / 2, height * (0.1 + 0.3));
    this.lblMoney.position.set(
      this.board.x + Diamond.WIDTH * 2.5,
      this.board.y + Diamond.HEIGHT * 2.5
    );

    // 30% for diamond offer
    for (let i = 0; i < this.diamonds.length; i++) {
      const cost = this.diamondCosts[i];
      const d = this.diamonds[i];
      const x = width / 2 - 200 + 200 * i;
      const y1 = height * 0.85 + Diamond.HEIGHT + 30;

      cost.position.set(x, y1);

      if (!d) continue;
      const y2 = height * 0.85;
      d.position.set(x, y2);

      // Put some coins underneath to show cost
      // ...
    }

    if (this.selectedDiamond) {
      this.highlighter.position.set(
        this.selectedDiamond.x,
        this.selectedDiamond.y,
      );
    }

    // Objective panels
    const dy = height / this.objectivePanels.length;
    for (let i = 0; i < this.objectivePanels.length; i++) {
      const o = this.objectivePanels[i];
      o.position.set(width - o.width / 2 - 50, i * dy + dy / 2);
    }
  }
}
