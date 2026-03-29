import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState } from "./state";
import { spawnShip, spawnMeteor } from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import { createMeteorSprite } from "./prefabs/meteorPrefab";

export interface LabelData {
  id: number;
  word: string;
  typedCount: number;
  x: number;
  y: number;
}

export class EnemyManager {
  readonly shipLayer: Container;
  readonly meteorLayer: Container;

  labels: LabelData[] = [];

  private assets: AssetManager;
  private shipContainers = new Map<number, Container>();
  private meteorSprites = new Map<number, Sprite>();
  private activeEntityIds = new Set<number>();
  private shipSpawnTimer = 0;
  private meteorSpawnTimer = 0;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.shipLayer = new Container();
    this.meteorLayer = new Container();
  }

  update(state: GameState, dt: number): void {
    this.shipSpawnTimer += dt;
    if (this.shipSpawnTimer >= 9) {
      this.shipSpawnTimer = 0;
      spawnShip(state);
    }

    this.meteorSpawnTimer += dt;
    if (this.meteorSpawnTimer >= 4.5) {
      this.meteorSpawnTimer = 0;
      spawnMeteor(state);
    }

    this.syncRendering(state);
  }

  private syncRendering(state: GameState): void {
    this.activeEntityIds.clear();
    this.labels.length = 0;

    for (const ship of state.ships) {
      this.activeEntityIds.add(ship.id);
      let container = this.shipContainers.get(ship.id);
      if (!container) {
        container = createShipContainer(this.assets, ship);
        this.shipLayer.addChild(container);
        this.shipContainers.set(ship.id, container);
      }
      container.x = ship.x;
      container.y = ship.y;
      container.rotation = Math.atan2(ship.vy, ship.vx);
      this.labels.push({ id: ship.id, word: ship.word, typedCount: ship.typedCount, x: ship.x, y: ship.y - 24 });
    }

    for (const [id, container] of this.shipContainers) {
      if (!this.activeEntityIds.has(id)) {
        container.destroy();
        this.shipContainers.delete(id);
      }
    }

    for (const meteor of state.meteors) {
      this.activeEntityIds.add(meteor.id);
      let sprite = this.meteorSprites.get(meteor.id);
      if (!sprite) {
        sprite = createMeteorSprite(this.assets, meteor);
        this.meteorLayer.addChild(sprite);
        this.meteorSprites.set(meteor.id, sprite);
      }
      sprite.x = meteor.x;
      sprite.y = meteor.y;
      sprite.rotation = meteor.rotation;
      this.labels.push({ id: meteor.id, word: meteor.word, typedCount: meteor.typedCount, x: meteor.x, y: meteor.y - 20 });
    }

    for (const [id, sprite] of this.meteorSprites) {
      if (!this.activeEntityIds.has(id)) {
        sprite.destroy();
        this.meteorSprites.delete(id);
      }
    }
  }

  destroy(): void {
    for (const c of this.shipContainers.values()) c.destroy();
    for (const s of this.meteorSprites.values()) s.destroy();
    this.shipContainers.clear();
    this.meteorSprites.clear();
    this.labels.length = 0;
    this.shipLayer.destroy();
    this.meteorLayer.destroy();
  }
}
