import * as PIXI from "pixi.js";
import { Actions } from "pixi-actions";

import Screen from "@screens/Screen";
import MainScreen from "@screens/MainScreen";
import Colour from "./utils/Colour";

export default class App extends PIXI.Application {
  static instance: App;

  private static TARGET_WIDTH = 800;
  private static TARGET_HEIGHT = 1200;

  private currentScreen: Screen;
  private screenWidth: number;
  private screenHeight: number;

  private modal: Screen = null;

  constructor() {
    super();

    App.instance = this;
  }

  async initialise() {
    await this.init({
      backgroundColor: Colour.DARK,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      eventMode: "auto",
    });
    await PIXI.Assets.load(["fredoka.fnt", "spritesheet.json"]);

    this.setScreen(new MainScreen());

    PIXI.Ticker.shared.add((tick) => Actions.tick(tick.deltaTime / 60));
  }

  setScreen(screen: Screen) {
    if (this.currentScreen) {
      this.stage.removeChild(this.currentScreen);
      this.currentScreen.onRemovedFromStage(this.stage);
    }
    this.currentScreen = screen;
    this.stage.addChild(this.currentScreen);
    this.currentScreen.onAddedToStage(this.stage);

    this.currentScreen.position.set(0, 0);
    this.currentScreen.setSize(this.screenWidth, this.screenHeight);
  }

  addModal(modal: Screen) {
    this.modal = modal;

    this.stage.addChild(this.modal);
    this.modal.onAddedToStage(this.stage);

    this.modal.alpha = 0;
    Actions.fadeIn(this.modal, 0.2).play();

    this.modal.position.set(0, 0);
    this.modal.setSize(this.screenWidth, this.screenHeight);
  }

  popModal() {
    if (!this.modal) return;

    this.modal.eventMode = "none";
    Actions.fadeOutAndRemove(this.modal, 0.2).play();
    this.modal = null;
  }

  setSize(width: number, height: number) {
    this.renderer.resize(width, height);

    // Scale stage so that we are always bigger than the target size in each dimension
    // This means that we should not need to scale sprites, just move them around
    const targetScaleX = width / App.TARGET_WIDTH;
    const targetScaleY = height / App.TARGET_HEIGHT;
    const scale = Math.min(targetScaleX, targetScaleY);

    this.screenWidth = width / scale;
    this.screenHeight = height / scale;

    this.stage.scale.set(scale);

    // Place and size screen correctly
    if (this.currentScreen) {
      this.currentScreen.position.set(0, 0);
      this.currentScreen.setSize(this.screenWidth, this.screenHeight);
    }

    if (this.modal) {
      this.modal.position.set(0, 0);
      this.modal.setSize(this.screenWidth, this.screenHeight);
    }
  }
}
