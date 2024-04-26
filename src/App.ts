import * as PIXI from "pixi.js";
import { Actions } from "pixi-actions";

import Screen from "@screens/Screen";
import MainScreen from "@screens/MainScreen";

export default class App extends PIXI.Application {
  static instance: App;

  private static TARGET_WIDTH = 1200;
  private static TARGET_HEIGHT = 800;

  private currentScreen: Screen;
  private screenWidth: number;
  private screenHeight: number;

  constructor() {
    super();

    App.instance = this;
  }

  async initialise() {
    await this.init({
      backgroundColor: 0xffdfbb,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      eventMode: "auto",
    });
    await PIXI.Assets.load(["fredoka.fnt"]);

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
  }
}
