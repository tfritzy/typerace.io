import { Emitter } from "@pixi/particle-emitter";
import type { EmitterConfigV3 } from "@pixi/particle-emitter";
import { Container, Texture } from "pixi.js";
import type { Meteor } from "./types";
import { MISSILE_EXPLOSION_RADIUS } from "./constants";
import { getPalette, ACCENT_DARK_INDEX } from "./palette";

function createDebrisTexture(size: number): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const palette = getPalette();
  const color = palette[ACCENT_DARK_INDEX];
  const r = color[0];
  const g = color[1];
  const b = color[2];

  const cx = size / 2;
  const cy = size / 2;
  const vertices = 5 + Math.floor(Math.random() * 3);
  const baseRadius = size * 0.4;

  ctx.beginPath();
  for (let i = 0; i < vertices; i++) {
    const angle = (i / vertices) * Math.PI * 2 + Math.random() * 0.4;
    const jitter = 0.5 + Math.random() * 0.5;
    const px = cx + Math.cos(angle) * baseRadius * jitter;
    const py = cy + Math.sin(angle) * baseRadius * jitter;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();

  const darken = 0.7 + Math.random() * 0.3;
  ctx.fillStyle = `rgb(${Math.floor(r * darken)},${Math.floor(g * darken)},${Math.floor(b * darken)})`;
  ctx.fill();

  const edgeDarken = 0.5 + Math.random() * 0.2;
  ctx.strokeStyle = `rgb(${Math.floor(r * edgeDarken)},${Math.floor(g * edgeDarken)},${Math.floor(b * edgeDarken)})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  return Texture.from({ resource: canvas, transparent: true });
}

let debrisTextureCache: Texture[] | null = null;

function getDebrisTextures(): Texture[] {
  if (!debrisTextureCache) {
    debrisTextureCache = [];
    for (let i = 0; i < 6; i++) {
      debrisTextureCache.push(createDebrisTexture(16));
    }
  }
  return debrisTextureCache;
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
  const particleCount = Math.max(8, Math.round(meteor.radius * 0.7));
  const spread = 360;
  const travelAngle = Math.atan2(-meteor.vy, meteor.vx) * 180 / Math.PI;
  const meteorSpeed = Math.hypot(meteor.vx, meteor.vy);
  const minSpeed = meteor.radius * 1.5 + meteorSpeed * 0.3;
  const maxSpeed = meteor.radius * 4.0 + meteorSpeed * 0.5;
  const maxSize = Math.max(2, meteor.radius * 0.35);
  const minSize = Math.max(1, meteor.radius * 0.1);
  const textures = getDebrisTextures();
  const textureWidth = 16;
  const baseScale = maxSize / textureWidth;
  const endScale = minSize / textureWidth;

  return {
    lifetime: { min: 0.4, max: 1.0 },
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
              { value: 0.8, time: 0.3 },
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
          minMult: 0.4,
        },
      },
      {
        type: "moveSpeed",
        config: {
          speed: {
            list: [
              { value: maxSpeed, time: 0 },
              { value: minSpeed, time: 0.4 },
              { value: Math.max(minSpeed * 0.2, 1), time: 1 },
            ],
            isStepped: false,
          },
          minMult: 0.5,
        },
      },
      {
        type: "rotation",
        config: {
          minStart: 0,
          maxStart: 360,
          minSpeed: -200,
          maxSpeed: 200,
          accel: 0,
        },
      },
      {
        type: "spawnBurst",
        config: {
          spacing: spread / particleCount,
          start: travelAngle - spread / 2,
          distance: meteor.radius * 0.3,
        },
      },
      {
        type: "textureRandom",
        config: { textures },
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
