import * as PIXI from "pixi.js";
import Button from "@/components/Button";
import Modal from "./Modal";
import App from "@/App";
import MainScreen from "./MainScreen";
import Font from "@/utils/Font";
import Colour from "@/utils/Colour";
import Board from "@/components/Board";
import { Actions } from "pixi-actions";

export default class FirstTimeModal extends Modal {
  title: PIXI.BitmapText;
  subtitle: PIXI.BitmapText;
  b1: Button;
  b2: Button;
  board: Board;
  constructor() {
    super(false);

    this.panel.width = 400;
    this.panel.height = 580;

    this.title = new PIXI.BitmapText({
      text: App.TITLE,
      style: {
        ...Font.makeFontOptions("big"),
      },
    });
    this.title.anchor.set(0.5);
    this.title.tint = Colour.SPACETIME_BG;
    this.addChild(this.title);

    this.subtitle = new PIXI.BitmapText({
      text: "a small game about making connections",
      style: {
        ...Font.makeFontOptions("medium"),
        wordWrap: true,
        wordWrapWidth: 350,
      },
    });
    this.subtitle.anchor.set(0.5);
    this.subtitle.tint = Colour.SPACETIME_BG;
    this.addChild(this.subtitle);

    this.board = new Board(2, () => {}, true);
    this.board.scale.set(0.5);
    this.addChild(this.board);

    // Animation
    const repeat = Actions.repeat(
      Actions.sequence(
        Actions.runFunc(() => {
          this.board.airDropBlanks(false);
        }),
        Actions.delay(2),
        Actions.runFunc(() => {
          const oldBoard = this.board;
          this.board = new Board(2, () => {}, true);
          this.board.scale.set(0.5);
          this.addChild(this.board);
          this.addChild(oldBoard);
          this.onSizeChanged();
          Actions.fadeOutAndRemove(oldBoard, 0.2).play();
        }),
        Actions.delay(0.2),
        Actions.runFunc(() => {
          if (!this.parent) {
            repeat.stop();
          }
        }),
      ),
    ).play();

    // Two buttons
    this.b1 = new Button("btntutorial", () => {
      App.instance.popModal();
      App.instance.setScreen(new MainScreen(true));
    });
    this.addChild(this.b1);
    this.b2 = new Button("btnplay", () => {
      App.instance.popModal();
    });
    this.addChild(this.b2);
  }

  onSizeChanged(): void {
    super.onSizeChanged();
    this.title.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + 50,
    );
    this.board.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + 185,
    );
    this.subtitle.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + this.panel.height - 260,
    );
    this.b1.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + this.panel.height - 160,
    );
    this.b2.position.set(
      this.panel.x + this.panel.width / 2,
      this.panel.y + this.panel.height - 70,
    );
  }
}
