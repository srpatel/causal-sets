import * as PIXI from "pixi.js";

export type FontSize = "tiny" | "small" | "medium" | "big" | "large";
type FontType = "default";

export default class Font {
  static fonts = {
    default: {
      face: "FredokaOne",
      baseSize: 12,
      license: "https://opensource.org/licenses/OFL-1.1",
    },
  };
  static makeFontOptions(
    size: FontSize,
    align: PIXI.TextStyleAlign = "center",
    face: FontType = "default",
  ) {
    const font = this.fonts[face];
    return {
      fontFamily: font.face,
      fontSize: this.multiplier(size) * font.baseSize,
      align,
    };
  }
  static multiplier(size: FontSize): number {
    if (size === "tiny") return 1.5;
    if (size === "small") return 2;
    if (size === "medium") return 3;
    if (size === "big") return 4.5;
    if (size === "large") return 6;
    else return 1;
  }
}
