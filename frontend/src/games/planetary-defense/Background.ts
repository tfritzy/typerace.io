import { Container, TilingSprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { StarParticleManager } from "./particles";

export class Background {
  readonly container: Container;
  private starParticles: StarParticleManager;

  constructor(assets: AssetManager) {
    this.container = new Container();

    const tiled = new TilingSprite({
      texture: assets.background,
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
    });
    this.container.addChild(tiled);

    this.starParticles = new StarParticleManager(assets.starsParticle);
    this.container.addChild(this.starParticles.container);
  }

  update(dt: number): void {
    this.starParticles.update(dt);
  }

  destroy(): void {
    this.starParticles.destroy();
    this.container.destroy();
  }
}
