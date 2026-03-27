import { Application, Container, Sprite, AnimatedSprite, Text, TextStyle } from "pixi.js";
import { MANIFEST } from "./manifest";
import { AssetManager } from "./assetManager";
import { ShipType, EngineType, ColorPreset, SHIP_TYPE_COUNT } from "./types";

const SHIP_NAMES: string[] = [
  "Vanguard", "Sentinel", "Corsair", "Falcon", "Scout", "Dart", "Wasp", "Phoenix",
  "Hawk", "Sparrow", "Gnat", "Stinger", "Needle", "Mite", "Titan", "Raptor",
  "Lance", "Javelin", "Pip", "Raven", "Osprey", "Leviathan", "Talon", "Hornet",
  "Behemoth", "Dreadnought", "Marauder", "Eagle", "Pike", "Arrow", "Juggernaut", "Warden",
  "Specter", "Harrier", "Viper", "Flea", "Broadside", "Kestrel", "Finch", "Striker",
  "Robin", "Cricket", "Moth", "Colossus", "Cutlass", "Sabre", "Mantis", "Speck",
  "Crest", "Piston", "Vulture", "Orb", "Flicker", "Barb", "Sliver", "Flagship",
  "Aegis", "Bolt", "Spur", "Dot", "Rampart", "Clipper",
];

const ENGINE_POSITIONS: Record<number, { x: number; y: number }[]> = {
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

export async function createShipGrid(container: HTMLElement): Promise<Application> {
  const cols = 8;
  const rows = Math.ceil(SHIP_TYPE_COUNT / cols);
  const cellW = 200;
  const cellH = 120;
  const width = cols * cellW;
  const height = rows * cellH;

  const app = new Application();
  await app.init({
    width,
    height,
    background: 0x1a1a2e,
    antialias: false,
    resolution: 1,
    preserveDrawingBuffer: true,
  });

  app.canvas.style.width = "100%";
  app.canvas.style.height = "auto";
  container.appendChild(app.canvas);

  const assets = await AssetManager.load(MANIFEST);

  const labelStyle = new TextStyle({
    fontSize: 11,
    fill: 0xffffff,
    fontFamily: "monospace",
  });

  for (let i = 0; i < SHIP_TYPE_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2;

    const shipType = i as ShipType;
    const shipTexture = assets.getShipTexture(shipType, ColorPreset.Preset1);
    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);

    const shipContainer = new Container();

    const positions = ENGINE_POSITIONS[shipType] || [{ x: -10, y: 0 }];
    const frames = assets.getEngineFrames(EngineType.Engine1Big);

    for (const pos of positions) {
      const engine = new AnimatedSprite(frames);
      engine.animationSpeed = 0.15;
      engine.play();
      engine.anchor.set(0.5);
      engine.x = pos.x;
      engine.y = pos.y;
      shipContainer.addChild(engine);
    }

    shipContainer.addChild(shipSprite);
    shipContainer.scale.set(3);
    shipContainer.x = cx + 10;
    shipContainer.y = cy;

    app.stage.addChild(shipContainer);

    const engineCount = positions.length;
    const label = new Text({
      text: `${i}: ${SHIP_NAMES[i]} (${engineCount}e)`,
      style: labelStyle,
    });
    label.x = col * cellW + 4;
    label.y = row * cellH + 2;
    app.stage.addChild(label);
  }

  return app;
}
