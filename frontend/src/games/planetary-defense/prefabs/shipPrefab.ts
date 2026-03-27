import { Container, Sprite, AnimatedSprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { ShipState } from "../state";
import { ShipType } from "../types";
interface EngineOffset {
  x: number;
  y: number;
}

const ENGINE_POSITIONS: Record<ShipType, EngineOffset[]> = {
  [ShipType.Vanguard]: [{ x: -18, y: -5 }, { x: -18, y: 4 }],
  [ShipType.Sentinel]: [{ x: -10, y: 0 }],
  [ShipType.Corsair]: [{ x: -16, y: 0 }],
  [ShipType.Falcon]: [{ x: -15, y: 0 }],
  [ShipType.Scout]: [{ x: -6, y: 0 }],
  [ShipType.Dart]: [{ x: -12, y: 0 }],
  [ShipType.Wasp]: [{ x: -12, y: 0 }],
  [ShipType.Phoenix]: [{ x: -14, y: 0 }],
  [ShipType.Hawk]: [{ x: -14, y: -8 }, { x: -14, y: 6 }],
  [ShipType.Sparrow]: [{ x: -10, y: 0 }],
  [ShipType.Gnat]: [{ x: -10, y: 0 }],
  [ShipType.Stinger]: [{ x: -7, y: 0 }],
  [ShipType.Needle]: [{ x: -11, y: 0 }],
  [ShipType.Mite]: [{ x: -10, y: 0 }],
  [ShipType.Titan]: [{ x: -18, y: -8 }, { x: -18, y: 7 }],
  [ShipType.Raptor]: [{ x: -15, y: 0 }],
  [ShipType.Lance]: [{ x: -14, y: 0 }],
  [ShipType.Javelin]: [{ x: -21, y: 0 }],
  [ShipType.Pip]: [{ x: -7, y: 0 }],
  [ShipType.Raven]: [{ x: -15, y: -8 }, { x: -15, y: 6 }],
  [ShipType.Osprey]: [{ x: -4, y: 0 }],
  [ShipType.Leviathan]: [{ x: -25, y: 0 }],
  [ShipType.Talon]: [{ x: -14, y: 0 }],
  [ShipType.Hornet]: [{ x: -12, y: 0 }],
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

export function createShipContainer(
  assets: AssetManager,
  ship: ShipState
): Container {
  const shipTexture = assets.getShipTexture(ship.shipType, ship.colorPreset);

  const shipSprite = new Sprite(shipTexture);
  shipSprite.anchor.set(0.5);

  const container = new Container();

  const positions = ENGINE_POSITIONS[ship.shipType];
  const frames = assets.getEngineFrames(ship.engineType);

  for (const pos of positions) {
    const engine = new AnimatedSprite(frames);
    engine.animationSpeed = 0.15;
    engine.play();
    engine.anchor.set(0.5);
    engine.x = pos.x;
    engine.y = pos.y;
    container.addChild(engine);
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
