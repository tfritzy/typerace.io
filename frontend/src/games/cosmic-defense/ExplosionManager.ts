import { AnimatedSprite, Container, type Texture } from "pixi.js";
import { Emitter } from "@pixi/particle-emitter";
import type { EmitterConfigV3 } from "@pixi/particle-emitter";
import type { AssetManager } from "./assetManager";
import type { GameState, ExplosionState } from "./state";
import { ExplosionType } from "./types";

type TextureSetKey = "plasma" | "ice" | "hawk" | "moth" | "chain";

interface SpriteExplosionVisualConfig {
  kind: "sprite";
  textureSet: TextureSetKey;
  scale: number;
  speed: number;
}

interface ParticleExplosionVisualConfig {
  kind: "particle";
  textureSet: TextureSetKey;
  emitterLifetime: number;
  particleLifetimeMin: number;
  particleLifetimeMax: number;
  frequency: number;
  maxParticles: number;
  spawnWidth: number;
  spawnHeight: number;
  colorStart: string;
  colorEnd: string;
  alphaPeak: number;
  alphaPeakTime: number;
  alphaMid: number;
  alphaMidTime: number;
  scaleStart: number;
  scaleEnd: number;
  scaleMinMult: number;
  speedMin: number;
  speedMax: number;
}

type ExplosionVisualConfig = SpriteExplosionVisualConfig | ParticleExplosionVisualConfig;

const DEFAULT_EXPLOSION_VISUAL_CONFIG: SpriteExplosionVisualConfig = {
  kind: "sprite",
  textureSet: "moth",
  scale: 3,
  speed: 0.30,
};

const EXPLOSION_VISUAL_CONFIGS: Record<ExplosionType, ExplosionVisualConfig> = {
  [ExplosionType.PlasmaExplosive]: { kind: "sprite", textureSet: "plasma", scale: 3, speed: 0.30 },
  [ExplosionType.IceExplosive]:    { kind: "sprite", textureSet: "ice", scale: 3, speed: 0.30 },
  [ExplosionType.Explosive]:       { kind: "sprite", textureSet: "hawk", scale: 3, speed: 0.30 },
  [ExplosionType.MothHit]:         { kind: "sprite", textureSet: "moth", scale: 3, speed: 0.30 },
  [ExplosionType.ChainHit]:        { kind: "sprite", textureSet: "chain", scale: 1.5, speed: 0.60 },
  [ExplosionType.LightImpact]: {
    kind: "particle",
    textureSet: "chain",
    emitterLifetime: 0.12,
    particleLifetimeMin: 0.10,
    particleLifetimeMax: 0.20,
    frequency: 0.006,
    maxParticles: 8,
    spawnWidth: 6,
    spawnHeight: 6,
    colorStart: "#cfe8ff",
    colorEnd: "#88bbff",
    alphaPeak: 0.8,
    alphaPeakTime: 0.15,
    alphaMid: 0.3,
    alphaMidTime: 0.7,
    scaleStart: 0.35,
    scaleEnd: 0.65,
    scaleMinMult: 0.6,
    speedMin: 10,
    speedMax: 20,
  },
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

  update(state: GameState, dt: number): void {
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
      emitter.update(dt);
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

  private getTextures(textureSet: TextureSetKey): Texture[] {
    switch (textureSet) {
      case "plasma": return this.assets.getPlasmaExplosionTextures();
      case "ice": return this.assets.getIceExplosionTextures();
      case "hawk": return this.assets.getHawkExplosionTextures();
      case "chain": return this.assets.getChainHitTextures();
      case "moth": return this.assets.getMothExplosionTextures();
    }
  }

  private createParticleConfig(texture: Texture, config: ParticleExplosionVisualConfig): EmitterConfigV3 {
    return {
      lifetime: { min: config.particleLifetimeMin, max: config.particleLifetimeMax },
      frequency: config.frequency,
      emitterLifetime: config.emitterLifetime,
      maxParticles: config.maxParticles,
      addAtBack: false,
      pos: { x: 0, y: 0 },
      behaviors: [
        {
          type: "spawnShape",
          config: {
            type: "rect",
            data: {
              x: -config.spawnWidth / 2,
              y: -config.spawnHeight / 2,
              w: config.spawnWidth,
              h: config.spawnHeight,
            },
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
                { value: config.colorStart, time: 0 },
                { value: config.colorEnd, time: 1 },
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
                { value: config.alphaPeak, time: config.alphaPeakTime },
                { value: config.alphaMid, time: config.alphaMidTime },
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
                { value: config.scaleStart, time: 0 },
                { value: config.scaleEnd, time: 1 },
              ],
            },
            minMult: config.scaleMinMult,
          },
        },
        {
          type: "moveSpeed",
          config: { min: config.speedMin, max: config.speedMax },
        },
        {
          type: "rotation",
          config: { minStart: 0, maxStart: 360, minSpeed: 0, maxSpeed: 0, accel: 0 },
        },
      ],
    };
  }

  private getVisualConfig(explosionType: ExplosionType | undefined): ExplosionVisualConfig {
    if (explosionType === undefined) {
      return DEFAULT_EXPLOSION_VISUAL_CONFIG;
    }
    return EXPLOSION_VISUAL_CONFIGS[explosionType];
  }

  private createParticleDisplayObject(exp: ExplosionState, config: ParticleExplosionVisualConfig): Container {
    const texture = this.getTextures(config.textureSet)[0];
    const container = new Container();
    const emitter = new Emitter(container, this.createParticleConfig(texture, config));
    emitter.emit = true;
    this.particleEmitters.set(exp.id, emitter);
    return container;
  }

  private createSpriteDisplayObject(exp: ExplosionState, config: SpriteExplosionVisualConfig): AnimatedSprite {
    const textures = this.getTextures(config.textureSet);
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.scale.set(config.scale);
    sprite.animationSpeed = config.speed;
    sprite.loop = false;
    sprite.onComplete = () => {
      this.completedIds.add(exp.id);
    };
    sprite.play();
    return sprite;
  }

  private createDisplayObject(exp: ExplosionState): Container {
    const config = this.getVisualConfig(exp.explosionType);
    if (config.kind === "particle") {
      return this.createParticleDisplayObject(exp, config);
    }
    return this.createSpriteDisplayObject(exp, config);
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
