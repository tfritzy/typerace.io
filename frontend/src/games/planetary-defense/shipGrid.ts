import { Application, Container, Sprite, AnimatedSprite, Text, TextStyle } from "pixi.js";
import { MANIFEST } from "./manifest";
import { AssetManager } from "./assetManager";
import { ShipType, ColorPreset, SHIP_TYPE_COUNT } from "./types";
import { ENGINE_POSITIONS, SHIP_ENGINE_TYPE } from "./prefabs/shipPrefab";

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

    const positions = ENGINE_POSITIONS[shipType] || [];
    const engineType = SHIP_ENGINE_TYPE[shipType];

    if (engineType !== null && positions.length > 0) {
      const frames = assets.getEngineFrames(engineType);
      for (const pos of positions) {
        const engine = new AnimatedSprite(frames);
        engine.animationSpeed = 0.15;
        engine.play();
        engine.anchor.set(0.5);
        engine.x = pos.x;
        engine.y = pos.y;
        shipContainer.addChild(engine);
      }
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
