import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { ShipBlueprint } from "./shipCatalog";

export interface PlacedShip {
  blueprint: ShipBlueprint;
  x: number;
  y: number;
}

export class BuildingManager {
  readonly layer: Container;
  private assets: AssetManager;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  addShip(placed: PlacedShip): void {
    const bp = placed.blueprint;
    const tex = this.assets.getShipTexture(bp.entityType, bp.colorPreset);
    const sprite = new Sprite(tex);
    sprite.anchor.set(0.5);
    sprite.scale.set(3);
    sprite.x = placed.x;
    sprite.y = placed.y;
    this.layer.addChild(sprite);
  }

  destroy(): void {
    this.layer.destroy();
  }
}
