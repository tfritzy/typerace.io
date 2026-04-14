import { AnimatedSprite, Container, Graphics } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, ExplosionState } from "./state";
import { ProjectileType } from "./types";

const EXPLOSION_SCALE = 3;
const EXPLOSION_DURATION = 0.3;
const EXPLOSION_ANIMATION_SPEED = 0.15;

export class ExplosionManager {
  readonly layer: Container;

  private assets: AssetManager;
  private displayObjects = new Map<number, Container>();
  private activeIds = new Set<number>();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  update(state: GameState, dt: number): void {
    this.activeIds.clear();

    for (let i = state.explosions.length - 1; i >= 0; i--) {
      const exp = state.explosions[i];
      exp.age += dt;

      if (exp.age >= EXPLOSION_DURATION) {
        state.explosions.splice(i, 1);
        continue;
      }

      this.activeIds.add(exp.id);
      let obj = this.displayObjects.get(exp.id);
      if (!obj) {
        obj = this.createDisplayObject(exp);
        this.layer.addChild(obj);
        this.displayObjects.set(exp.id, obj);
      }
      obj.x = exp.x;
      obj.y = exp.y;
      obj.alpha = 1 - exp.age / EXPLOSION_DURATION;
    }

    for (const [id, obj] of this.displayObjects) {
      if (!this.activeIds.has(id)) {
        obj.destroy();
        this.displayObjects.delete(id);
      }
    }
  }

  private createDisplayObject(exp: ExplosionState): Container {
    if (exp.projectileType === ProjectileType.Tiny) {
      const g = new Graphics();
      g.circle(0, 0, 3);
      g.fill(0xffffff);
      g.scale.set(EXPLOSION_SCALE);
      return g;
    }

    const textures = this.assets.getExplosionTextures(exp.projectileType);
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.scale.set(EXPLOSION_SCALE);
    sprite.animationSpeed = EXPLOSION_ANIMATION_SPEED;
    sprite.loop = false;
    sprite.play();
    return sprite;
  }

  destroy(): void {
    for (const s of this.displayObjects.values()) s.destroy();
    this.displayObjects.clear();
    this.layer.destroy();
  }
}
