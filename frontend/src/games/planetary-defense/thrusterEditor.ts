import {
  Application,
  Container,
  Sprite,
  AnimatedSprite,
  Text,
  TextStyle,
  Graphics,
  FederatedPointerEvent,
} from "pixi.js";
import { MANIFEST } from "./manifest";
import { AssetManager } from "./assetManager";
import { ShipType, EngineType, ColorPreset, SHIP_TYPE_COUNT } from "./types";
import { ENGINE_POSITIONS, SHIP_ENGINE_TYPE } from "./prefabs/shipPrefab";
import type { EngineOffset } from "./prefabs/shipPrefab";

export const SHIP_NAMES: string[] = [
  "Vanguard", "Sentinel", "Corsair", "Falcon", "Scout", "Dart", "Wasp", "Phoenix",
  "Hawk", "Sparrow", "Gnat", "Stinger", "Needle", "Mite", "Titan", "Raptor",
  "Lance", "Javelin", "Pip", "Raven", "Osprey", "Leviathan", "Talon", "Hornet",
  "Behemoth", "Dreadnought", "Marauder", "Eagle", "Pike", "Arrow", "Juggernaut", "Warden",
  "Specter", "Harrier", "Viper", "Flea", "Broadside", "Kestrel", "Finch", "Striker",
  "Robin", "Cricket", "Moth", "Colossus", "Cutlass", "Sabre", "Mantis", "Speck",
  "Crest", "Piston", "Vulture", "Orb", "Flicker", "Barb", "Sliver", "Flagship",
  "Aegis", "Bolt", "Spur", "Dot", "Rampart", "Clipper",
];

const ENGINE_TYPE_NAMES: Record<number, string> = {
  [EngineType.Engine1Big]: "1-Big",
  [EngineType.Engine1Small]: "1-Small",
  [EngineType.Engine2Big]: "2-Big",
  [EngineType.Engine2Small]: "2-Small",
  [EngineType.Engine3Big]: "3-Big",
  [EngineType.Engine3Small]: "3-Small",
  [EngineType.Engine4Big]: "4-Big",
  [EngineType.Engine4Small]: "4-Small",
};

const ALL_ENGINE_TYPES: (EngineType | null)[] = [
  null,
  EngineType.Engine1Big,
  EngineType.Engine1Small,
  EngineType.Engine2Big,
  EngineType.Engine2Small,
  EngineType.Engine3Big,
  EngineType.Engine3Small,
  EngineType.Engine4Big,
  EngineType.Engine4Small,
];

interface ShipConfig {
  positions: EngineOffset[];
  engineType: EngineType | null;
}

export interface ThrusterEditorCallbacks {
  onConfigChange: (configs: Record<number, ShipConfig>) => void;
}

export async function createThrusterEditor(
  container: HTMLElement,
  callbacks: ThrusterEditorCallbacks
): Promise<Application> {
  const cols = 4;
  const rows = Math.ceil(SHIP_TYPE_COUNT / cols);
  const cellW = 350;
  const cellH = 200;
  const width = cols * cellW;
  const height = rows * cellH;

  const app = new Application();
  await app.init({
    width,
    height,
    background: 0x1a1a2e,
    antialias: false,
    resolution: 1,
  });

  app.canvas.style.width = "100%";
  app.canvas.style.height = "auto";
  container.appendChild(app.canvas);

  const assets = await AssetManager.load(MANIFEST);

  const configs: Record<number, ShipConfig> = {};
  for (let i = 0; i < SHIP_TYPE_COUNT; i++) {
    const shipType = i as ShipType;
    configs[i] = {
      positions: (ENGINE_POSITIONS[shipType] || []).map((p) => ({ ...p })),
      engineType: SHIP_ENGINE_TYPE[shipType],
    };
  }

  const shipContainers: Container[] = [];

  const labelStyle = new TextStyle({
    fontSize: 12,
    fill: 0xffffff,
    fontFamily: "monospace",
  });

  const smallStyle = new TextStyle({
    fontSize: 10,
    fill: 0xaaaaaa,
    fontFamily: "monospace",
  });

  let dragState: {
    shipIndex: number;
    engineIndex: number;
    handle: Graphics;
    innerContainer: Container;
    offsetX: number;
    offsetY: number;
  } | null = null;

  function rebuildShip(i: number) {
    const old = shipContainers[i];
    if (old) {
      old.destroy({ children: true });
    }

    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2 + 10;

    const shipType = i as ShipType;
    const config = configs[i];

    const cellContainer = new Container();
    cellContainer.x = 0;
    cellContainer.y = 0;

    const shipTexture = assets.getShipTexture(shipType, ColorPreset.Preset1);
    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);

    const innerContainer = new Container();

    if (config.engineType !== null && config.positions.length > 0) {
      const frames = assets.getEngineFrames(config.engineType);
      for (let ei = 0; ei < config.positions.length; ei++) {
        const pos = config.positions[ei];

        const engine = new AnimatedSprite(frames);
        engine.animationSpeed = 0.15;
        engine.play();
        engine.anchor.set(0.5);
        engine.x = pos.x;
        engine.y = pos.y;
        innerContainer.addChild(engine);

        const handle = new Graphics();
        handle.circle(0, 0, 4);
        handle.fill({ color: 0xff0000, alpha: 0.8 });
        handle.circle(0, 0, 6);
        handle.stroke({ color: 0xff0000, width: 1, alpha: 0.5 });
        handle.x = pos.x;
        handle.y = pos.y;
        handle.eventMode = "static";
        handle.cursor = "grab";

        const engineIndex = ei;

        handle.on("pointerdown", (e: FederatedPointerEvent) => {
          const local = innerContainer.toLocal(e.global);
          dragState = {
            shipIndex: i,
            engineIndex,
            handle,
            innerContainer,
            offsetX: handle.x - local.x,
            offsetY: handle.y - local.y,
          };
          handle.cursor = "grabbing";
          e.stopPropagation();
        });

        innerContainer.addChild(handle);
      }
    }

    innerContainer.addChild(shipSprite);
    innerContainer.scale.set(3);
    innerContainer.x = cx;
    innerContainer.y = cy;

    cellContainer.addChild(innerContainer);

    const nameLabel = new Text({
      text: `${i}: ${SHIP_NAMES[i]}`,
      style: labelStyle,
    });
    nameLabel.x = col * cellW + 4;
    nameLabel.y = row * cellH + 2;
    cellContainer.addChild(nameLabel);

    const engineLabel = new Text({
      text: getEngineLabel(config),
      style: smallStyle,
    });
    engineLabel.x = col * cellW + 4;
    engineLabel.y = row * cellH + 16;
    (cellContainer as Container & { engineLabel?: Text }).engineLabel =
      engineLabel;
    cellContainer.addChild(engineLabel);

    const border = new Graphics();
    border.rect(col * cellW, row * cellH, cellW, cellH);
    border.stroke({ color: 0x333355, width: 1 });
    cellContainer.addChild(border);

    app.stage.addChild(cellContainer);
    shipContainers[i] = cellContainer;
  }

  function getEngineLabel(config: ShipConfig): string {
    const typeName =
      config.engineType !== null
        ? ENGINE_TYPE_NAMES[config.engineType]
        : "None";
    const posStr = config.positions
      .map((p) => `(${p.x},${p.y})`)
      .join(" ");
    return `Type: ${typeName} | ${config.positions.length}e ${posStr}`;
  }

  function updateLabel(i: number) {
    const cont = shipContainers[i] as Container & { engineLabel?: Text };
    if (cont?.engineLabel) {
      cont.engineLabel.text = getEngineLabel(configs[i]);
    }
  }

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;

  app.stage.on("pointermove", (e: FederatedPointerEvent) => {
    if (!dragState) return;
    const { engineIndex, handle, innerContainer, offsetX, offsetY, shipIndex } = dragState;
    const local = innerContainer.toLocal(e.global);
    const newX = Math.round(local.x + offsetX);
    const newY = Math.round(local.y + offsetY);
    handle.x = newX;
    handle.y = newY;

    const engineSprites = innerContainer.children.filter(
      (c) => c instanceof AnimatedSprite
    ) as AnimatedSprite[];
    if (engineSprites[engineIndex]) {
      engineSprites[engineIndex].x = newX;
      engineSprites[engineIndex].y = newY;
    }

    configs[shipIndex].positions[engineIndex] = { x: newX, y: newY };
    updateLabel(shipIndex);
    callbacks.onConfigChange({ ...configs });
  });

  app.stage.on("pointerup", () => {
    if (dragState) {
      dragState.handle.cursor = "grab";
      dragState = null;
    }
  });

  for (let i = 0; i < SHIP_TYPE_COUNT; i++) {
    rebuildShip(i);
  }

  (app as Application & { configs: Record<number, ShipConfig> }).configs = configs;
  (app as Application & { rebuildShip: (i: number) => void }).rebuildShip = rebuildShip;
  (app as Application & { callbacks: ThrusterEditorCallbacks }).callbacks = callbacks;

  return app;
}

export function cycleEngineType(
  app: Application,
  shipIndex: number,
  direction: 1 | -1
): void {
  const extended = app as Application & {
    configs: Record<number, ShipConfig>;
    rebuildShip: (i: number) => void;
    callbacks: ThrusterEditorCallbacks;
  };
  const config = extended.configs[shipIndex];
  if (!config) return;

  const currentIdx = ALL_ENGINE_TYPES.indexOf(config.engineType);
  let nextIdx = currentIdx + direction;
  if (nextIdx < 0) nextIdx = ALL_ENGINE_TYPES.length - 1;
  if (nextIdx >= ALL_ENGINE_TYPES.length) nextIdx = 0;

  config.engineType = ALL_ENGINE_TYPES[nextIdx];
  extended.rebuildShip(shipIndex);
  extended.callbacks.onConfigChange({ ...extended.configs });
}

export function addEngine(app: Application, shipIndex: number): void {
  const extended = app as Application & {
    configs: Record<number, ShipConfig>;
    rebuildShip: (i: number) => void;
    callbacks: ThrusterEditorCallbacks;
  };
  const config = extended.configs[shipIndex];
  if (!config) return;

  if (config.engineType === null) {
    config.engineType = EngineType.Engine1Small;
  }

  config.positions.push({ x: -10, y: 0 });
  extended.rebuildShip(shipIndex);
  extended.callbacks.onConfigChange({ ...extended.configs });
}

export function removeEngine(app: Application, shipIndex: number): void {
  const extended = app as Application & {
    configs: Record<number, ShipConfig>;
    rebuildShip: (i: number) => void;
    callbacks: ThrusterEditorCallbacks;
  };
  const config = extended.configs[shipIndex];
  if (!config || config.positions.length === 0) return;

  config.positions.pop();
  if (config.positions.length === 0) {
    config.engineType = null;
  }

  extended.rebuildShip(shipIndex);
  extended.callbacks.onConfigChange({ ...extended.configs });
}

export function exportConfig(app: Application): string {
  const extended = app as Application & {
    configs: Record<number, ShipConfig>;
  };

  const engineTypeToStr = (et: EngineType | null): string => {
    if (et === null) return "null";
    return `EngineType.${EngineType[et]}`;
  };

  const shipTypeNames = Object.keys(ShipType).filter((k) => isNaN(Number(k)));

  let positionsCode = "export const ENGINE_POSITIONS: Record<ShipType, EngineOffset[]> = {\n";
  let engineTypeCode = "export const SHIP_ENGINE_TYPE: Record<ShipType, EngineType | null> = {\n";

  for (let i = 0; i < SHIP_TYPE_COUNT; i++) {
    const config = extended.configs[i];
    const name = shipTypeNames[i];

    if (config.positions.length === 0) {
      positionsCode += `  [ShipType.${name}]: [],\n`;
    } else {
      const posStr = config.positions
        .map((p) => `{ x: ${p.x}, y: ${p.y} }`)
        .join(", ");
      positionsCode += `  [ShipType.${name}]: [${posStr}],\n`;
    }

    engineTypeCode += `  [ShipType.${name}]: ${engineTypeToStr(config.engineType)},\n`;
  }

  positionsCode += "};\n";
  engineTypeCode += "};\n";

  return positionsCode + "\n" + engineTypeCode;
}
