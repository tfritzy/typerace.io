import { Container, Texture, Sprite, AnimatedSprite, type Spritesheet } from "pixi.js";
import {
  SHIP_SCALE,
  SHIP_SPEED_MIN,
  SHIP_SPEED_MAX,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "./constants";
import { ENGINE_ALIASES, COLOR_PRESET_ALIASES } from "./manifest";

export interface ShipEntity {
  container: Container;
  vx: number;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function textureToCanvas(
  texture: Texture
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const frame = texture.frame;
  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d")!;

  const source = texture.source;
  const resource = source.resource as HTMLImageElement;
  ctx.drawImage(
    resource,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    0,
    0,
    frame.width,
    frame.height
  );

  return { canvas, ctx };
}

function applyPaletteSwap(
  shipTexture: Texture,
  colormapTexture: Texture,
  presetTexture: Texture
): Texture {
  const { canvas, ctx } = textureToCanvas(shipTexture);
  const baseData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const { ctx: cmCtx } = textureToCanvas(colormapTexture);
  const cmData = cmCtx.getImageData(0, 0, canvas.width, canvas.height);

  const { ctx: presetCtx } = textureToCanvas(presetTexture);
  const presetData = presetCtx.getImageData(0, 0, presetTexture.frame.width, 1);

  for (let i = 0; i < baseData.data.length; i += 4) {
    if (cmData.data[i + 3] === 0) continue;

    const gray = cmData.data[i];
    const presetIdx = Math.round((gray / 255) * (presetData.width - 1));
    const pi = presetIdx * 4;

    baseData.data[i] = presetData.data[pi];
    baseData.data[i + 1] = presetData.data[pi + 1];
    baseData.data[i + 2] = presetData.data[pi + 2];
  }

  ctx.putImageData(baseData, 0, 0);
  const tex = Texture.from({ resource: canvas });
  tex.source.style.scaleMode = "nearest";
  return tex;
}

export function createShip(
  shipsSheet: Spritesheet,
  colormapSheet: Spritesheet,
  engineSheets: Record<string, Spritesheet>,
  presetTextures: Record<string, Texture>
): ShipEntity {
  const shipFrameNames = Object.keys(shipsSheet.textures);
  const frameName = pickRandom(shipFrameNames);

  const cmFrameName = `cm-${frameName.replace("ship-", "")}`;
  const presetAlias = pickRandom(COLOR_PRESET_ALIASES);

  const shipTexture = applyPaletteSwap(
    shipsSheet.textures[frameName],
    colormapSheet.textures[cmFrameName],
    presetTextures[presetAlias]
  );

  const shipSprite = new Sprite(shipTexture);
  shipSprite.anchor.set(0.5);

  const engineAlias = pickRandom(ENGINE_ALIASES);
  const engineSheet = engineSheets[engineAlias];
  const engineFrames = engineSheet.animations[engineAlias];
  const engine = new AnimatedSprite(engineFrames);
  engine.animationSpeed = 0.15;
  engine.play();
  engine.anchor.set(0.5);
  engine.x = -(shipTexture.width / 2) + 2;

  const container = new Container();
  container.addChild(engine);
  container.addChild(shipSprite);
  container.scale.set(SHIP_SCALE);

  container.x = -100;
  container.y = 100 + Math.random() * (CANVAS_HEIGHT - 200);

  const speed = SHIP_SPEED_MIN + Math.random() * (SHIP_SPEED_MAX - SHIP_SPEED_MIN);

  return { container, vx: speed };
}

export function updateShips(ships: ShipEntity[], dt: number): ShipEntity[] {
  return ships.filter((ship) => {
    ship.container.x += ship.vx * dt;
    if (ship.container.x > CANVAS_WIDTH + 200) {
      ship.container.destroy();
      return false;
    }
    return true;
  });
}
