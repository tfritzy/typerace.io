import { AnimatedSprite, Container, Graphics } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, ProjectileState } from "./state";
import { ProjectileType } from "./types";

const PROJECTILE_SCALE = 3;
const TINY_PROJECTILE_SIZE = 1.5;
const ANIMATION_SPEED = 0.15;

export class ProjectileManager {
  readonly layer: Container;

  private assets: AssetManager;
  private displayObjects = new Map<number, Container>();
  private activeIds = new Set<number>();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  update(state: GameState): void {
    this.activeIds.clear();

    for (const p of state.projectiles) {
      this.activeIds.add(p.id);
      let obj = this.displayObjects.get(p.id);
      if (!obj) {
        obj = this.createDisplayObject(p);
        this.layer.addChild(obj);
        this.displayObjects.set(p.id, obj);
      }
      obj.x = p.x;
      obj.y = p.y;
      obj.rotation = Math.atan2(p.vy, p.vx);
    }

    for (const [id, obj] of this.displayObjects) {
      if (!this.activeIds.has(id)) {
        obj.destroy();
        this.displayObjects.delete(id);
      }
    }
  }

  private createDisplayObject(p: ProjectileState): Container {
    if (p.projectileType === ProjectileType.Tiny) {
      const g = new Graphics();
      g.rect(-TINY_PROJECTILE_SIZE / 2, -TINY_PROJECTILE_SIZE / 2, TINY_PROJECTILE_SIZE, TINY_PROJECTILE_SIZE);
      g.fill(0xcccccc);
      return g;
    }

    const textures = this.assets.getProjectileTextures(p.projectileType);
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.scale.set(PROJECTILE_SCALE);
    sprite.animationSpeed = ANIMATION_SPEED;
    sprite.play();
    return sprite;
  }

  destroy(): void {
    for (const s of this.displayObjects.values()) s.destroy();
    this.displayObjects.clear();
    this.layer.destroy();
  }
}
