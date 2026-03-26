import { Sprite, Texture, Rectangle } from "pixi.js";
import {
  ASTEROID_BIG_REGIONS,
  ASTEROID_SMALL_REGIONS,
  ASTEROID_SCALE,
  ASTEROID_SPEED_MIN,
  ASTEROID_SPEED_MAX,
  ASTEROID_ROTATION_SPEED,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  type SpriteRegion,
} from "./constants";

const ASTEROID_SOURCES = [
  "asteroid-big-brown",
  "asteroid-big-white",
  "asteroid-small-brown",
  "asteroid-small-white",
] as const;

export interface AsteroidEntity {
  sprite: Sprite;
  vx: number;
  vy: number;
  rotationSpeed: number;
}

function extractRegionTexture(
  baseTexture: Texture,
  region: SpriteRegion
): Texture {
  return new Texture({
    source: baseTexture.source,
    frame: new Rectangle(region.x, region.y, region.w, region.h),
  });
}

function pickEdgePosition(): { x: number; y: number; angle: number } {
  const edge = Math.floor(Math.random() * 4);
  const pad = 40;

  switch (edge) {
    case 0:
      return {
        x: -pad,
        y: Math.random() * CANVAS_HEIGHT,
        angle: -Math.PI / 4 + Math.random() * Math.PI / 2,
      };
    case 1:
      return {
        x: CANVAS_WIDTH + pad,
        y: Math.random() * CANVAS_HEIGHT,
        angle: Math.PI / 2 + Math.random() * Math.PI / 2 + Math.PI / 4,
      };
    case 2:
      return {
        x: Math.random() * CANVAS_WIDTH,
        y: -pad,
        angle: Math.PI / 4 + Math.random() * Math.PI / 2,
      };
    default:
      return {
        x: Math.random() * CANVAS_WIDTH,
        y: CANVAS_HEIGHT + pad,
        angle: -(Math.PI / 4 + Math.random() * Math.PI / 2),
      };
  }
}

export function createAsteroid(assets: Record<string, Texture>): AsteroidEntity {
  const sourceKey = ASTEROID_SOURCES[Math.floor(Math.random() * ASTEROID_SOURCES.length)];
  const baseTexture = assets[sourceKey];

  const isBig = sourceKey.includes("big");
  const regions = isBig ? ASTEROID_BIG_REGIONS : ASTEROID_SMALL_REGIONS;
  const region = regions[Math.floor(Math.random() * regions.length)];

  const texture = extractRegionTexture(baseTexture, region);
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.scale.set(ASTEROID_SCALE);

  const { x, y, angle } = pickEdgePosition();
  sprite.x = x;
  sprite.y = y;

  const speed = ASTEROID_SPEED_MIN + Math.random() * (ASTEROID_SPEED_MAX - ASTEROID_SPEED_MIN);

  const rotDir = Math.random() > 0.5 ? 1 : -1;
  const rotationSpeed = (0.5 + Math.random() * ASTEROID_ROTATION_SPEED) * rotDir;

  return {
    sprite,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    rotationSpeed,
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
