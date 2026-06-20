import { Application, Container, Sprite, Text, TextStyle } from "pixi.js";
import { MANIFEST } from "./manifest";
import { AssetManager } from "./assetManager";
import { ColorPreset, SHIP_ENTITY_TYPES } from "./types";

export async function createShipGrid(container: HTMLElement): Promise<Application> {
  const cols = 8;
  const rows = Math.ceil(SHIP_ENTITY_TYPES.length / cols);
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

  for (let i = 0; i < SHIP_ENTITY_TYPES.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = col * cellW + cellW / 2;
    const cy = row * cellH + cellH / 2;

    const entityType = SHIP_ENTITY_TYPES[i];
    const shipTexture = assets.getShipTexture(entityType, ColorPreset.Preset1);
    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);

    const shipContainer = new Container();
    shipContainer.addChild(shipSprite);
    shipContainer.scale.set(3);
    shipContainer.x = cx + 10;
    shipContainer.y = cy;

    app.stage.addChild(shipContainer);

    const label = new Text({
      text: `${i}: ${entityType}`,
      style: labelStyle,
    });
    label.x = col * cellW + 4;
    label.y = row * cellH + 2;
    app.stage.addChild(label);
  }

  return app;
}
