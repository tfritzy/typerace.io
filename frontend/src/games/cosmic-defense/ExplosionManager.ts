import { AnimatedSprite, Container, type Texture } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, ExplosionState } from "./state";
import { ExplosionType } from "./types";

const EXPLOSION_SCALE = 3;
const EXPLOSION_ANIMATION_SPEED = 0.15;

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

  private createDisplayObject(exp: ExplosionState): Container {
    let textures: Texture[];
    if (exp.explosionType === ExplosionType.IceExplosive) {
      textures = this.assets.getIceExplosionTextures();
    } else if (exp.explosionType === ExplosionType.PlasmaExplosive) {
      textures = this.assets.getPlasmaExplosionTextures();
    } else {
      textures = this.assets.getExplosionTextures(exp.projectileType!);
    }
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.scale.set(EXPLOSION_SCALE);
    sprite.animationSpeed = EXPLOSION_ANIMATION_SPEED;
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
