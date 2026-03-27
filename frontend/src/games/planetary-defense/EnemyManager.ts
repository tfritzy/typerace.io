import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameStore } from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import { createMeteorSprite } from "./prefabs/meteorPrefab";

export class EnemyManager {
  readonly shipLayer: Container;
  readonly meteorLayer: Container;

  private assets: AssetManager;
  private shipContainers = new Map<number, Container>();
  private meteorSprites = new Map<number, Sprite>();
  private activeShipIds = new Set<number>();
  private activeMeteorIds = new Set<number>();
  private shipSpawnTimer = 0;
  private meteorSpawnTimer = 0;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.shipLayer = new Container();
    this.meteorLayer = new Container();
  }

  update(store: GameStore, dt: number): void {
    this.shipSpawnTimer += dt;
    if (this.shipSpawnTimer >= 3) {
      this.shipSpawnTimer = 0;
      store.dispatch({ type: "spawnShip" });
    }

    this.meteorSpawnTimer += dt;
    if (this.meteorSpawnTimer >= 1.5) {
      this.meteorSpawnTimer = 0;
      store.dispatch({ type: "spawnMeteor" });
    }

    this.syncRendering(store);
  }

  private syncRendering(store: GameStore): void {
    const { state } = store;

    this.activeShipIds.clear();
    for (const ship of state.ships) {
      this.activeShipIds.add(ship.id);
      let container = this.shipContainers.get(ship.id);
      if (!container) {
        container = createShipContainer(this.assets, ship);
        this.shipLayer.addChild(container);
        this.shipContainers.set(ship.id, container);
      }
      container.x = ship.x;
      container.y = ship.y;
    }

    for (const [id, container] of this.shipContainers) {
      if (!this.activeShipIds.has(id)) {
        container.destroy();
        this.shipContainers.delete(id);
      }
    }

    this.activeMeteorIds.clear();
    for (const meteor of state.meteors) {
      this.activeMeteorIds.add(meteor.id);
      let sprite = this.meteorSprites.get(meteor.id);
      if (!sprite) {
        sprite = createMeteorSprite(this.assets, meteor);
        this.meteorLayer.addChild(sprite);
        this.meteorSprites.set(meteor.id, sprite);
      }
      sprite.x = meteor.x;
      sprite.y = meteor.y;
      sprite.rotation = meteor.rotation;
    }

    for (const [id, sprite] of this.meteorSprites) {
      if (!this.activeMeteorIds.has(id)) {
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
    this.shipLayer.destroy();
    this.meteorLayer.destroy();
  }
}
