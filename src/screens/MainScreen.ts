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
import Modal from "./Modal";
import MessagePanel from "@/components/MessagePanel";
import Obscurer from "@/components/Obscurer";
import FirstTimeModal from "./FirstTimeModal";
export default class MainScreen extends Screen {
  private tutorialMode: boolean;
  private tutorialStep: number = -1;
  private tutorialSteps = [
    {
      name: "SELECT_TILE",
      message: "Select this tile. It costs 2 Energy.",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
      highlight: () => this.diamonds[1],
      action: () => {
        // Select 1-cost tile
        this.selectedDiamond = this.diamonds[2];
        this.updateSelectedDiamond();

        // Make sure 2-cost tile is three-in-a-line???
        this.diamonds[1].tutorialPoints(0);

        // Hide the objective circles
        this.objectivePanel.visible = false;
        this.immediatePanel.visible = false;

        // TODO : Pick the objectives we want
        // Make sure they give 0 points for now!!
      },
    },
    {
      name: "PLACE_ON_BOARD",
      message: "Tap to place it on the board.",
      highlight: () => this.board.backgroundDiamonds[6],
    },
    {
      name: "SELECT_TILE",
      message: "Select this tile",
      messagePosition: {
        attachTo: () => this.diamonds[2],
        placement: "above",
      },
      highlight: () => this.diamonds[2],
      action: () => {
        // Make sure 1-cost tile is in the middle
        this.diamonds[2].tutorialPoints(1);
      },
    },
    {
      name: "PLACE_ON_BOARD",
      message: "Tap to place it on the board.",
      highlight: () => this.board.backgroundDiamonds[5],
    },
    {
      name: "MESSAGE",
      message: "Edges are drawn when nodes fall in the light-cone.",
      tapToContinue: true,
      highlight: () => this.board.nodes[this.board.nodes.length - 1],
      action: () => {
        // Show light-cone to the newly placed tile...
        this.diamonds[2].tutorialPoints(2);
        this.updateSelectedDiamond();
        this.board.setConeForNode(
          this.board.nodes[this.board.nodes.length - 1],
        );
      },
    },
    {
      name: "MESSAGE",
      message:
        "This is an objective.\n\nIf you create a specific number of edges with a new tile, you get bonus points.",
      tapToContinue: true,
      highlight: () => this.immediatePanel,
      action: () => {
        this.immediatePanel.target = 3;
        this.immediatePanel.updateText();
        this.immediatePanel.visible = true;
        this.immediatePanel.alpha = 0;
        Actions.fadeIn(this.immediatePanel, 0.2).play();

        this.board.setConeForNode(null);
      },
    },
    {
      name: "MESSAGE",
      message: "Here we need to create exactly three new edges.",
      tapToContinue: true,
      highlight: () => this.immediatePanel,
      action: () => {
        this.diamonds[2].tutorialPoints(2);
      },
    },
    {
      name: "PLACE_ON_BOARD_TEST",
      message: "See if you can complete the objective with your current tile",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
    },
    {
      name: "FAILURE",
      message: "You created N new edges.\nTry again?",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
      tapToContinue: true,
      highlight: () => this.board.nodes[this.board.nodes.length - 1],
      action: () => {
        // Show light-cone to the newly placed tile...
        this.diamonds[2].tutorialPoints(2);
        this.updateSelectedDiamond();
        this.board.setConeForNode(
          this.board.nodes[this.board.nodes.length - 1],
        );
      },
    },
    {
      name: "DUMMY",
      action: () => {
        // Re-add energy
        this.money++;
        // Remove the last diamond
        this.board.removeLastDiamond();
        // Go back to test step
        this.tutorialStep = this.tutorialSteps.findIndex(
          (s) => s.name == "PLACE_ON_BOARD_TEST",
        );
        this.processTutorial();
        // Clear cone
        this.board.setConeForNode(null);
      },
    },
    {
      name: "SUCCESS",
      message: "Nice job!\nYou made exactly three edges!",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
      tapToContinue: true,
      highlight: () => this.board.nodes[this.board.nodes.length - 1],
      action: () => {
        // Show light-cone to the newly placed tile...
        this.updateSelectedDiamond();
        this.board.setConeForNode(
          this.board.nodes[this.board.nodes.length - 1],
        );
        // Make sure 3-cost tile is up arrow
        this.diamonds[0].scoringPoint("maximal");
        this.updateInfoDesc();
        this.updateSelectedDiamond();
      },
    },
    {
      name: "SELECT_TILE",
      message: "The left tile is special and can give 5 bonus points",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
      highlight: () => this.diamonds[0],
      action: () => {
        // Clear cone
        this.board.setConeForNode(null);
      },
    },
    {
      name: "PLACE_ON_BOARD_TEST2",
      message: "Can you place this one correctly?",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "superabove",
      },
    },
    {
      name: "FAILURE2",
      message:
        "Bad luck! This is not a maximal element.\nTry somewhere else...",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
      tapToContinue: true,
      highlight: () => this.board.nodes[this.board.nodes.length - 1],
      action: () => {
        // Show light-cone to the newly placed tile...
        this.diamonds[0].scoringPoint("maximal");
        this.updateInfoDesc();
        this.updateSelectedDiamond();
      },
    },
    {
      name: "DUMMY",
      action: () => {
        // Re-add energy
        this.money += 3;
        // Remove the last diamond
        this.board.removeLastDiamond();
        // Go back to test step
        this.tutorialStep = this.tutorialSteps.findIndex(
          (s) => s.name == "PLACE_ON_BOARD_TEST2",
        );
        this.processTutorial();
      },
    },
    {
      name: "SUCCESS2",
      message: "Nice job!\nA maximal element has no upwards edges!",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
      tapToContinue: true,
      highlight: () => this.board.nodes[this.board.nodes.length - 1],
      action: () => {
        // Show light-cone to the newly placed tile...
        this.updateSelectedDiamond();
      },
    },
    {
      name: "MESSAGE",
      message:
        "This is another objective.\n\nIt's different each game, and gives you points for a certain feature of your board.",
      tapToContinue: true,
      highlight: () => this.objectivePanel,
      action: () => {
        this.objectivePanel.removeFromParent();
        const o = new ObjectivePanel("longest-chain");
        this.objectivePanel = o;
        o.calculate(this.board);
        this.addChild(o);
        this.setupObjectiveEvents();

        this.onSizeChanged();

        this.objectivePanel.alpha = 0;
        Actions.fadeIn(this.objectivePanel, 0.2).play();
      },
    },
    {
      name: "MESSAGE",
      message:
        "You can hover over it to see what it does.\nThis one gives you points for having a long chain.",
      tapToContinue: true,
      highlight: () => this.objectivePanel,
    },
    {
      name: "PLACE_ON_BOARD_TEST3",
      message: "Try to get it up to 5 points with your next tile!",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
      action: () => {
        // Make sure tile 2 can do this
        this.diamonds[1].tutorialPoints(3);
        this.updateSelectedDiamond();
      },
    },
    {
      name: "FAILURE3",
      message: "You don't have 5 nodes in a chain.\nTry again?",
      messagePosition: {
        attachTo: () => this.diamonds[1],
        placement: "above",
      },
      tapToContinue: true,
      highlight: () => this.board.nodes[this.board.nodes.length - 1],
      action: () => {
        // Make sure tile 2 can do this
        this.diamonds[1].tutorialPoints(3);
        this.updateSelectedDiamond();
      },
    },
    {
      name: "DUMMY",
      action: () => {
        // Re-add energy
        this.money = 13;
        // Remove the last diamond
        this.board.removeLastDiamond();
        // Go back to test step
        this.tutorialStep = this.tutorialSteps.findIndex(
          (s) => s.name == "PLACE_ON_BOARD_TEST3",
        );
        this.processTutorial();
      },
    },
    {
      name: "SUCCESS3",
      message:
        "Nice job!\nThe objective is different each game, be sure to bear it in mind as you play.",
      tapToContinue: true,
      highlight: () => this.board.nodes[this.board.nodes.length - 1],
    },
    /*{
      name: "MESSAGE",
      message: "If you want a reminder of the rules, look here",
      tapToContinue: true,
      highlight: () => this.sprRules,
    },*/
    {
      name: "MESSAGE",
      message:
        "If you want to learn more about the physics behind the game, look here",
      tapToContinue: true,
      highlight: () => this.sprAbout,
    },
    {
      name: "MESSAGE",
      message:
        "Now it's over to you to finish the board!\nCan you get over 20 points?",
      tapToContinue: true,
      highlight: () => this.sprAbout,
    },
  ];
  private obscurer = new Obscurer();
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
  private lblAction: PIXI.BitmapText;
  private lblScore: PIXI.BitmapText;
  private lblMoney: PIXI.BitmapText;
  private lblTitle: PIXI.BitmapText;
  private sprRules: PIXI.Sprite;
  private sprAbout: PIXI.Sprite;
  private tutorialMessage: PIXI.Container;
  private ticker: PIXI.TickerCallback<void>;
  constructor(tutorialMode: boolean) {
    super();

    this.tutorialMode = tutorialMode;

    this.ticker = (tick) => {
      this.visibleMoney -= (this.visibleMoney - this.money) / 5;
      this.visibleScore -= (this.visibleScore - this.score) / 5;

      // Move score and money to actual value
      this.lblMoney.text = Math.round(this.visibleMoney) + "";
      this.lblScore.text = Math.round(this.visibleScore) + "";
    };

    this.lblTitle = new PIXI.BitmapText({
      text: App.TITLE,
      style: Font.makeFontOptions("large"),
    });
    this.lblTitle.anchor.set(0.5);
    this.lblTitle.position.set(0, 0);
    this.lblTitle.tint = Colour.SPACETIME_BG;
    this.addChild(this.lblTitle);

    // Buttons
    this.sprRules = PIXI.Sprite.from("book.png");
    this.sprRules.anchor.set(0.5);
    this.sprRules.tint = Colour.SPACETIME_BG;
    this.sprRules.eventMode = "static";
    this.sprRules.cursor = "pointer";
    this.sprRules.on("pointerdown", () => {
      App.instance.addModal(new FirstTimeModal());
    });
    //this.addChild(this.sprRules);
    this.sprAbout = PIXI.Sprite.from("science.png");
    this.sprAbout.anchor.set(0.5);
    this.sprAbout.tint = Colour.SPACETIME_BG;
    this.sprAbout.eventMode = "static";
    this.sprAbout.cursor = "pointer";
    this.sprAbout.on("pointerdown", () => {
      App.instance.addModal(new Modal());
    });
    this.addChild(this.sprAbout);

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
          // Flash money, we don't have enough!
          const tintMe = Actions.runFunc(() => {
            this.lblMoney.tint = Colour.HIGHLIGHT;
          });
          const tontMe = Actions.runFunc(() => {
            this.lblMoney.tint = Colour.DARK;
          });
          Actions.repeat(
            Actions.sequence(
              Actions.tintTo(this.diamondCosts[index], Colour.HIGHLIGHT, 0.05),
              Actions.tintTo(
                this.diamondCosts[index],
                Colour.SPACETIME_BG,
                0.05,
              ),
            ),
            5,
          ).play();
          Actions.repeat(
            Actions.sequence(
              tintMe,
              Actions.delay(0.05),
              tontMe,
              Actions.delay(0.05),
            ),
            5,
          ).play();
          return;
        }
        const step = this.getTutorialStep();
        if (step?.name == "PLACE_ON_BOARD") {
          if (step.highlight() != d) {
            return;
          }
        } else if (step?.name == "SELECT_TILE") {
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

          // Compute the action!
          const action = this.board.getAction();
          this.lblAction.text = "Action: " + action;
          Actions.fadeIn(this.lblAction, 0.2).play();
        }

        if (step?.name == "PLACE_ON_BOARD") {
          this.advanceTutorial();
        } else if (step?.name == "PLACE_ON_BOARD_TEST") {
          if (numNewEdges == 3) {
            // Success
            this.tutorialStep = this.tutorialSteps.findIndex(
              (s) => s.name == "SUCCESS",
            );
            this.processTutorial();
          } else {
            // Failure
            this.tutorialStep = this.tutorialSteps.findIndex(
              (s) => s.name == "FAILURE",
            );
            if (numNewEdges == 1) {
              this.tutorialSteps[
                this.tutorialStep
              ].message = `You only created 1 edge.\nTry again?`;
            } else if (numNewEdges == 0) {
              this.tutorialSteps[
                this.tutorialStep
              ].message = `You created no edges.\nTry again?`;
            } else if (numNewEdges == 2) {
              this.tutorialSteps[
                this.tutorialStep
              ].message = `You only created 2 edges.\nTry again?`;
            } else {
              this.tutorialSteps[
                this.tutorialStep
              ].message = `You created ${numNewEdges} edges.\nTry again?`;
            }
            this.processTutorial();
          }
        } else if (step?.name == "PLACE_ON_BOARD_TEST2") {
          const lastNode = this.board.nodes[this.board.nodes.length - 1];
          if (lastNode.scoring) {
            // Success
            this.tutorialStep = this.tutorialSteps.findIndex(
              (s) => s.name == "SUCCESS2",
            );
            this.processTutorial();
          } else {
            // Failure
            this.tutorialStep = this.tutorialSteps.findIndex(
              (s) => s.name == "FAILURE2",
            );
            this.processTutorial();
          }
        } else if (step?.name == "PLACE_ON_BOARD_TEST3") {
          if (this.objectivePanel.points >= 5) {
            // Success
            this.tutorialStep = this.tutorialSteps.findIndex(
              (s) => s.name == "SUCCESS3",
            );
            this.processTutorial();
          } else {
            // Failure
            this.tutorialStep = this.tutorialSteps.findIndex(
              (s) => s.name == "FAILURE3",
            );
            this.processTutorial();
          }
        }
      }
    });

    for (const s of this.diamondCosts) {
      s.anchor.set(0.5);
      s.scale.set(0.8);
      this.addChild(s);
      s.tint = Colour.SPACETIME_BG;
    }

    this.addChild(this.board);
    this.addChild(this.highlighter);
    this.highlighter.scale.set(1.2);
    this.highlighter.visible = false;

    this.checkDecks();

    this.updateDisplay();

    this.selectedDiamond = this.diamonds[1];
    this.updateSelectedDiamond();

    this.addChild(this.infoPanel);

    // Add one random end-game scoring panel
    const o = new ObjectivePanel(tutorialMode ? "none" : getRandomObjective());
    this.objectivePanel = o;
    o.calculate(this.board);
    this.addChild(o);

    this.immediatePanel = new ImmediatePanel(tutorialMode ? true : false);
    this.addChild(this.immediatePanel);
    this.setupObjectiveEvents();

    {
      const t = PIXI.Sprite.from("triangle.png");
      this.moneyTriangle.addChild(t);
      t.scale.set(-1, 1);
      t.anchor.set(0.5);
      this.addChild(this.moneyTriangle);

      const label = new PIXI.BitmapText({
        text: "Energy",
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

    // Action (for end of game)
    this.lblAction = new PIXI.BitmapText({
      text: "Action: 57",
      style: Font.makeFontOptions("medium"),
    });
    this.lblAction.anchor.set(0.5);
    this.lblAction.tint = Colour.SPACETIME_BG;
    this.lblAction.alpha = 0;
    this.addChild(this.lblAction);

    // Buttons
    const b1 = new Button("btnagain", () => {
      Actions.sequence(
        Actions.fadeOut(this, 0.2),
        Actions.runFunc(() => {
          const m = new MainScreen(false);
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

    this.obscurer.tint = 0;
    this.obscurer.alpha = 0;
    this.addChild(this.obscurer);
    this.obscurer.on("pointerdown", (e) => {
      this.advanceTutorial();
      e.stopPropagation();
    });

    this.advanceTutorial();
  }

  setupObjectiveEvents() {
    // Hover over an objective panel to see the highlighted nodes,
    // and the description of it...
    // TODO : On mobile, pointerdown also works
    const o = this.objectivePanel;
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
  }

  private showObscurer() {
    Actions.clear(this.obscurer);
    Actions.fadeTo(this.obscurer, 0.72, 0.4).play();
  }
  private hideObscurer() {
    Actions.fadeOut(this.obscurer, 0.2).play();
  }

  private getTutorialStep() {
    if (!this.tutorialMode || this.tutorialStep > this.tutorialSteps.length) {
      return null;
    }
    return this.tutorialSteps[this.tutorialStep];
  }
  private advanceTutorial() {
    if (!this.tutorialMode) return;
    this.tutorialStep++;
    this.processTutorial();
  }
  private advanceTutorialIf(stepName: string) {
    const step = this.getTutorialStep();
    if (step?.name == stepName) this.advanceTutorial();
  }
  private processTutorial() {
    this.obscurer.eventMode = "none";
    // Remove message if there is one...
    if (this.tutorialMessage) {
      Actions.fadeOutAndRemove(this.tutorialMessage, 0.4).play();
      this.tutorialMessage = null;
    }
    this.hideObscurer();
    if (!this.tutorialMode || this.tutorialStep > this.tutorialSteps.length) {
      return;
    }
    const step = this.getTutorialStep();
    if (step?.message) {
      // Add a message box to the middle of the screen...
      const panel = new MessagePanel(
        step.message,
        step.tapToContinue ? "[ Tap to continue ]" : null,
      );
      panel.alpha = 0;
      this.addChild(panel);
      this.tutorialMessage = panel;
      Actions.sequence(Actions.delay(0.2), Actions.fadeIn(panel, 0.4)).play();

      if (step.tapToContinue) {
        this.obscurer.eventMode = "static";
      }
    }
    if (step?.highlight) {
      // Add the obscurer
      this.showObscurer();
    }
    if (step?.action) {
      step.action();
    }
    this.onSizeChanged();
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
          const step = this.getTutorialStep();
          if (
            step?.name == "PLACE_ON_BOARD" ||
            step?.name == "PLACE_ON_BOARD_TEST"
          ) {
            return;
          }
          if (step?.name == "SELECT_TILE") {
            if (d == step.highlight()) {
              this.advanceTutorial();
            }
          }
          this.selectedDiamond = d;
          this.updateSelectedDiamond();
        });
      }
      this.checkDecks();
      this.addChild(this.obscurer);
    }

    this.updateInfoDesc();
  }

  private updateInfoDesc() {
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
    if (!this.highlighter.visible) {
      // Fade it in
      this.highlighter.alpha = 0;
      Actions.sequence(
        Actions.delay(0.2),
        Actions.fadeIn(this.highlighter, 0.2),
      ).play();
    }
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
    this.sprAbout.position.set(width - 100, this.lblTitle.y + 5);
    this.sprRules.position.set(100, this.lblTitle.y + 5);

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

    this.lblAction.position.set(
      width / 2,
      (height * 0.85 + this.board.y + Diamond.HEIGHT * 4) / 2 - 20,
    );

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

    if (this.tutorialMessage) {
      const step = this.tutorialSteps[this.tutorialStep];
      if (step?.messagePosition) {
        const pos = step.messagePosition;
        const attachTo = pos.attachTo();
        let dx = 0;
        let dy = 0;
        if (pos.placement == "above") {
          dy = (-1 * attachTo.height - this.tutorialMessage.height) / 2 - 20;
        } else if (pos.placement == "superabove") {
          dy = (-1 * attachTo.height - this.tutorialMessage.height) / 2 - 90;
        }
        this.tutorialMessage.position.set(
          attachTo.x - this.tutorialMessage.width / 2 + dx,
          attachTo.y - this.tutorialMessage.height / 2 + dy,
        );
      } else {
        this.tutorialMessage.position.set(
          (width - this.tutorialMessage.width) / 2,
          (height - this.tutorialMessage.height) / 2,
        );
      }
    }

    const step = this.getTutorialStep();
    if (step?.highlight) {
      const e = step.highlight();
      let hx = e.x;
      let hy = e.y;
      let sentinel = e.parent;
      while (sentinel != this) {
        hx += sentinel.parent.x;
        hy += sentinel.parent.y;
        sentinel = sentinel.parent;
      }
      this.obscurer.setHole(hx, hy);
    }
  }

  onAddedToStage(stage: PIXI.Container<PIXI.ContainerChild>): void {
    PIXI.Ticker.shared.add(this.ticker);
  }
  onRemovedFromStage(stage: PIXI.Container<PIXI.ContainerChild>): void {
    PIXI.Ticker.shared.remove(this.ticker);
  }
}
