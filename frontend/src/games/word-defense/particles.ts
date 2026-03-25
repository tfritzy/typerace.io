import { Emitter } from "@pixi/particle-emitter";
import type { EmitterConfigV3 } from "@pixi/particle-emitter";
import { Container, Texture } from "pixi.js";
import type { Meteor } from "./types";

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

let ringTextureCache: Texture | null = null;
const RING_TEXTURE_SIZE = 64;

function getRingTexture(): Texture {
  if (!ringTextureCache) {
    const size = RING_TEXTURE_SIZE;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const cx = size / 2;
    const cy = size / 2;
    const outerRadius = size / 2 - 1;
    const innerRadius = outerRadius - 3;
    ctx.beginPath();
    ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = "white";
    ctx.fill();
    ringTextureCache = Texture.from({ resource: canvas, transparent: true });
  }
  return ringTextureCache;
}

export function createExplosionConfig(
  explosionRadius: number,
): EmitterConfigV3 {
  const ringTexture = getRingTexture();
  const peakScale = (explosionRadius * 2) / RING_TEXTURE_SIZE;

  return {
    lifetime: { min: 0.3, max: 0.5 },
    frequency: 0.04,
    emitterLifetime: 0.12,
    maxParticles: 4,
    addAtBack: true,
    pos: { x: 0, y: 0 },
    behaviors: [
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              { value: 0.9, time: 0 },
              { value: 0.6, time: 0.4 },
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
              { value: peakScale * 0.05, time: 0 },
              { value: peakScale, time: 0.5 },
              { value: peakScale * 1.2, time: 1 },
            ],
          },
          minMult: 0.8,
        },
      },
      {
        type: "color",
        config: {
          color: {
            list: [
              { value: "ffffff", time: 0 },
              { value: "ffcc44", time: 0.3 },
              { value: "ff6600", time: 0.7 },
              { value: "331100", time: 1 },
            ],
          },
        },
      },
      {
        type: "textureSingle",
        config: { texture: ringTexture },
      },
      {
        type: "spawnPoint",
        config: {},
      },
    ],
  };
}

export function createMeteorDestructionConfig(meteor: Meteor): EmitterConfigV3 {
  const area = Math.PI * meteor.radius * meteor.radius;
  const particleCount = Math.min(120, Math.max(16, Math.round(area * 0.12)));
  const driftSpeed = meteor.radius * 0.8;
  const maxSize = Math.max(6, meteor.radius * 0.9);
  const minSize = Math.max(3, meteor.radius * 0.3);
  const textures = getDebrisTextures();
  const textureWidth = 16;
  const baseScale = maxSize / textureWidth;
  const endScale = minSize / textureWidth;

  return {
    lifetime: { min: 0.8, max: 1.5 },
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
              { value: 0.8, time: 0.4 },
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
              { value: baseScale * 0.7, time: 0.5 },
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
              { value: driftSpeed, time: 0 },
              { value: driftSpeed * 0.3, time: 0.5 },
              { value: 0, time: 1 },
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
          minSpeed: -90,
          maxSpeed: 90,
          accel: 0,
        },
      },
      {
        type: "spawnBurst",
        config: {
          spacing: 360 / particleCount,
          start: 0,
          distance: meteor.radius * 0.6,
        },
      },
      {
        type: "textureRandom",
        config: { textures },
      },
    ],
  };
}

interface MovingEmitter {
  emitter: Emitter;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

export class ParticleManager {
  private emitters: Emitter[] = [];
  private movingEmitters: MovingEmitter[] = [];
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

  emitMoving(config: EmitterConfigV3, x: number, y: number, vx: number, vy: number): void {
    const emitter = new Emitter(this.container, config);
    emitter.updateOwnerPos(x, y);
    emitter.emitNow();
    this.movingEmitters.push({ emitter, vx, vy, x, y });
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

    for (let i = this.movingEmitters.length - 1; i >= 0; i--) {
      const me = this.movingEmitters[i];
      me.x += me.vx * dt;
      me.y += me.vy * dt;
      me.emitter.updateOwnerPos(me.x, me.y);
      me.emitter.update(dt);

      if (!me.emitter.emit && me.emitter.particleCount === 0) {
        me.emitter.destroy();
        this.movingEmitters.splice(i, 1);
      }
    }
  }

  destroy(): void {
    for (const emitter of this.emitters) {
      emitter.destroy();
    }
    this.emitters.length = 0;
    for (const me of this.movingEmitters) {
      me.emitter.destroy();
    }
    this.movingEmitters.length = 0;
  }
}
