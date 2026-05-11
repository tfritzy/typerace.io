import { AnimatedSprite, Container, Graphics, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, EntityState, EntityDeathData } from "./state";
import { updateSpawner } from "./state";
import { Team } from "./types";
import type { EntityType } from "./types";
import { SHIP_TURN_SPEED } from "./constants";
import { approachAngle } from "./utils";
import { drawHealthBar } from "./healthBar";

const SHIP_DEATH_ANIMATION_SPEED = 0.3;
const ENEMY_CONTAINER_SCALE = 2.25;
const WARP_IN_ANIMATION_SPEED = 0.25;
const WARP_FRAME_SIZE = 64;
const WARP_SIZE_MULTIPLIER = 1.5;
const DEATH_EXPLOSION_FRAME_SIZE = 64;
const DEATH_EXPLOSION_SIZE_MULTIPLIER = 2.5;

export class EnemyManager {
  readonly layer: Container;

  private assets: AssetManager;
  private entityDisplayObjects = new Map<number, Container>();
  private healthBarGraphics = new Map<number, Graphics>();
  private activeEntityIds = new Set<number>();
  private deathAnimations: AnimatedSprite[] = [];
  private warpInAnimations: AnimatedSprite[] = [];
  private unsubDeath: (() => void) | null = null;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  subscribe(state: GameState): void {
    this.unsubDeath = state.onEnemyEntityDeath.subscribe((data: EntityDeathData) => {
      this.spawnDeathExplosion(data.x, data.y, data.entityType, data.sizeScale);
    });
  }

  update(state: GameState, dt: number): void {
    updateSpawner(state, dt);
    this.syncRendering(state, dt);
    this.tickDeathAnimations();
    this.tickWarpInAnimations();
  }

  private createDisplayObject(entity: EntityState): Container {
    const shipTexture = this.assets.getShipTexture(entity.entityType, entity.colorPreset);
    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);

    const container = new Container();
    container.addChild(shipSprite);
    container.scale.set(ENEMY_CONTAINER_SCALE * entity.sizeScale);
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

  private tickDeathAnimations(): void {
    for (let i = this.deathAnimations.length - 1; i >= 0; i--) {
      const anim = this.deathAnimations[i];
      if (!anim.playing) {
        anim.destroy();
        this.deathAnimations.splice(i, 1);
      }
    }
  }

  private spawnDeathExplosion(x: number, y: number, entityType: EntityType, sizeScale: number): void {
    const textures = this.assets.getShipDeathExplosionTextures();
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    const { width, height } = this.assets.getShipTextureSize(entityType);
    const maxDim = Math.max(width, height);
    sprite.scale.set((maxDim * ENEMY_CONTAINER_SCALE * sizeScale * DEATH_EXPLOSION_SIZE_MULTIPLIER) / DEATH_EXPLOSION_FRAME_SIZE);
    sprite.animationSpeed = SHIP_DEATH_ANIMATION_SPEED;
    sprite.loop = false;
    sprite.x = x;
    sprite.y = y;
    sprite.play();
    this.layer.addChild(sprite);
    this.deathAnimations.push(sprite);
  }

  private spawnWarpIn(x: number, y: number, entityType: EntityType): void {
    const textures = this.assets.getWarpInTextures();
    const { width, height } = this.assets.getShipTextureSize(entityType);
    const maxDim = Math.max(width, height);
    if (maxDim <= 0) return;
    const warpScale = (maxDim * ENEMY_CONTAINER_SCALE * WARP_SIZE_MULTIPLIER) / WARP_FRAME_SIZE;
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.scale.set(warpScale);
    sprite.x = x;
    sprite.y = y;
    sprite.animationSpeed = WARP_IN_ANIMATION_SPEED;
    sprite.loop = false;
    sprite.play();
    this.layer.addChild(sprite);
    this.warpInAnimations.push(sprite);
  }

  private tickWarpInAnimations(): void {
    for (let i = this.warpInAnimations.length - 1; i >= 0; i--) {
      const anim = this.warpInAnimations[i];
      if (!anim.playing) {
        anim.destroy();
        this.warpInAnimations.splice(i, 1);
      }
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
        this.spawnWarpIn(entity.x, entity.y, entity.entityType);
      }
      display.x = entity.x;
      display.y = entity.y;
      entity.displayRotation = approachAngle(entity.displayRotation, entity.rotation, maxStep);
      display.rotation = entity.displayRotation;
      display.tint = entity.freezeStacks > 0 ? 0x88bbff : 0xffffff;

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
    if (this.unsubDeath) {
      this.unsubDeath();
      this.unsubDeath = null;
    }
    for (const d of this.entityDisplayObjects.values()) d.destroy();
    this.entityDisplayObjects.clear();
    for (const g of this.healthBarGraphics.values()) g.destroy();
    this.healthBarGraphics.clear();
    for (const anim of this.deathAnimations) anim.destroy();
    this.deathAnimations.length = 0;
    for (const anim of this.warpInAnimations) anim.destroy();
    this.warpInAnimations.length = 0;
    this.layer.destroy();
  }
}
