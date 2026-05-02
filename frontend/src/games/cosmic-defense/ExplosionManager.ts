import { AnimatedSprite, Container, type Texture } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, ExplosionState } from "./state";
import { ExplosionType } from "./types";

const EXPLOSION_SCALE = 3;
const BASE_EXPLOSION_RADIUS = 120;
const EXPLOSION_ANIMATION_SPEED = 0.30;

export class ExplosionManager {
  readonly layer: Container;

  private assets: AssetManager;
  private displayObjects = new Map<number, Container>();
  private completedIds = new Set<number>();
  private activeIds = new Set<number>();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  update(state: GameState): void {
    this.activeIds.clear();

    for (let i = state.explosions.length - 1; i >= 0; i--) {
      const exp = state.explosions[i];

      if (this.completedIds.has(exp.id)) {
        state.explosions.splice(i, 1);
        this.completedIds.delete(exp.id);
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
    }

    for (const [id, obj] of this.displayObjects) {
      if (!this.activeIds.has(id)) {
        obj.destroy();
        this.displayObjects.delete(id);
      }
    }
  }

  private getExplosionTextures(explosionType: ExplosionType | undefined): Texture[] {
    switch (explosionType) {
      case ExplosionType.PlasmaExplosive: return this.assets.getPlasmaExplosionTextures();
      case ExplosionType.IceExplosive: return this.assets.getIceExplosionTextures();
      case ExplosionType.Explosive:    return this.assets.getHawkExplosionTextures();
      case ExplosionType.MothHit:      return this.assets.getMothExplosionTextures();
      case ExplosionType.ChainHit:     return this.assets.getChainHitTextures();
      case ExplosionType.BouncingHit:  return this.assets.getBouncingExplosionTextures();
      default:                         return this.assets.getMothExplosionTextures();
    }
  }

  private createDisplayObject(exp: ExplosionState): Container {
    const textures = this.getExplosionTextures(exp.explosionType);
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    const baseScale = EXPLOSION_SCALE * 0.5 + (exp.explosionRadius / BASE_EXPLOSION_RADIUS) * EXPLOSION_SCALE * 0.5;
    const scaleMult = exp.explosionType === ExplosionType.BouncingHit ? 0.5 : 1;
    const speedMult = exp.explosionType === ExplosionType.BouncingHit ? 2 : 1;
    sprite.scale.set(baseScale * scaleMult);
    sprite.animationSpeed = EXPLOSION_ANIMATION_SPEED * speedMult;
    sprite.loop = false;
    sprite.onComplete = () => {
      this.completedIds.add(exp.id);
    };
    sprite.play();
    return sprite;
  }

  destroy(): void {
    for (const s of this.displayObjects.values()) s.destroy();
    this.displayObjects.clear();
    this.completedIds.clear();
    this.layer.destroy();
  }
}
