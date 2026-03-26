import { Container, Sprite, AnimatedSprite, type Spritesheet, type Texture } from "pixi.js";
import {
  SHIP_SCALE,
  SHIP_SPEED_MIN,
  SHIP_SPEED_MAX,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "./constants";
import { ENGINE_ALIASES, COLOR_PRESET_ALIASES } from "./manifest";
import { createPaletteSwapFilter } from "./paletteSwap";

export interface ShipEntity {
  container: Container;
  vx: number;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function createShip(
  shipsSheet: Spritesheet,
  colormapSheet: Spritesheet,
  engineSheets: Record<string, Spritesheet>,
  presetTextures: Record<string, Texture>
): ShipEntity {
  const shipFrameNames = Object.keys(shipsSheet.textures);
  const frameName = pickRandom(shipFrameNames);

  const shipSprite = new Sprite(shipsSheet.textures[frameName]);
  shipSprite.anchor.set(0.5);
  shipSprite.texture.source.style.scaleMode = "nearest";

  const presetAlias = pickRandom(COLOR_PRESET_ALIASES);
  const filter = createPaletteSwapFilter(
    colormapSheet,
    presetTextures[presetAlias],
    frameName
  );
  shipSprite.filters = [filter];

  const engineAlias = pickRandom(ENGINE_ALIASES);
  const engineSheet = engineSheets[engineAlias];
  const engineFrames = engineSheet.animations[engineAlias];
  const engine = new AnimatedSprite(engineFrames);
  engine.animationSpeed = 0.15;
  engine.play();
  engine.anchor.set(1, 0.5);
  engine.x = -shipSprite.width / 2;

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
