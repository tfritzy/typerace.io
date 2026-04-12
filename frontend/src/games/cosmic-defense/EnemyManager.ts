import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, EntityState } from "./state";
import { WavePhase, spawnEntity } from "./state";

const RED_TINT = 0xff4444;

export class EnemyManager {
  readonly layer: Container;

  private assets: AssetManager;
  private entityDisplayObjects = new Map<number, Container>();
  private activeEntityIds = new Set<number>();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  update(state: GameState, dt: number): void {
    const wave = state.wave;

    if (wave.phase === WavePhase.Spawning) {
      wave.waveTimer += dt;

      if (
        state.entities.length === 0 &&
        wave.spawnIndex < wave.spawnQueue.length
      ) {
        wave.waveTimer = wave.spawnQueue[wave.spawnIndex].spawnTime;
      }

      while (
        wave.spawnIndex < wave.spawnQueue.length &&
        wave.waveTimer >= wave.spawnQueue[wave.spawnIndex].spawnTime
      ) {
        const entry = wave.spawnQueue[wave.spawnIndex];
        spawnEntity(state, entry.config);
        wave.spawnIndex++;
      }

      if (wave.spawnIndex >= wave.spawnQueue.length) {
        wave.phase = WavePhase.Clearing;
      }
    }

    if (wave.phase === WavePhase.Clearing) {
      if (state.entities.length === 0 && state.projectiles.length === 0) {
        wave.phase = WavePhase.Idle;
        state.onWaveComplete.emit();
      }
    }

    this.syncRendering(state);
  }

  private createDisplayObject(entity: EntityState): Container {
    const shipTexture = this.assets.getShipTexture(entity.entityType, entity.colorPreset);
    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);
    shipSprite.tint = RED_TINT;

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
      this.activeEntityIds.add(entity.id);
      let display = this.entityDisplayObjects.get(entity.id);
      if (!display) {
        display = this.createDisplayObject(entity);
        this.layer.addChild(display);
        this.entityDisplayObjects.set(entity.id, display);
      }
      display.x = entity.x;
      display.y = entity.y;
      display.rotation = Math.atan2(entity.vy, entity.vx);
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
