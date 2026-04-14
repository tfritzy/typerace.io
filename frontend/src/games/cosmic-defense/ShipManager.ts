import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, EntityState } from "./state";
import { spawnAlliedEntity } from "./state";
import { FRIENDLY_CONFIG_MAP } from "./enemyConfig";
import { SHIP_BLUEPRINTS } from "./shipCatalog";
import { Team } from "./types";
import type { EntityType } from "./types";

const BLUEPRINT_MAP = new Map(
  SHIP_BLUEPRINTS.map((bp) => [bp.entityType, bp])
);

export class ShipManager {
  readonly layer: Container;
  private assets: AssetManager;
  private entityDisplayObjects = new Map<number, Container>();
  private activeEntityIds = new Set<number>();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  addShip(state: GameState, entityType: EntityType, x: number, y: number): void {
    const config = FRIENDLY_CONFIG_MAP.get(entityType);
    if (!config) return;
    const bp = BLUEPRINT_MAP.get(entityType);
    spawnAlliedEntity(state, config, bp?.colorPreset ?? 0, x, y);
  }

  update(state: GameState): void {
    this.syncRendering(state);
  }

  private createDisplayObject(entity: EntityState): Container {
    const shipTexture = this.assets.getShipTexture(entity.entityType, entity.colorPreset);
    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);

    const container = new Container();
    container.addChild(shipSprite);
    container.scale.set(3);
    container.x = entity.x;
    container.y = entity.y;

    return container;
  }

  private syncRendering(state: GameState): void {
    this.activeEntityIds.clear();

    for (const entity of state.entities) {
      if (entity.team !== Team.Allied) continue;
      this.activeEntityIds.add(entity.id);
      let display = this.entityDisplayObjects.get(entity.id);
      if (!display) {
        display = this.createDisplayObject(entity);
        this.layer.addChild(display);
        this.entityDisplayObjects.set(entity.id, display);
      }
      display.x = entity.x;
      display.y = entity.y;
      display.rotation = entity.rotation;
    }

    for (const [id, display] of this.entityDisplayObjects) {
      if (!this.activeEntityIds.has(id)) {
        display.destroy();
        this.entityDisplayObjects.delete(id);
      }
    }
  }

  destroy(): void {
    for (const d of this.entityDisplayObjects.values()) d.destroy();
    this.entityDisplayObjects.clear();
    this.layer.destroy();
  }
}
