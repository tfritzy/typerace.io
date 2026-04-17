import { Container, Graphics, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, EntityState } from "./state";
import { WavePhase, spawnEntity, completeWave } from "./state";
import { Team } from "./types";
import { SHIP_TURN_SPEED } from "./constants";
import { approachAngle } from "./utils";
import { drawHealthBar } from "./healthBar";

export class EnemyManager {
  readonly layer: Container;

  private assets: AssetManager;
  private entityDisplayObjects = new Map<number, Container>();
  private healthBarGraphics = new Map<number, Graphics>();
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
        !state.entities.some((e) => e.team === Team.Enemy) &&
        wave.spawnIndex < wave.spawnQueue.length
      ) {
        wave.waveTimer = wave.spawnQueue[wave.spawnIndex].spawnTime;
      }

      while (
        wave.spawnIndex < wave.spawnQueue.length &&
        wave.waveTimer >= wave.spawnQueue[wave.spawnIndex].spawnTime
      ) {
        const entry = wave.spawnQueue[wave.spawnIndex];
        spawnEntity(state, entry.config, Team.Enemy);
        wave.spawnIndex++;
      }

      if (wave.spawnIndex >= wave.spawnQueue.length) {
        wave.phase = WavePhase.Clearing;
      }
    }

    if (wave.phase === WavePhase.Clearing) {
      if (!state.entities.some((e) => e.team === Team.Enemy)) {
        completeWave(state);
      }
    }

    this.syncRendering(state, dt);
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

  private updateHealthBar(entity: EntityState): void {
    let g = this.healthBarGraphics.get(entity.id);
    if (!g) {
      g = new Graphics();
      this.layer.addChild(g);
      this.healthBarGraphics.set(entity.id, g);
    }
    drawHealthBar(g, entity);
  }

  private syncRendering(state: GameState, dt: number): void {
    this.activeEntityIds.clear();
    const maxStep = SHIP_TURN_SPEED * dt;

    for (const entity of state.entities) {
      if (entity.team !== Team.Enemy) continue;
      this.activeEntityIds.add(entity.id);
      let display = this.entityDisplayObjects.get(entity.id);
      if (!display) {
        display = this.createDisplayObject(entity);
        this.layer.addChild(display);
        this.entityDisplayObjects.set(entity.id, display);
      }
      display.x = entity.x;
      display.y = entity.y;
      entity.displayRotation = approachAngle(entity.displayRotation, entity.rotation, maxStep);
      display.rotation = entity.displayRotation;

      this.updateHealthBar(entity);
    }

    for (const [id, display] of this.entityDisplayObjects) {
      if (!this.activeEntityIds.has(id)) {
        display.destroy();
        this.entityDisplayObjects.delete(id);
        const hb = this.healthBarGraphics.get(id);
        if (hb) {
          hb.destroy();
          this.healthBarGraphics.delete(id);
        }
      }
    }
  }

  destroy(): void {
    for (const d of this.entityDisplayObjects.values()) d.destroy();
    this.entityDisplayObjects.clear();
    for (const g of this.healthBarGraphics.values()) g.destroy();
    this.healthBarGraphics.clear();
    this.layer.destroy();
  }
}
