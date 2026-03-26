import { Sprite, type Spritesheet } from "pixi.js";
import {
  ASTEROID_SCALE,
  ASTEROID_SPEED_MIN,
  ASTEROID_SPEED_MAX,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "./constants";
import { ASTEROID_ALIASES } from "./manifest";

export interface AsteroidEntity {
  sprite: Sprite;
  vx: number;
  vy: number;
  rotationSpeed: number;
}

function pickEdgeSpawn(): { x: number; y: number; angle: number } {
  const edge = Math.floor(Math.random() * 4);
  const pad = 40;

  switch (edge) {
    case 0:
      return {
        x: -pad,
        y: Math.random() * CANVAS_HEIGHT,
        angle: -Math.PI / 4 + (Math.random() * Math.PI) / 2,
      };
    case 1:
      return {
        x: CANVAS_WIDTH + pad,
        y: Math.random() * CANVAS_HEIGHT,
        angle: Math.PI - Math.PI / 4 + (Math.random() * Math.PI) / 2,
      };
    case 2:
      return {
        x: Math.random() * CANVAS_WIDTH,
        y: -pad,
        angle: Math.PI / 4 + (Math.random() * Math.PI) / 2,
      };
    default:
      return {
        x: Math.random() * CANVAS_WIDTH,
        y: CANVAS_HEIGHT + pad,
        angle: -(Math.PI / 4 + (Math.random() * Math.PI) / 2),
      };
  }
}

export function createAsteroid(
  asteroidSheets: Record<string, Spritesheet>
): AsteroidEntity {
  const alias =
    ASTEROID_ALIASES[Math.floor(Math.random() * ASTEROID_ALIASES.length)];
  const sheet = asteroidSheets[alias];
  const textures = Object.values(sheet.textures);
  const texture = textures[Math.floor(Math.random() * textures.length)];

  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.scale.set(ASTEROID_SCALE);

  const { x, y, angle } = pickEdgeSpawn();
  sprite.x = x;
  sprite.y = y;

  const speed =
    ASTEROID_SPEED_MIN +
    Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN);
  const rotDir = Math.random() > 0.5 ? 1 : -1;

  return {
    sprite,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotationSpeed: (0.5 + Math.random() * 1.5) * rotDir,
  };
}

export function updateAsteroids(
  asteroids: AsteroidEntity[],
  dt: number
): AsteroidEntity[] {
  const pad = 100;
  return asteroids.filter((a) => {
    a.sprite.x += a.vx * dt;
    a.sprite.y += a.vy * dt;
    a.sprite.rotation += a.rotationSpeed * dt;

    const oob =
      a.sprite.x < -pad ||
      a.sprite.x > CANVAS_WIDTH + pad ||
      a.sprite.y < -pad ||
      a.sprite.y > CANVAS_HEIGHT + pad;

    if (oob) {
      a.sprite.destroy();
      return false;
    }
    return true;
  });
}
