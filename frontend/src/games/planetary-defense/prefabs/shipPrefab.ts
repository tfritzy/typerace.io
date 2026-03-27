import { Container, Sprite, AnimatedSprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { ShipState } from "../state";
import { ShipType } from "../types";
import { SHIP_SCALE } from "../constants";

interface EngineOffset {
  x: number;
  y: number;
}

const ENGINE_POSITIONS: Record<ShipType, EngineOffset[]> = {
  [ShipType.Vanguard]: [{ x: -16, y: -5 }, { x: -16, y: 4 }],
  [ShipType.Sentinel]: [{ x: -11, y: -10 }, { x: -11, y: 10 }],
  [ShipType.Corsair]: [{ x: -16, y: 0 }],
  [ShipType.Falcon]: [{ x: -15, y: -6 }, { x: -15, y: 4 }],
  [ShipType.Scout]: [{ x: -10, y: -7 }, { x: -10, y: 6 }],
  [ShipType.Dart]: [{ x: -11, y: 0 }],
  [ShipType.Wasp]: [{ x: -12, y: 0 }],
  [ShipType.Phoenix]: [{ x: -13, y: 0 }],
  [ShipType.Hawk]: [{ x: -12, y: -8 }, { x: -12, y: 6 }],
  [ShipType.Sparrow]: [{ x: -12, y: 0 }],
  [ShipType.Gnat]: [{ x: -8, y: 0 }],
  [ShipType.Stinger]: [{ x: -12, y: -6 }, { x: -12, y: 5 }],
  [ShipType.Needle]: [{ x: -11, y: -4 }, { x: -11, y: 4 }],
  [ShipType.Mite]: [{ x: -8, y: 0 }],
  [ShipType.Titan]: [{ x: -16, y: -8 }, { x: -16, y: 6 }],
  [ShipType.Raptor]: [{ x: -13, y: 0 }],
  [ShipType.Lance]: [{ x: -16, y: -6 }, { x: -16, y: 4 }],
  [ShipType.Javelin]: [{ x: -19, y: 0 }],
  [ShipType.Pip]: [{ x: -7, y: 0 }],
  [ShipType.Raven]: [{ x: -13, y: 0 }],
  [ShipType.Osprey]: [{ x: -11, y: -6 }, { x: -11, y: 5 }],
  [ShipType.Leviathan]: [{ x: -24, y: -6 }, { x: -24, y: 4 }],
  [ShipType.Talon]: [{ x: -12, y: 0 }],
  [ShipType.Hornet]: [{ x: -10, y: 0 }],
  [ShipType.Behemoth]: [{ x: -16, y: -8 }, { x: -16, y: 8 }],
  [ShipType.Dreadnought]: [{ x: -28, y: -8 }, { x: -28, y: 6 }],
  [ShipType.Marauder]: [{ x: -20, y: -6 }, { x: -20, y: 4 }],
  [ShipType.Eagle]: [{ x: -14, y: 0 }],
  [ShipType.Pike]: [{ x: -10, y: -6 }, { x: -10, y: 4 }],
  [ShipType.Arrow]: [{ x: -12, y: 0 }],
  [ShipType.Juggernaut]: [{ x: -18, y: -4 }, { x: -18, y: 4 }],
  [ShipType.Warden]: [{ x: -16, y: -7 }, { x: -16, y: 6 }],
  [ShipType.Specter]: [{ x: -10, y: 0 }],
  [ShipType.Harrier]: [{ x: -14, y: -7 }, { x: -14, y: 6 }],
  [ShipType.Viper]: [{ x: -12, y: -8 }, { x: -12, y: 7 }],
  [ShipType.Flea]: [{ x: -8, y: 0 }],
  [ShipType.Broadside]: [{ x: -18, y: -8 }, { x: -18, y: 7 }],
  [ShipType.Kestrel]: [{ x: -13, y: -6 }, { x: -13, y: 6 }],
  [ShipType.Finch]: [{ x: -10, y: 0 }],
  [ShipType.Striker]: [{ x: -14, y: -7 }, { x: -14, y: 7 }],
  [ShipType.Robin]: [{ x: -10, y: 0 }],
  [ShipType.Cricket]: [{ x: -12, y: -7 }, { x: -12, y: 6 }],
  [ShipType.Moth]: [{ x: -10, y: 0 }],
  [ShipType.Colossus]: [{ x: -20, y: -12 }, { x: -20, y: 12 }],
  [ShipType.Cutlass]: [{ x: -17, y: -6 }, { x: -17, y: 6 }],
  [ShipType.Sabre]: [{ x: -18, y: -8 }, { x: -18, y: 7 }],
  [ShipType.Mantis]: [{ x: -12, y: 0 }],
  [ShipType.Speck]: [{ x: -8, y: 0 }],
  [ShipType.Crest]: [{ x: -11, y: -8 }, { x: -11, y: 8 }],
  [ShipType.Piston]: [{ x: -12, y: 0 }],
  [ShipType.Vulture]: [{ x: -13, y: -7 }, { x: -13, y: 6 }],
  [ShipType.Orb]: [{ x: -10, y: 0 }],
  [ShipType.Flicker]: [{ x: -10, y: 0 }],
  [ShipType.Barb]: [{ x: -12, y: -6 }, { x: -12, y: 6 }],
  [ShipType.Sliver]: [{ x: -12, y: 0 }],
  [ShipType.Flagship]: [{ x: -19, y: -8 }, { x: -19, y: 6 }],
  [ShipType.Aegis]: [{ x: -12, y: -8 }, { x: -12, y: 6 }],
  [ShipType.Bolt]: [{ x: -12, y: 0 }],
  [ShipType.Spur]: [{ x: -13, y: 0 }],
  [ShipType.Dot]: [{ x: -10, y: -6 }, { x: -10, y: 4 }],
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
  container.scale.set(SHIP_SCALE);
  container.x = ship.x;
  container.y = ship.y;

  return container;
}
