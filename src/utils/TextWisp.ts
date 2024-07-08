import * as PIXI from "pixi.js";
import Font from "./Font";
import { Actions } from "pixi-actions";

export default class TextWisp {
  static makeWisp(
    parent: PIXI.Container,
    x: number,
    y: number,
    text: string,
    colour: number,
  ) {
    const label = new PIXI.BitmapText({
      text,
      style: Font.makeFontOptions("small"),
    });
    label.anchor.set(0.5);
    label.position.set(x, y);
    label.tint = colour;
    parent.addChild(label);
    Actions.sequence(
      Actions.parallel(
        Actions.fadeOut(label, 0.8),
        Actions.moveTo(label, x, y - 20, 0.8),
      ),
      Actions.remove(label),
    ).play();
    return label;
  }
}
