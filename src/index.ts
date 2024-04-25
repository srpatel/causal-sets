import App from "./App";
import * as PIXI from "pixi.js";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App();
  await app.initialise();
  document.body.appendChild(app.canvas);

  app.setSize(window.innerWidth, window.innerHeight);
  window.addEventListener("resize", () => {
    app.setSize(window.innerWidth, window.innerHeight);
  });
});
