import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

export class PlanetManager {
  readonly container: Container;

  constructor(assets: AssetManager) {
    this.container = new Container();

    const planetTextures = Object.values(assets.planets.textures);
    const planet = new Sprite(planetTextures[0]);
    planet.anchor.set(0.5);
    planet.scale.set(6);
    planet.x = CANVAS_WIDTH / 2;
    planet.y = CANVAS_HEIGHT / 2;
    this.container.addChild(planet);
  }

  destroy(): void {
    this.container.destroy();
  }
}
