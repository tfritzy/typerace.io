import { AnimatedSprite, Container, Graphics, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, EntityState, EntityDeathData } from "./state";
import { spawnAlliedEntity } from "./state";
import { FRIENDLY_CONFIG_MAP } from "./enemyConfig";
import { SHIP_BLUEPRINTS } from "./shipCatalog";
import { Team } from "./types";
import type { EntityType } from "./types";
import { SHIP_TURN_SPEED } from "./constants";
import { approachAngle } from "./utils";
import { drawHealthBar } from "./healthBar";

const BLUEPRINT_MAP = new Map(
  SHIP_BLUEPRINTS.map((bp) => [bp.entityType, bp])
);

const CHARGE_DOT_RADIUS = 2;
const CHARGE_DOT_SPACING = 7;
const CHARGE_DOT_OFFSET = 28;

const SHIP_DEATH_EXPLOSION_SCALE = 2.5;
const SHIP_DEATH_ANIMATION_SPEED = 0.3;

export class ShipManager {
  readonly layer: Container;
  private assets: AssetManager;
  private entityDisplayObjects = new Map<number, Container>();
  private chargeGraphics = new Map<number, Graphics>();
  private healthBarGraphics = new Map<number, Graphics>();
  private activeEntityIds = new Set<number>();
  private deathAnimations: AnimatedSprite[] = [];
  private unsubDeath: (() => void) | null = null;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  subscribe(state: GameState): void {
    this.unsubDeath = state.onAlliedEntityDeath.subscribe((data: EntityDeathData) => {
      this.spawnDeathExplosion(data.x, data.y);
    });
  }

  addShip(state: GameState, entityType: EntityType, x: number, y: number, level: number = 1): number {
    const config = FRIENDLY_CONFIG_MAP.get(entityType);
    if (!config) return -1;
    const bp = BLUEPRINT_MAP.get(entityType);
    return spawnAlliedEntity(state, config, bp?.colorPreset ?? 0, x, y, level);
  }

  update(state: GameState, dt: number): void {
    this.syncRendering(state, dt);
    this.tickDeathAnimations();
  }

  private createDisplayObject(entity: EntityState): Container {
    const shipTexture = this.assets.getShipTexture(entity.entityType, entity.colorPreset);
    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);

    const container = new Container();
    container.addChild(shipSprite);
    container.scale.set(1.5);
    container.x = entity.x;
    container.y = entity.y;

    return container;
  }

  private drawChargeDots(entity: EntityState): void {
    if (entity.chargesRequired <= 0) return;

    let g = this.chargeGraphics.get(entity.id);
    if (!g) {
      g = new Graphics();
      this.layer.addChild(g);
      this.chargeGraphics.set(entity.id, g);
    }

    g.clear();
    g.x = entity.x;
    g.y = entity.y + CHARGE_DOT_OFFSET;

    const count = entity.chargesRequired;
    const totalWidth = (count - 1) * CHARGE_DOT_SPACING;

    for (let d = 0; d < count; d++) {
      const offsetX = -totalWidth / 2 + d * CHARGE_DOT_SPACING;

      if (d < entity.charge) {
        g.circle(offsetX, 0, CHARGE_DOT_RADIUS);
        g.fill({ color: 0x4ade80 });
      } else {
        g.circle(offsetX, 0, CHARGE_DOT_RADIUS);
        g.fill({ color: 0x333333 });
        g.stroke({ color: 0x555555, width: 1 });
      }
    }
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

  private spawnDeathExplosion(x: number, y: number): void {
    const textures = this.assets.getShipDeathExplosionTextures();
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.scale.set(SHIP_DEATH_EXPLOSION_SCALE);
    sprite.animationSpeed = SHIP_DEATH_ANIMATION_SPEED;
    sprite.loop = false;
    sprite.x = x;
    sprite.y = y;
    sprite.play();
    this.layer.addChild(sprite);
    this.deathAnimations.push(sprite);
  }

  private syncRendering(state: GameState, dt: number): void {
    this.activeEntityIds.clear();
    const maxStep = SHIP_TURN_SPEED * dt;

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
      entity.displayRotation = approachAngle(entity.displayRotation, entity.rotation, maxStep);
      display.rotation = entity.displayRotation;

      this.drawChargeDots(entity);
      this.updateHealthBar(entity);
    }

    for (const [id, display] of this.entityDisplayObjects) {
      if (!this.activeEntityIds.has(id)) {
        display.destroy();
        this.entityDisplayObjects.delete(id);
        const cg = this.chargeGraphics.get(id);
        if (cg) {
          cg.destroy();
          this.chargeGraphics.delete(id);
        }
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
    for (const g of this.chargeGraphics.values()) g.destroy();
    this.chargeGraphics.clear();
    for (const g of this.healthBarGraphics.values()) g.destroy();
    this.healthBarGraphics.clear();
    for (const anim of this.deathAnimations) anim.destroy();
    this.deathAnimations.length = 0;
    this.layer.destroy();
  }
}
