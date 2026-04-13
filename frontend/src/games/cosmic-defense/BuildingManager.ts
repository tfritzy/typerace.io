import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { EntityType } from "./types";
import { ColorPreset } from "./types";
import { SHIP_BLUEPRINTS } from "./shipCatalog";

const BLUEPRINT_MAP = new Map(
  SHIP_BLUEPRINTS.map((bp) => [bp.entityType, bp])
);

export class BuildingManager {
  readonly layer: Container;
  private assets: AssetManager;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  addShip(entityType: EntityType, x: number, y: number): void {
    const bp = BLUEPRINT_MAP.get(entityType);
    const preset = bp?.colorPreset ?? ColorPreset.Preset1;
    const tex = this.assets.getShipTexture(entityType, preset);
    const sprite = new Sprite(tex);
    sprite.anchor.set(0.5);
    sprite.scale.set(3);
    sprite.x = x;
    sprite.y = y;
    this.layer.addChild(sprite);
  }

  destroy(): void {
    this.layer.destroy();
  }
}
