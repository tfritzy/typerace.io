import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import { CANVAS_HEIGHT } from "./constants";
import { PLANET_X } from "./state";

export class PlanetManager {
  readonly container: Container;

  constructor(assets: AssetManager) {
    this.container = new Container();

    const planetTextures = Object.values(assets.planets.textures);
    const planet = new Sprite(planetTextures[0]);
    planet.anchor.set(0.5);
    planet.scale.set(6);
    planet.x = PLANET_X;
    planet.y = CANVAS_HEIGHT / 2;
    this.container.addChild(planet);
  }

  destroy(): void {
    this.container.destroy();
  }
}
