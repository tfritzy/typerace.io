import { Container, Texture, Sprite, Rectangle, AnimatedSprite } from "pixi.js";
import {
  SHIP_REGIONS,
  SHIP_SCALE,
  SHIP_SPEED_MIN,
  SHIP_SPEED_MAX,
  COLORMAP_GRAYS,
  COLOR_PRESETS,
  ENGINE_FRAME_WIDTH,
  ENGINE_FRAME_HEIGHT,
  ENGINE_FRAME_COUNT,
  ENGINE_ANIMATION_SPEED,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  type SpriteRegion,
} from "./constants";

const ENGINE_ALIASES = [
  "engine-1-big",
  "engine-1-small",
  "engine-2-big",
  "engine-2-small",
  "engine-3-big",
  "engine-3-small",
  "engine-4-big",
  "engine-4-small",
];

export interface ShipEntity {
  container: Container;
  vx: number;
  vy: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

let cachedBaseImg: HTMLImageElement | null = null;
let cachedColormapImg: HTMLImageElement | null = null;

export async function preloadShipImages(): Promise<void> {
  const base = "/pixel_starships_kit/SpaceShips";
  [cachedBaseImg, cachedColormapImg] = await Promise.all([
    loadImage(`${base}/Spaceships.png`),
    loadImage(`${base}/Spaceships Colormap.png`),
  ]);
}

function applyColorPreset(region: SpriteRegion, preset: number[][]): Texture {
  if (!cachedBaseImg || !cachedColormapImg) {
    throw new Error("Ship images not preloaded");
  }

  const canvas = document.createElement("canvas");
  canvas.width = region.w;
  canvas.height = region.h;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    cachedBaseImg,
    region.x,
    region.y,
    region.w,
    region.h,
    0,
    0,
    region.w,
    region.h
  );

  const baseData = ctx.getImageData(0, 0, region.w, region.h);

  const cmCanvas = document.createElement("canvas");
  cmCanvas.width = region.w;
  cmCanvas.height = region.h;
  const cmCtx = cmCanvas.getContext("2d")!;
  cmCtx.drawImage(
    cachedColormapImg,
    region.x,
    region.y,
    region.w,
    region.h,
    0,
    0,
    region.w,
    region.h
  );
  const cmData = cmCtx.getImageData(0, 0, region.w, region.h);

  for (let i = 0; i < baseData.data.length; i += 4) {
    if (cmData.data[i + 3] === 0) continue;

    const gray = cmData.data[i];
    const idx = COLORMAP_GRAYS.findIndex((g) => Math.abs(gray - g) < 10);
    if (idx >= 0 && idx < preset.length) {
      baseData.data[i] = preset[idx][0];
      baseData.data[i + 1] = preset[idx][1];
      baseData.data[i + 2] = preset[idx][2];
    }
  }

  ctx.putImageData(baseData, 0, 0);
  return Texture.from(canvas);
}

function buildEngineFrames(engineTexture: Texture): Texture[] {
  const frames: Texture[] = [];
  for (let i = 0; i < ENGINE_FRAME_COUNT; i++) {
    frames.push(
      new Texture({
        source: engineTexture.source,
        frame: new Rectangle(
          i * ENGINE_FRAME_WIDTH,
          0,
          ENGINE_FRAME_WIDTH,
          ENGINE_FRAME_HEIGHT
        ),
      })
    );
  }
  return frames;
}

export function createShip(assets: Record<string, Texture>): ShipEntity {
  const regionIdx = Math.floor(Math.random() * SHIP_REGIONS.length);
  const region = SHIP_REGIONS[regionIdx];
  const presetIdx = Math.floor(Math.random() * COLOR_PRESETS.length);
  const preset = COLOR_PRESETS[presetIdx];

  const shipTexture = applyColorPreset(region, preset);
  const shipSprite = new Sprite(shipTexture);
  shipSprite.anchor.set(0.5);

  const engineAlias = ENGINE_ALIASES[Math.floor(Math.random() * ENGINE_ALIASES.length)];
  const engineTexture = assets[engineAlias];
  const engineFrames = buildEngineFrames(engineTexture);
  const engine = new AnimatedSprite(engineFrames);
  engine.animationSpeed = ENGINE_ANIMATION_SPEED;
  engine.play();
  engine.anchor.set(1, 0.5);
  engine.x = -region.w / 2;
  engine.y = 0;

  const container = new Container();
  container.addChild(engine);
  container.addChild(shipSprite);
  container.scale.set(SHIP_SCALE);

  const margin = 100;
  container.x = -region.w * SHIP_SCALE;
  container.y = margin + Math.random() * (CANVAS_HEIGHT - margin * 2);

  const speed = SHIP_SPEED_MIN + Math.random() * (SHIP_SPEED_MAX - SHIP_SPEED_MIN);

  return { container, vx: speed, vy: 0 };
}

export function updateShips(ships: ShipEntity[], dt: number): ShipEntity[] {
  return ships.filter((ship) => {
    ship.container.x += ship.vx * dt;
    ship.container.y += ship.vy * dt;

    if (ship.container.x > CANVAS_WIDTH + 200) {
      ship.container.destroy();
      return false;
    }
    return true;
  });
}
