import { AnimatedSprite, Container, type Texture } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import type { EmitterConfigV3 } from "@pixi/particle-emitter";
import type { AssetManager } from "./assetManager";
import type { GameState, ExplosionState } from "./state";
import { ExplosionType } from "./types";

type ExplosionRenderMode = "sprite" | "particle";

interface ExplosionConfig {
  renderMode: ExplosionRenderMode;
  spriteScale?: number;
  spriteSpeed?: number;
  particleLifetime?: number;
}

const EXPLOSION_TYPE_CONFIGS: Record<ExplosionType, ExplosionConfig> = {
  [ExplosionType.PlasmaExplosive]: { renderMode: "sprite", spriteScale: 3, spriteSpeed: 0.30 },
  [ExplosionType.IceExplosive]:    { renderMode: "sprite", spriteScale: 3, spriteSpeed: 0.30 },
  [ExplosionType.Explosive]:       { renderMode: "sprite", spriteScale: 3, spriteSpeed: 0.30 },
  [ExplosionType.MothHit]:         { renderMode: "sprite", spriteScale: 3, spriteSpeed: 0.30 },
  [ExplosionType.ChainHit]:        { renderMode: "sprite", spriteScale: 1.5, spriteSpeed: 0.60 },
  [ExplosionType.PipImpact]:       { renderMode: "particle", particleLifetime: 0.12 },
};

export class ExplosionManager {
  readonly layer: Container;

  private assets: AssetManager;
  private displayObjects = new Map<number, Container>();
  private particleEmitters = new Map<number, Emitter>();
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

    for (const [id, emitter] of this.particleEmitters) {
      emitter.update(1 / 60);
      if (!emitter.emit && emitter.particleCount === 0) {
        this.completedIds.add(id);
      }
    }

    for (const [id, obj] of this.displayObjects) {
      if (!this.activeIds.has(id)) {
        const emitter = this.particleEmitters.get(id);
        if (emitter) {
          emitter.destroy();
          this.particleEmitters.delete(id);
        }
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
      case ExplosionType.PipImpact:       return this.assets.getChainHitTextures();
      default:                            return this.assets.getMothExplosionTextures();
    }
  }

  private createPipParticleConfig(texture: Texture, emitterLifetime: number): EmitterConfigV3 {
    return {
      lifetime: { min: 0.10, max: 0.20 },
      frequency: 0.006,
      emitterLifetime,
      maxParticles: 8,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: "spawnShape",
          config: {
            type: "rect",
            data: { x: -3, y: -3, w: 6, h: 6 },
          },
        },
        {
          type: "textureSingle",
          config: { texture },
        },
        {
          type: "color",
          config: {
            color: {
              list: [
                { value: "#cfe8ff", time: 0 },
                { value: "#88bbff", time: 1 },
              ],
            },
          },
        },
        {
          type: "alpha",
          config: {
            alpha: {
              list: [
                { value: 0, time: 0 },
                { value: 0.8, time: 0.15 },
                { value: 0.3, time: 0.7 },
                { value: 0, time: 1 },
              ],
            },
          },
        },
        {
          type: "scale",
          config: {
            scale: {
              list: [
                { value: 0.35, time: 0 },
                { value: 0.65, time: 1 },
              ],
            },
            minMult: 0.6,
          },
        },
        {
          type: "moveSpeed",
          config: { min: 10, max: 20 },
        },
        {
          type: "rotation",
          config: { minStart: 0, maxStart: 360, minSpeed: 0, maxSpeed: 0, accel: 0 },
        },
      ],
    };
  }

  private createDisplayObject(exp: ExplosionState): Container {
    const config = exp.explosionType !== undefined ? EXPLOSION_TYPE_CONFIGS[exp.explosionType] : undefined;
    const renderMode = config?.renderMode ?? "sprite";

    if (renderMode === "particle") {
      const textures = this.getExplosionTextures(exp.explosionType);
      const container = new Container();
      const emitter = new Emitter(
        container,
        this.createPipParticleConfig(textures[0], config?.particleLifetime ?? 0.12)
      );
      emitter.emit = true;
      this.particleEmitters.set(exp.id, emitter);
      return container;
    }

    const textures = this.getExplosionTextures(exp.explosionType);
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.scale.set(config?.spriteScale ?? 3);
    sprite.animationSpeed = config?.spriteSpeed ?? 0.30;
    sprite.loop = false;
    sprite.onComplete = () => {
      this.completedIds.add(exp.id);
    };
    sprite.play();
    return sprite;
  }

  destroy(): void {
    for (const emitter of this.particleEmitters.values()) emitter.destroy();
    this.particleEmitters.clear();
    for (const s of this.displayObjects.values()) s.destroy();
    this.displayObjects.clear();
    this.completedIds.clear();
    this.layer.destroy();
  }
}
