import { AnimatedSprite, Container, type Texture } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, ExplosionState } from "./state";
import { ExplosionType } from "./types";

interface ExplosionConfig {
  scale: number;
  speed: number;
}

const EXPLOSION_TYPE_CONFIGS: Record<ExplosionType, ExplosionConfig> = {
  [ExplosionType.PlasmaExplosive]: { scale: 3,    speed: 0.30 },
  [ExplosionType.IceExplosive]:    { scale: 3,    speed: 0.30 },
  [ExplosionType.Explosive]:       { scale: 3,    speed: 0.30 },
  [ExplosionType.MothHit]:         { scale: 0.75, speed: 0.30 },
  [ExplosionType.ChainHit]:        { scale: 1.5,  speed: 0.60 },
};

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
        const last = state.explosions.length - 1;
        if (i !== last) state.explosions[i] = state.explosions[last];
        state.explosions.pop();
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
      case ExplosionType.IceExplosive:    return this.assets.getIceExplosionTextures();
      case ExplosionType.Explosive:       return this.assets.getHawkExplosionTextures();
      case ExplosionType.MothHit:         return this.assets.getMothExplosionTextures();
      case ExplosionType.ChainHit:        return this.assets.getChainHitTextures();
      default:                            return this.assets.getMothExplosionTextures();
    }
  }

  private createDisplayObject(exp: ExplosionState): Container {
    const textures = this.getExplosionTextures(exp.explosionType);
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    const config = exp.explosionType !== undefined ? EXPLOSION_TYPE_CONFIGS[exp.explosionType] : undefined;
    sprite.scale.set(config?.scale ?? 0.75);
    sprite.animationSpeed = config?.speed ?? 0.30;
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
