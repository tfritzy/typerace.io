import { Texture, Rectangle, Sprite } from "pixi.js";
import {
  PLANET_FRAME_SIZE,
  PLANET_RING_FRAME_WIDTH,
  PLANET_RING_FRAME_HEIGHT,
  PLANET_COUNT,
  PLANET_RING_COUNT,
  PLANET_SCALE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "./constants";

function extractFrames(
  source: Texture,
  frameWidth: number,
  frameHeight: number,
  count: number
): Texture[] {
  const frames: Texture[] = [];
  for (let i = 0; i < count; i++) {
    frames.push(
      new Texture({
        source: source.source,
        frame: new Rectangle(i * frameWidth, 0, frameWidth, frameHeight),
      })
    );
  }
  return frames;
}

export function buildPlanetTextures(planetSheet: Texture): Texture[] {
  return extractFrames(planetSheet, PLANET_FRAME_SIZE, PLANET_FRAME_SIZE, PLANET_COUNT);
}

export function buildPlanetRingTextures(planetRingSheet: Texture): Texture[] {
  return extractFrames(
    planetRingSheet,
    PLANET_RING_FRAME_WIDTH,
    PLANET_RING_FRAME_HEIGHT,
    PLANET_RING_COUNT
  );
}

export function createRandomPlanet(
  planetTextures: Texture[],
  planetRingTextures: Texture[]
): Sprite {
  const allTextures = [...planetTextures, ...planetRingTextures];
  const tex = allTextures[Math.floor(Math.random() * allTextures.length)];

  const sprite = new Sprite(tex);
  sprite.anchor.set(0.5);
  sprite.scale.set(PLANET_SCALE);
  sprite.x = CANVAS_WIDTH / 2;
  sprite.y = CANVAS_HEIGHT / 2;

  return sprite;
}
