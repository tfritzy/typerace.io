import { Container, Sprite, AnimatedSprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { ShipState } from "../state";
import { ShipType } from "../types";
interface EngineOffset {
  x: number;
  y: number;
}

const ENGINE_POSITIONS: Record<ShipType, EngineOffset[]> = {
  [ShipType.Vanguard]: [{ x: -16, y: -5 }, { x: -16, y: 4 }],
  [ShipType.Sentinel]: [{ x: -11, y: 0 }],
  [ShipType.Corsair]: [{ x: -16, y: 0 }],
  [ShipType.Falcon]: [{ x: -15, y: 0 }],
  [ShipType.Scout]: [{ x: -10, y: 0 }],
  [ShipType.Dart]: [{ x: -11, y: 0 }],
  [ShipType.Wasp]: [{ x: -12, y: 0 }],
  [ShipType.Phoenix]: [{ x: -13, y: 0 }],
  [ShipType.Hawk]: [{ x: -12, y: -8 }, { x: -12, y: 7 }],
  [ShipType.Sparrow]: [{ x: -11, y: 0 }],
  [ShipType.Gnat]: [{ x: -8, y: 0 }],
  [ShipType.Stinger]: [{ x: -12, y: 0 }],
  [ShipType.Needle]: [{ x: -11, y: 0 }],
  [ShipType.Mite]: [{ x: -8, y: 0 }],
  [ShipType.Titan]: [{ x: -16, y: -9 }, { x: -16, y: 8 }],
  [ShipType.Raptor]: [{ x: -13, y: 0 }],
  [ShipType.Lance]: [{ x: -16, y: 0 }],
  [ShipType.Javelin]: [{ x: -19, y: 0 }],
  [ShipType.Pip]: [{ x: -7, y: 0 }],
  [ShipType.Raven]: [{ x: -13, y: -9 }, { x: -13, y: 8 }],
  [ShipType.Osprey]: [{ x: -11, y: 0 }],
  [ShipType.Leviathan]: [{ x: -24, y: 0 }],
  [ShipType.Talon]: [{ x: -12, y: 0 }],
  [ShipType.Hornet]: [{ x: -10, y: 0 }],
  [ShipType.Behemoth]: [{ x: -16, y: -10 }, { x: -16, y: 9 }],
  [ShipType.Dreadnought]: [{ x: -28, y: -8 }, { x: -28, y: 6 }],
  [ShipType.Marauder]: [{ x: -19, y: -7 }, { x: -19, y: 6 }],
  [ShipType.Eagle]: [{ x: -14, y: 0 }],
  [ShipType.Pike]: [{ x: -10, y: 0 }],
  [ShipType.Arrow]: [{ x: -11, y: 0 }],
  [ShipType.Juggernaut]: [{ x: -18, y: 0 }],
  [ShipType.Warden]: [{ x: -16, y: -8 }, { x: -16, y: 7 }],
  [ShipType.Specter]: [{ x: -10, y: 0 }],
  [ShipType.Harrier]: [{ x: -14, y: -8 }, { x: -14, y: 6 }],
  [ShipType.Viper]: [{ x: -11, y: 0 }],
  [ShipType.Flea]: [{ x: -7, y: 0 }],
  [ShipType.Broadside]: [{ x: -18, y: -8 }, { x: -18, y: 7 }],
  [ShipType.Kestrel]: [{ x: -13, y: 0 }],
  [ShipType.Finch]: [{ x: -10, y: 0 }],
  [ShipType.Striker]: [{ x: -13, y: -8 }, { x: -13, y: 7 }],
  [ShipType.Robin]: [{ x: -10, y: 0 }],
  [ShipType.Cricket]: [{ x: -11, y: 0 }],
  [ShipType.Moth]: [{ x: -10, y: 0 }],
  [ShipType.Colossus]: [{ x: -19, y: -13 }, { x: -19, y: 12 }],
  [ShipType.Cutlass]: [{ x: -17, y: 0 }],
  [ShipType.Sabre]: [{ x: -17, y: 0 }],
  [ShipType.Mantis]: [{ x: -11, y: 0 }],
  [ShipType.Speck]: [{ x: -8, y: 0 }],
  [ShipType.Crest]: [{ x: -11, y: 0 }],
  [ShipType.Piston]: [{ x: -11, y: 0 }],
  [ShipType.Vulture]: [{ x: -13, y: -7 }, { x: -13, y: 6 }],
  [ShipType.Orb]: [{ x: -10, y: 0 }],
  [ShipType.Flicker]: [{ x: -10, y: 0 }],
  [ShipType.Barb]: [{ x: -12, y: 0 }],
  [ShipType.Sliver]: [{ x: -12, y: 0 }],
  [ShipType.Flagship]: [{ x: -19, y: -9 }, { x: -19, y: 8 }],
  [ShipType.Aegis]: [{ x: -12, y: -9 }, { x: -12, y: 8 }],
  [ShipType.Bolt]: [{ x: -12, y: 0 }],
  [ShipType.Spur]: [{ x: -13, y: 0 }],
  [ShipType.Dot]: [{ x: -9, y: 0 }],
  [ShipType.Rampart]: [{ x: -14, y: 0 }],
  [ShipType.Clipper]: [{ x: -11, y: 0 }],
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
