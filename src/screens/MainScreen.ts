import * as PIXI from "pixi.js";
import _ from "underscore";

import Screen from "@screens/Screen";
import Diamond from "@/components/Diamond";
import Board from "@/components/Board";
import ObjectivePanel, {
  getRandomObjective,
} from "@/components/ObjectivePanel";
import Font from "@/utils/Font";
import { ScoringType } from "@/components/Node";
import Colour from "@/utils/Colour";
import { Actions } from "pixi-actions";
import Button from "@/components/Button";
import App from "@/App";
import ImmediatePanel from "@/components/ImmediatePanel";
export default class MainScreen extends Screen {
  private diamonds: Diamond[] = [null, null, null];
  private infoPanel = new PIXI.Container();
  private infoDesc: PIXI.BitmapText;
  private moneyTriangle = new PIXI.Container();
  private scoreTriangle = new PIXI.Container();
  private sharePanel = new PIXI.Container();
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
  private objectivePanel: ObjectivePanel;
  private immediatePanel: ImmediatePanel;
  private board: Board;
  private money: number = 20;
  private edgeScore = 0;
  private score: number = 0;
  private visibleScore: number = 0;
  private visibleMoney: number = 20;
  private lblScore: PIXI.BitmapText;
  private lblMoney: PIXI.BitmapText;
  private lblTitle: PIXI.BitmapText;
  private ticker: PIXI.TickerCallback<void>;
  constructor() {
    super();

    this.ticker = (tick) => {
      this.visibleMoney -= (this.visibleMoney - this.money) / 5;
      this.visibleScore -= (this.visibleScore - this.score) / 5;

      // Move score and money to actual value
      this.lblMoney.text = Math.round(this.visibleMoney) + "";
      this.lblScore.text = Math.round(this.visibleScore) + "";
    };

    this.lblTitle = new PIXI.BitmapText({
      text: "Causal Sets Game",
      style: Font.makeFontOptions("large"),
    });
    this.lblTitle.anchor.set(0.5);
    this.lblTitle.position.set(0, 0);
    this.lblTitle.tint = Colour.SPACETIME_BG;
    this.addChild(this.lblTitle);

    const panel = PIXI.Sprite.from("infopanel.png");
    panel.anchor.set(0.5);
    this.infoPanel.addChild(panel);
    this.infoPanel.visible = false;
    this.infoDesc = new PIXI.BitmapText({
      text: "",
      style: Font.makeFontOptions("small"),
    });
    this.infoDesc.anchor.set(0.5);
    this.infoDesc.position.set(0, -8);
    this.infoDesc.tint = Colour.DARK;
    this.infoPanel.addChild(this.infoDesc);

    this.board = new Board(4, (d: Diamond) => {
      if (this.selectedDiamond) {
        const index = this.diamonds.indexOf(this.selectedDiamond);
        if (index < 0) {
          return;
        }

        const cost = 3 - index;
        if (this.money < cost) {
          // TODO : Flash money, we don't have enough!
          return;
        }
        // Place this diamond ontop of the board in the right place.
        this.selectedDiamond.position.set(d.x, d.y);
        this.selectedDiamond.coords = [...d.coords];
        const { didAdd, numNewEdges } = this.board.addDiamond(
          this.selectedDiamond,
        );
        if (!didAdd) {
          return;
        }

        this.money -= cost;

        this.diamonds[index] = null;
        // Remove event listener...
        this.selectedDiamond.removeAllListeners();

        // Draw a new diamond from the deck
        for (let i = 0; i < 3; i++) {
          if (this.diamonds[i]) {
            Actions.fadeOutAndRemove(this.diamonds[i], 0.2).play();
            this.diamonds[i] = null;
          }
        }
        this.updateDisplay();
        this.onSizeChanged();

        this.selectedDiamond = this.diamonds[index];
        this.updateSelectedDiamond();

        // Update score
        //this.edgeScore += numNewEdges;
        this.immediatePanel.madeConnections(numNewEdges);
        this.updateScore();

        // Is the game over?
        if (
          this.money <= 0 ||
          this.board.foregroundDiamonds.length ==
            this.board.dimension * this.board.dimension
        ) {
          this.selectedDiamond = null;
          this.updateSelectedDiamond();
          // 1. Airdrop blank tiles
          this.board.airDropBlanks();
          // 2. Fade out diamonds
          for (let i = 0; i < 3; i++) {
            if (this.diamonds[i]) {
              Actions.fadeOutAndRemove(this.diamonds[i], 0.2).play();
              this.diamonds[i] = null;
            }
            if (this.diamondCosts[i]) {
              Actions.fadeOut(this.diamondCosts[i], 0.2).play();
            }
          }
          // 3. Fade in share panel
          this.sharePanel.visible = true;
          this.sharePanel.alpha = 0;
          Actions.fadeIn(this.sharePanel, 0.2).play();
        }
      }
    });

    for (const s of this.diamondCosts) {
      s.anchor.set(0.5);
      s.scale.set(0.8);
      this.addChild(s);
    }

    this.addChild(this.board);
    this.addChild(this.highlighter);
    this.highlighter.scale.set(1.2);
    this.highlighter.visible = false;

    this.checkDecks();

    this.updateDisplay();

    this.addChild(this.infoPanel);

    // Add one random end-game scoring panel
    const o = new ObjectivePanel(getRandomObjective());
    this.objectivePanel = o;
    o.calculate(this.board);
    this.addChild(o);

    this.immediatePanel = new ImmediatePanel();
    this.addChild(this.immediatePanel);

    o.eventMode = "static";
    o.cursor = "pointer";
    // Hover over an objective panel to see the highlighted nodes,
    // and the description of it...
    // TODO : On mobile, pointerdown also works
    o.on("pointerenter", () => {
      for (const n of this.board.nodes) {
        n.alpha = o.highlightNodes.has(n) ? 1 : 0.2;
      }
      for (const e of this.board.edges) {
        if (o.type == "most-edges") {
          e.alpha =
            o.highlightNodes.has(e.from) || o.highlightNodes.has(e.to)
              ? 1
              : 0.2;
        } else {
          e.alpha =
            o.highlightNodes.has(e.from) && o.highlightNodes.has(e.to)
              ? 1
              : 0.2;
        }
      }
      for (const e of this.board.antiedges) {
        e.visible = false;
        if (o.type == "longest-antichain") {
          e.visible =
            o.highlightNodes.has(e.from) && o.highlightNodes.has(e.to);
        } else if (o.type == "most-antiedges") {
          e.visible =
            o.highlightNodes.has(e.from) || o.highlightNodes.has(e.to);
        }
      }
    });
    o.on("pointerleave", () => {
      for (const n of this.board.nodes) {
        n.alpha = 1;
      }
      for (const e of this.board.edges) {
        e.alpha = 1;
      }
      for (const e of this.board.antiedges) {
        e.visible = false;
      }
    });

    {
      const t = PIXI.Sprite.from("triangle.png");
      this.moneyTriangle.addChild(t);
      t.scale.set(-1, 1);
      t.anchor.set(0.5);
      this.addChild(this.moneyTriangle);

      const label = new PIXI.BitmapText({
        text: "Cost",
        style: Font.makeFontOptions("small"),
      });
      label.anchor.set(0.5);
      label.position.set(-20, 65);
      label.tint = Colour.DARK;
      this.moneyTriangle.addChild(label);
    }
    {
      const t = PIXI.Sprite.from("triangle.png");
      this.scoreTriangle.addChild(t);
      t.anchor.set(0.5);
      this.addChild(this.scoreTriangle);

      const label = new PIXI.BitmapText({
        text: "Score",
        style: Font.makeFontOptions("small"),
      });
      label.anchor.set(0.5);
      label.position.set(12, 65);
      label.tint = Colour.DARK;
      this.scoreTriangle.addChild(label);
    }
    // Update scoring recalculates all of them.
    this.lblScore = new PIXI.BitmapText({
      text: "0",
      style: Font.makeFontOptions("medium"),
    });
    this.lblScore.anchor.set(0.5);
    this.lblScore.position.set(20, 20);
    this.lblScore.tint = Colour.DARK;
    this.scoreTriangle.addChild(this.lblScore);

    this.lblMoney = new PIXI.BitmapText({
      text: "" + this.money,
      style: Font.makeFontOptions("medium"),
    });
    this.lblMoney.anchor.set(0.5);
    this.lblMoney.position.set(-20, 20);
    this.lblMoney.tint = Colour.DARK;
    this.moneyTriangle.addChild(this.lblMoney);

    // Buttons
    const b1 = new Button("btnagain", () => {
      Actions.sequence(
        Actions.fadeOut(this, 0.2),
        Actions.runFunc(() => {
          const m = new MainScreen();
          m.alpha = 0;
          Actions.fadeIn(m, 0.2).play();
          App.instance.setScreen(m);
        }),
      ).play();
    });
    const b2 = new Button("btnshare", () => {
      // TODO:
      // Copy to clipboard: "Causal Sets Game. Score: 20. Link."
    });
    b1.position.set(-125, 0);
    b2.position.set(125, 0);
    this.sharePanel.addChild(b1);
    this.sharePanel.addChild(b2);
    this.addChild(this.sharePanel);
    this.sharePanel.visible = false;
  }

  private checkDecks() {
    // Make 3 decks
    if (this.deck1.length == 0) {
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
      this.deck1 = _.shuffle(this.deck1);
    }
    if (this.deck2.length == 0) {
      for (let i = 0; i < 16; i++) {
        const d = new Diamond({ isBackground: false });
        d.sprinklePoints(2 + Math.floor(Math.random() * 3));
        this.deck2.push(d);
      }
      this.deck2 = _.shuffle(this.deck2);
    }
    if (this.deck3.length == 0) {
      for (let i = 0; i < 16; i++) {
        const d = new Diamond({ isBackground: false });
        d.sprinklePoints(1);
        this.deck3.push(d);
      }
      this.deck3 = _.shuffle(this.deck3);
    }
  }

  private updateScore() {
    let score = 0;

    // Scoring objectives
    this.objectivePanel.calculate(this.board);

    // Scoring nodes
    for (const n of this.board.nodes) {
      if (n.scoring) {
        score += 5;
      }
    }

    this.score =
      score +
      this.edgeScore +
      this.objectivePanel.points +
      this.immediatePanel.points;
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

        d.alpha = 0;
        Actions.sequence(Actions.delay(0.2), Actions.fadeIn(d, 0.2)).play();

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
      this.checkDecks();
    }

    const st = this.diamonds?.[0].scoreType;
    if (st === "chain") {
      this.infoDesc.text = "Part of the longest chain";
    } else if (st === "five") {
      this.infoDesc.text = "Four or more edges";
    } else if (st === "two") {
      this.infoDesc.text = "Exactly two edges";
    } else if (st === "maximal") {
      this.infoDesc.text = "Maximal element";
    } else if (st === "minimal") {
      this.infoDesc.text = "Minimal element";
    } else if (st === "post") {
      this.infoDesc.text = "Post";
    }
  }

  private updateSelectedDiamond() {
    this.highlighter.visible = !!this.selectedDiamond;
    this.infoPanel.visible = this.selectedDiamond == this.diamonds[0];
    if (this.selectedDiamond) {
      this.highlighter.position.set(
        this.selectedDiamond.x,
        this.selectedDiamond.y,
      );
    }
    this.board.setPotential(this.selectedDiamond);
  }

  onSizeChanged() {
    const [width, height] = [this.screenWidth, this.screenHeight];
    if (!width || !height) return;

    const tileScale = Math.min(
      (0.6 * height) / (2 * Diamond.HEIGHT * this.board.dimension),
      1,
    );

    // 10% for title bar
    this.lblTitle.position.set(width / 2, height * 0.05);

    // 60% for grid
    this.board.scale.set(tileScale);
    this.board.position.set(width / 2, height * (0.1 + 0.3));
    this.moneyTriangle.position.set(
      this.board.x - Diamond.WIDTH * 2.5,
      this.board.y + Diamond.HEIGHT * 2.5,
    );
    this.scoreTriangle.position.set(
      this.board.x + Diamond.WIDTH * 2.5,
      this.board.y + Diamond.HEIGHT * 2.5,
    );
    this.objectivePanel.position.set(
      this.board.x - Diamond.WIDTH * 3,
      this.board.y - Diamond.HEIGHT * 3,
    );
    this.immediatePanel.position.set(
      this.board.x + Diamond.WIDTH * 3,
      this.board.y - Diamond.HEIGHT * 3,
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
    }
    this.sharePanel.position.set(width / 2, height * 0.85);

    if (this.selectedDiamond) {
      this.highlighter.position.set(
        this.selectedDiamond.x,
        this.selectedDiamond.y,
      );
    }

    this.infoPanel.position.set(
      this.diamonds[0].x,
      this.diamonds[0].y - Diamond.HEIGHT - 45,
    );
  }

  onAddedToStage(stage: PIXI.Container<PIXI.ContainerChild>): void {
    PIXI.Ticker.shared.add(this.ticker);
  }
  onRemovedFromStage(stage: PIXI.Container<PIXI.ContainerChild>): void {
    PIXI.Ticker.shared.remove(this.ticker);
  }
}
