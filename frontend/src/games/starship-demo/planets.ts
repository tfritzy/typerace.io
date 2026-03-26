import { Sprite, type Spritesheet } from "pixi.js";
import { PLANET_SCALE, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

export function createRandomPlanet(
  planets: Spritesheet,
  planetsRing: Spritesheet
): Sprite {
  const allTextures = [
    ...Object.values(planets.textures),
    ...Object.values(planetsRing.textures),
  ];
  const texture = allTextures[Math.floor(Math.random() * allTextures.length)];

  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.scale.set(PLANET_SCALE);
  sprite.x = CANVAS_WIDTH / 2;
  sprite.y = CANVAS_HEIGHT / 2;

  return sprite;
}
