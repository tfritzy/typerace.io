import { Container, TilingSprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

export class Background {
  readonly container: Container;

  constructor(assets: AssetManager) {
    this.container = new Container();

    const tiled = new TilingSprite({
      texture: assets.background,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    });
    this.container.addChild(tiled);
  }

  destroy(): void {
    this.container.destroy();
  }
}
