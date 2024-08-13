import * as PIXI from "pixi.js";
import Font from "@/utils/Font";
import Colour from "@/utils/Colour";
import Definition from "./Definition";

export default class Page extends PIXI.Container {
  constructor(defns: Definition[]) {
    super();

    let y = 0;
    for (const d of defns) {
      d.position.set(-250, y);
      y += d.height + 50;
      this.addChild(d);
    }
  }
}
