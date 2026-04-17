import { Container, Graphics, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, EntityState } from "./state";
import { WavePhase, spawnEntity, completeWave } from "./state";
import { Team } from "./types";
import { SHIP_TURN_SPEED } from "./constants";
import { approachAngle } from "./utils";

const HEALTH_BAR_WIDTH = 40;
const HEALTH_BAR_HEIGHT = 4;
const HEALTH_BAR_OFFSET = -30;

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
      if (!state.entities.some((e) => e.team === Team.Enemy) && state.projectiles.length === 0) {
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

  private drawHealthBar(entity: EntityState): void {
    let g = this.healthBarGraphics.get(entity.id);
    if (!g) {
      g = new Graphics();
      this.layer.addChild(g);
      this.healthBarGraphics.set(entity.id, g);
    }

    g.clear();
    g.x = entity.x;
    g.y = entity.y + HEALTH_BAR_OFFSET;

    const ratio = Math.max(0, entity.health / entity.maxHealth);
    if (ratio >= 1) return;

    const barColor = ratio > 0.6 ? 0x4ade80 : ratio > 0.3 ? 0xfbbf24 : 0xef4444;

    g.rect(-HEALTH_BAR_WIDTH / 2, 0, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
    g.fill({ color: 0x000000, alpha: 0.5 });

    if (ratio > 0) {
      g.rect(-HEALTH_BAR_WIDTH / 2, 0, HEALTH_BAR_WIDTH * ratio, HEALTH_BAR_HEIGHT);
      g.fill({ color: barColor });
    }
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

      this.drawHealthBar(entity);
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
