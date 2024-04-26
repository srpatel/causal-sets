import * as PIXI from "pixi.js";
import { Actions } from "pixi-actions";

import App from "@/App";
import Screen from "@screens/Screen";
import Spacetime from "@/components/Spacetime";

export default class DemoScreen extends Screen {
  private spacetime: Spacetime;
  private numPoints: number = 10;
  private btnMinus: PIXI.Container = new PIXI.Container();
  private btnRegen: PIXI.Container = new PIXI.Container();
  private btnPlus: PIXI.Container = new PIXI.Container();
  constructor() {
    super();

    this.spacetime = new Spacetime();
    this.addChild(this.spacetime);

    this.recalc();

    // Toolbox with three buttons (shape toggle, sprinkle quantity toggle, RUN)
    // Plus and minus buttons...
    for (const holder of [this.btnMinus, this.btnRegen, this.btnPlus]) {
      this.addChild(holder);

      const btn = new PIXI.Graphics();
      btn.circle(0, 0, 30).fill(0xffffff);

      const txt = new PIXI.Text(
        holder === this.btnMinus ? "-" : holder === this.btnRegen ? "*" : "+",
        {
          fontFamily: "Arial",
          fontSize: 48,
          fill: 0,
          align: "center",
        },
      );
      txt.anchor.set(0.5);
      if (holder === this.btnMinus) {
        txt.position.y = -3;
      } else if (holder === this.btnRegen) {
        txt.position.y = 10;
      }

      const hitbox = new PIXI.Sprite(PIXI.Texture.WHITE);
      hitbox.width = btn.width;
      hitbox.height = btn.height;
      hitbox.position.set(-btn.width / 2, -btn.height / 2);
      hitbox.eventMode = "static";
      hitbox.cursor = "pointer";
      hitbox.alpha = 0;
      hitbox.on("pointerdown", () => {
        if (holder === this.btnMinus) {
          this.numPoints -= 5;
        } else if (holder === this.btnPlus) {
          this.numPoints += 5;
        }
        if (this.numPoints <= 0) {
          this.numPoints = 5;
        } else if (this.numPoints >= 100) {
          this.numPoints = 100;
        }
        this.recalc();
      });
      holder.addChild(hitbox);
      holder.addChild(btn);
      holder.addChild(txt);
    }
  }

  recalc() {
    this.spacetime.sprinklePoints(this.numPoints);
    this.spacetime.drawEdges();
  }

  setSize(width: number, height: number) {
    if (!width || !height) return;
    this.spacetime.position.set(width / 2, height / 2);
    // Set scale of spacetime such that it fills the screen
    const sx = (width * 0.8) / 800;
    const sy = (height * 0.8) / 1600;
    this.spacetime.scale.set(Math.min(sx, sy));

    this.btnRegen.position.set(width / 2, height - this.btnRegen.height);
    this.btnMinus.position.set(this.btnRegen.x - 120, this.btnRegen.y);
    this.btnPlus.position.set(this.btnRegen.x + 120, this.btnRegen.y);
  }
}
