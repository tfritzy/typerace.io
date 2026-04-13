import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import { GRID_CELL } from "./shipCatalog";
import type { PlacedShip } from "./PlacementGrid";

export class BuildingManager {
  readonly layer: Container;
  private assets: AssetManager;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  addShip(placed: PlacedShip): void {
    const bp = placed.blueprint;
    const occ = bp.occupancy;
    const occW = occ[0].length;
    const occH = occ.length;

    const tex = this.assets.getShipTexture(bp.entityType, bp.colorPreset);
    const sprite = new Sprite(tex);
    sprite.anchor.set(0.5);
    sprite.scale.set(3);
    sprite.x = (placed.gridCol + occW / 2) * GRID_CELL;
    sprite.y = (placed.gridRow + occH / 2) * GRID_CELL;
    sprite.rotation = 0;
    this.layer.addChild(sprite);
  }

  destroy(): void {
    this.layer.destroy();
  }
}
