import { Emitter } from "@pixi/particle-emitter";
import type { EmitterConfigV3 } from "@pixi/particle-emitter";
import { Container, Texture } from "pixi.js";
import type { Meteor } from "./types";
import { TurretType } from "./types";
import { MISSILE_EXPLOSION_RADIUS } from "./constants";

const TURRET_COLORS: Record<TurretType, string> = {
  [TurretType.Bullet]: "94a3b8",
  [TurretType.Missile]: "f59e0b",
  [TurretType.Laser]: "60a5fa",
  [TurretType.Railgun]: "a855f7",
};

export function createMuzzleFlashConfig(
  turretType: TurretType,
  angle: number,
): EmitterConfigV3 {
  const color = TURRET_COLORS[turretType];
  const angleDeg = angle * (180 / Math.PI);
  const particleCount = turretType === TurretType.Railgun ? 12 : 6;
  const spread = turretType === TurretType.Railgun ? 40 : 60;
  const speedMin = turretType === TurretType.Railgun ? 40 : 20;
  const speedMax = turretType === TurretType.Railgun ? 80 : 50;
  const textureWidth = Texture.WHITE.width > 0 ? Texture.WHITE.width : 16;
  const baseScale = 3 / textureWidth;
  const endScale = 1 / textureWidth;

  return {
    lifetime: { min: 0.08, max: 0.2 },
    frequency: 1,
    spawnChance: 1,
    particlesPerWave: particleCount,
    emitterLifetime: 0,
    maxParticles: particleCount,
    emit: false,
    pos: { x: 0, y: 0 },
    addAtBack: false,
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              { value: 1, time: 0 },
              { value: 0.6, time: 0.3 },
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
              { value: baseScale, time: 0 },
              { value: endScale, time: 1 },
            ],
          },
          minMult: 0.5,
        },
      },
      {
        type: "color",
        config: {
          color: {
            list: [
              { value: "ffffff", time: 0 },
              { value: color, time: 0.4 },
              { value: color, time: 1 },
            ],
          },
        },
      },
      {
        type: "moveSpeed",
        config: {
          speed: {
            list: [
              { value: speedMax, time: 0 },
              { value: speedMin, time: 0.5 },
              { value: 0, time: 1 },
            ],
            isStepped: false,
          },
          minMult: 0.6,
        },
      },
      {
        type: "spawnBurst",
        config: {
          spacing: spread / particleCount,
          start: angleDeg - spread / 2,
          distance: 2,
        },
      },
      {
        type: "textureSingle",
        config: { texture: Texture.WHITE },
      },
    ],
  };
}

export function createBulletImpactConfig(
  damage: number,
): EmitterConfigV3 {
  const intensity = Math.min(damage / 10, 5);
  const particleCount = Math.max(4, Math.round(3 + intensity * 2));
  const textureWidth = Texture.WHITE.width > 0 ? Texture.WHITE.width : 16;
  const baseScale = Math.max(1, 1 + intensity * 0.3) / textureWidth;
  const endScale = 0.5 / textureWidth;

  return {
    lifetime: { min: 0.1, max: 0.3 },
    frequency: 1,
    spawnChance: 1,
    particlesPerWave: particleCount,
    emitterLifetime: 0,
    maxParticles: particleCount,
    emit: false,
    pos: { x: 0, y: 0 },
    addAtBack: false,
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              { value: 0.9, time: 0 },
              { value: 0.5, time: 0.4 },
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
              { value: baseScale, time: 0 },
              { value: endScale, time: 1 },
            ],
          },
          minMult: 0.5,
        },
      },
      {
        type: "color",
        config: {
          color: {
            list: [
              { value: "ffffff", time: 0 },
              { value: "fde68a", time: 0.5 },
              { value: "f97316", time: 1 },
            ],
          },
        },
      },
      {
        type: "moveSpeed",
        config: {
          speed: {
            list: [
              { value: 30 + intensity * 10, time: 0 },
              { value: 10, time: 0.5 },
              { value: 0, time: 1 },
            ],
            isStepped: false,
          },
          minMult: 0.5,
        },
      },
      {
        type: "spawnBurst",
        config: {
          spacing: 360 / particleCount,
          start: 0,
          distance: 1,
        },
      },
      {
        type: "textureSingle",
        config: { texture: Texture.WHITE },
      },
    ],
  };
}

export function createExplosionConfig(
  explosionRadius: number,
): EmitterConfigV3 {
  const sizeFactor = explosionRadius / MISSILE_EXPLOSION_RADIUS;
  const particleCount = Math.max(12, Math.round(16 * sizeFactor));
  const textureWidth = Texture.WHITE.width > 0 ? Texture.WHITE.width : 16;
  const maxSize = Math.max(3, explosionRadius * 0.25);
  const minSize = Math.max(1, explosionRadius * 0.08);
  const baseScale = maxSize / textureWidth;
  const endScale = minSize / textureWidth;
  const speed = 30 + explosionRadius * 1.5;

  return {
    lifetime: { min: 0.25, max: 0.6 },
    frequency: 1,
    spawnChance: 1,
    particlesPerWave: particleCount,
    emitterLifetime: 0,
    maxParticles: particleCount,
    emit: false,
    pos: { x: 0, y: 0 },
    addAtBack: false,
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              { value: 1, time: 0 },
              { value: 0.7, time: 0.3 },
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
              { value: baseScale * 0.3, time: 0 },
              { value: baseScale, time: 0.2 },
              { value: endScale, time: 1 },
            ],
          },
          minMult: 0.5,
        },
      },
      {
        type: "color",
        config: {
          color: {
            list: [
              { value: "ffffff", time: 0 },
              { value: "fbbf24", time: 0.2 },
              { value: "f97316", time: 0.5 },
              { value: "7c2d12", time: 1 },
            ],
          },
        },
      },
      {
        type: "moveSpeed",
        config: {
          speed: {
            list: [
              { value: speed, time: 0 },
              { value: speed * 0.4, time: 0.4 },
              { value: 0, time: 1 },
            ],
            isStepped: false,
          },
          minMult: 0.4,
        },
      },
      {
        type: "spawnBurst",
        config: {
          spacing: 360 / particleCount,
          start: 0,
          distance: explosionRadius * 0.15,
        },
      },
      {
        type: "textureSingle",
        config: { texture: Texture.WHITE },
      },
    ],
  };
}

export function createMeteorDestructionConfig(meteor: Meteor): EmitterConfigV3 {
  const lifetimeMin = 0.45;
  const lifetimeMax = 0.95;
  const speedScaleMin = 2.2;
  const speedScaleMax = 5.2;
  const sizeScaleMin = 0.12;
  const sizeScaleMax = 0.34;
  const particleCount = Math.max(10, Math.round(meteor.radius * 0.55));
  const spread = 260;
  const travelAngle = Math.atan2(-meteor.vy, meteor.vx) * 180 / Math.PI;
  const maxParticleSize = Math.max(1.5, meteor.radius * sizeScaleMax);
  const minParticleSize = Math.max(1, meteor.radius * sizeScaleMin);
  const textureWidth = Texture.WHITE.width > 0 ? Texture.WHITE.width : 16;
  const baseScale = maxParticleSize / textureWidth;
  const endScale = minParticleSize / textureWidth;
  const minSpeed = meteor.radius * speedScaleMin + Math.hypot(meteor.vx, meteor.vy) * 0.2;
  const maxSpeed = meteor.radius * speedScaleMax + Math.hypot(meteor.vx, meteor.vy) * 0.35;

  return {
    lifetime: { min: lifetimeMin, max: lifetimeMax },
    frequency: 1,
    spawnChance: 1,
    particlesPerWave: particleCount,
    emitterLifetime: 0,
    maxParticles: particleCount,
    emit: false,
    pos: { x: 0, y: 0 },
    addAtBack: false,
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              { value: 0.95, time: 0 },
              { value: 0.45, time: 0.45 },
              { value: 0.05, time: 1 },
            ],
          },
        },
      },
      {
        type: "scale",
        config: {
          scale: {
            list: [
              { value: baseScale, time: 0 },
              { value: endScale, time: 1 },
            ],
          },
          minMult: 0.7,
        },
      },
      {
        type: "color",
        config: {
          color: {
            list: [
              { value: "ffffff", time: 0 },
              { value: "e2e8f0", time: 0.5 },
              { value: "fde68a", time: 1 },
            ],
          },
        },
      },
      {
        type: "moveSpeed",
        config: {
          speed: {
            list: [
              { value: maxSpeed, time: 0 },
              { value: minSpeed, time: 0.55 },
              { value: Math.max(minSpeed * 0.4, 1), time: 1 },
            ],
            isStepped: false,
          },
          minMult: 0.7,
        },
      },
      {
        type: "spawnBurst",
        config: {
          spacing: spread / particleCount,
          start: travelAngle - spread / 2,
          distance: meteor.radius * 0.22,
        },
      },
      {
        type: "textureSingle",
        config: { texture: Texture.WHITE },
      },
    ],
  };
}

export class ParticleManager {
  private emitters: Emitter[] = [];
  readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  emit(config: EmitterConfigV3, x: number, y: number): void {
    const emitter = new Emitter(this.container, config);
    emitter.updateOwnerPos(x, y);
    emitter.emitNow();
    this.emitters.push(emitter);
  }

  update(dt: number): void {
    for (let i = this.emitters.length - 1; i >= 0; i--) {
      const emitter = this.emitters[i];
      emitter.update(dt);

      if (!emitter.emit && emitter.particleCount === 0) {
        emitter.destroy();
        this.emitters.splice(i, 1);
      }
    }
  }

  destroy(): void {
    for (const emitter of this.emitters) {
      emitter.destroy();
    }
    this.emitters.length = 0;
  }
}
