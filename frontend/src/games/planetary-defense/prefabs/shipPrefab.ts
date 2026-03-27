import { Container, Sprite, AnimatedSprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { ShipState } from "../state";
import { ShipType, EngineType } from "../types";
export interface EngineOffset {
  x: number;
  y: number;
}

export const ENGINE_POSITIONS: Record<ShipType, EngineOffset[]> = {
  [ShipType.Vanguard]: [{ x: -18, y: 0 }],
  [ShipType.Sentinel]: [{ x: -10, y: -1 }],
  [ShipType.Corsair]: [{ x: -16, y: -1 }],
  [ShipType.Falcon]: [{ x: -15, y: -1 }],
  [ShipType.Scout]: [{ x: -12, y: -7 }, { x: -12, y: 7 }],
  [ShipType.Dart]: [{ x: -12, y: -1 }],
  [ShipType.Wasp]: [{ x: -12, y: -1 }],
  [ShipType.Phoenix]: [{ x: -14, y: -1 }],
  [ShipType.Hawk]: [{ x: -14, y: -8 }, { x: -14, y: 6 }],
  [ShipType.Sparrow]: [{ x: -10, y: -1 }],
  [ShipType.Gnat]: [{ x: -10, y: -1 }],
  [ShipType.Stinger]: [{ x: -7, y: -1 }],
  [ShipType.Needle]: [{ x: -11, y: -1 }],
  [ShipType.Mite]: [{ x: -10, y: -1 }],
  [ShipType.Titan]: [{ x: -18, y: 0 }],
  [ShipType.Raptor]: [{ x: -13, y: -3 }, { x: -13, y: 3 }],
  [ShipType.Lance]: [{ x: -14, y: -1 }],
  [ShipType.Javelin]: [{ x: -21, y: -1 }],
  [ShipType.Pip]: [{ x: -7, y: 0 }],
  [ShipType.Raven]: [{ x: -15, y: 0 }],
  [ShipType.Osprey]: [],
  [ShipType.Leviathan]: [],
  [ShipType.Talon]: [],
  [ShipType.Hornet]: [],
  [ShipType.Behemoth]: [{ x: -18, y: -10 }, { x: -18, y: 8 }],
  [ShipType.Dreadnought]: [{ x: -30, y: -8 }, { x: -30, y: 6 }],
  [ShipType.Marauder]: [{ x: -22, y: -6 }, { x: -22, y: 4 }],
  [ShipType.Eagle]: [{ x: -16, y: 0 }],
  [ShipType.Pike]: [{ x: -8, y: 0 }],
  [ShipType.Arrow]: [{ x: -10, y: 0 }],
  [ShipType.Juggernaut]: [{ x: -18, y: 0 }],
  [ShipType.Warden]: [{ x: -18, y: -8 }, { x: -18, y: 6 }],
  [ShipType.Specter]: [{ x: -12, y: 0 }],
  [ShipType.Harrier]: [{ x: -16, y: -7 }, { x: -16, y: 6 }],
  [ShipType.Viper]: [{ x: -8, y: 0 }],
  [ShipType.Flea]: [{ x: -8, y: 0 }],
  [ShipType.Broadside]: [{ x: -20, y: -8 }, { x: -20, y: 7 }],
  [ShipType.Kestrel]: [{ x: -11, y: 0 }],
  [ShipType.Finch]: [{ x: -12, y: 0 }],
  [ShipType.Striker]: [{ x: -16, y: -8 }, { x: -16, y: 7 }],
  [ShipType.Robin]: [{ x: -10, y: 0 }],
  [ShipType.Cricket]: [{ x: -10, y: 0 }],
  [ShipType.Moth]: [{ x: -10, y: 0 }],
  [ShipType.Colossus]: [{ x: -22, y: -12 }, { x: -22, y: 12 }],
  [ShipType.Cutlass]: [{ x: -15, y: 0 }],
  [ShipType.Sabre]: [{ x: -16, y: 0 }],
  [ShipType.Mantis]: [{ x: -12, y: 0 }],
  [ShipType.Speck]: [{ x: -9, y: 0 }],
  [ShipType.Crest]: [{ x: -6, y: 0 }],
  [ShipType.Piston]: [{ x: -12, y: 0 }],
  [ShipType.Vulture]: [{ x: -15, y: -7 }, { x: -15, y: 6 }],
  [ShipType.Orb]: [{ x: -10, y: 0 }],
  [ShipType.Flicker]: [{ x: -12, y: 0 }],
  [ShipType.Barb]: [{ x: -10, y: 0 }],
  [ShipType.Sliver]: [{ x: -11, y: 0 }],
  [ShipType.Flagship]: [{ x: -21, y: -8 }, { x: -21, y: 6 }],
  [ShipType.Aegis]: [{ x: -14, y: -7 }, { x: -14, y: 6 }],
  [ShipType.Bolt]: [{ x: -14, y: 0 }],
  [ShipType.Spur]: [{ x: -15, y: 0 }],
  [ShipType.Dot]: [{ x: -10, y: 0 }],
  [ShipType.Rampart]: [{ x: -16, y: 0 }],
  [ShipType.Clipper]: [{ x: -10, y: 0 }],
};

export const SHIP_ENGINE_TYPE: Record<ShipType, EngineType | null> = {
  [ShipType.Vanguard]: EngineType.Engine1Big,
  [ShipType.Sentinel]: EngineType.Engine2Small,
  [ShipType.Corsair]: EngineType.Engine1Big,
  [ShipType.Falcon]: EngineType.Engine2Big,
  [ShipType.Scout]: EngineType.Engine1Small,
  [ShipType.Dart]: EngineType.Engine2Small,
  [ShipType.Wasp]: EngineType.Engine3Small,
  [ShipType.Phoenix]: EngineType.Engine3Big,
  [ShipType.Hawk]: EngineType.Engine2Big,
  [ShipType.Sparrow]: EngineType.Engine2Small,
  [ShipType.Gnat]: EngineType.Engine4Small,
  [ShipType.Stinger]: EngineType.Engine3Small,
  [ShipType.Needle]: EngineType.Engine2Small,
  [ShipType.Mite]: EngineType.Engine1Small,
  [ShipType.Titan]: EngineType.Engine1Big,
  [ShipType.Raptor]: EngineType.Engine1Small,
  [ShipType.Lance]: EngineType.Engine3Big,
  [ShipType.Javelin]: EngineType.Engine1Big,
  [ShipType.Pip]: EngineType.Engine4Small,
  [ShipType.Raven]: EngineType.Engine2Big,
  [ShipType.Osprey]: null,
  [ShipType.Leviathan]: null,
  [ShipType.Talon]: null,
  [ShipType.Hornet]: null,
  [ShipType.Behemoth]: EngineType.Engine1Big,
  [ShipType.Dreadnought]: EngineType.Engine1Big,
  [ShipType.Marauder]: EngineType.Engine2Big,
  [ShipType.Eagle]: EngineType.Engine3Big,
  [ShipType.Pike]: EngineType.Engine4Small,
  [ShipType.Arrow]: EngineType.Engine2Small,
  [ShipType.Juggernaut]: EngineType.Engine1Big,
  [ShipType.Warden]: EngineType.Engine2Big,
  [ShipType.Specter]: EngineType.Engine4Small,
  [ShipType.Harrier]: EngineType.Engine3Big,
  [ShipType.Viper]: EngineType.Engine2Small,
  [ShipType.Flea]: EngineType.Engine4Small,
  [ShipType.Broadside]: EngineType.Engine1Big,
  [ShipType.Kestrel]: EngineType.Engine3Big,
  [ShipType.Finch]: EngineType.Engine2Small,
  [ShipType.Striker]: EngineType.Engine3Big,
  [ShipType.Robin]: EngineType.Engine2Small,
  [ShipType.Cricket]: EngineType.Engine4Small,
  [ShipType.Moth]: EngineType.Engine4Small,
  [ShipType.Colossus]: EngineType.Engine1Big,
  [ShipType.Cutlass]: EngineType.Engine2Big,
  [ShipType.Sabre]: EngineType.Engine2Big,
  [ShipType.Mantis]: EngineType.Engine3Small,
  [ShipType.Speck]: EngineType.Engine4Small,
  [ShipType.Crest]: EngineType.Engine2Small,
  [ShipType.Piston]: EngineType.Engine3Small,
  [ShipType.Vulture]: EngineType.Engine3Big,
  [ShipType.Orb]: EngineType.Engine2Small,
  [ShipType.Flicker]: EngineType.Engine2Small,
  [ShipType.Barb]: EngineType.Engine3Small,
  [ShipType.Sliver]: EngineType.Engine3Small,
  [ShipType.Flagship]: EngineType.Engine1Big,
  [ShipType.Aegis]: EngineType.Engine3Big,
  [ShipType.Bolt]: EngineType.Engine3Small,
  [ShipType.Spur]: EngineType.Engine3Big,
  [ShipType.Dot]: EngineType.Engine4Small,
  [ShipType.Rampart]: EngineType.Engine3Big,
  [ShipType.Clipper]: EngineType.Engine2Small,
};

export function createShipContainer(
  assets: AssetManager,
  ship: ShipState
): Container {
  const shipTexture = assets.getShipTexture(ship.shipType, ship.colorPreset);

  const shipSprite = new Sprite(shipTexture);
  shipSprite.anchor.set(0.5);

  const container = new Container();

  const positions = ENGINE_POSITIONS[ship.shipType];
  const engineType = SHIP_ENGINE_TYPE[ship.shipType];

  if (engineType !== null && positions.length > 0) {
    const frames = assets.getEngineFrames(engineType);
    for (const pos of positions) {
      const engine = new AnimatedSprite(frames);
      engine.animationSpeed = 0.15;
      engine.play();
      engine.anchor.set(0.5);
      engine.x = pos.x;
      engine.y = pos.y;
      container.addChild(engine);
    }
  }

  container.addChild(shipSprite);

  if (ship.hasShield) {
    const shieldTexture = assets.getShieldTexture(ship.shipType);
    const shield = new Sprite(shieldTexture);
    shield.anchor.set(0.5);
    shield.alpha = 0.6;
    container.addChild(shield);
  }

  container.scale.set(3);
  container.x = ship.x;
  container.y = ship.y;

  return container;
}
