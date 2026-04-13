import { AnimatedSprite, Container } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, ProjectileState } from "./state";

const PROJECTILE_SCALE = 3;
const ANIMATION_SPEED = 0.15;

export class ProjectileManager {
  readonly layer: Container;

  private assets: AssetManager;
  private displayObjects = new Map<number, AnimatedSprite>();
  private activeIds = new Set<number>();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  update(state: GameState): void {
    this.activeIds.clear();

    for (const p of state.projectiles) {
      this.activeIds.add(p.id);
      let sprite = this.displayObjects.get(p.id);
      if (!sprite) {
        sprite = this.createSprite(p);
        this.layer.addChild(sprite);
        this.displayObjects.set(p.id, sprite);
      }
      sprite.x = p.x;
      sprite.y = p.y;
      sprite.rotation = Math.atan2(p.vy, p.vx);
    }

    for (const [id, sprite] of this.displayObjects) {
      if (!this.activeIds.has(id)) {
        sprite.destroy();
        this.displayObjects.delete(id);
      }
    }
  }

  private createSprite(p: ProjectileState): AnimatedSprite {
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
