import { Emitter } from "@pixi/particle-emitter";
import type { EmitterConfigV3 } from "@pixi/particle-emitter";
import { Container, Texture, Rectangle } from "pixi.js";
import {
  STAR_PARTICLE_FRAME_SIZE,
  STAR_PARTICLE_FRAME_COUNT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from "./constants";

export function buildStarParticleTextures(sheet: Texture): Texture[] {
  const frames: Texture[] = [];
  const size = STAR_PARTICLE_FRAME_SIZE;
  for (let i = 0; i < STAR_PARTICLE_FRAME_COUNT; i++) {
    frames.push(
      new Texture({
        source: sheet.source,
        frame: new Rectangle(0, i * size, size, size),
      })
    );
  }
  return frames;
}

function createStarFieldConfig(textures: Texture[]): EmitterConfigV3 {
  return {
    lifetime: { min: 3, max: 6 },
    frequency: 0.08,
    emitterLifetime: -1,
    maxParticles: 80,
    addAtBack: true,
    pos: { x: 0, y: 0 },
    behaviors: [
      {
        type: "spawnShape",
        config: {
          type: "rect",
          data: { x: 0, y: 0, w: CANVAS_WIDTH, h: CANVAS_HEIGHT },
        },
      },
      {
        type: "textureSingle",
        config: { texture: textures[0] },
      },
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              { value: 0, time: 0 },
              { value: 0.8, time: 0.2 },
              { value: 0.8, time: 0.8 },
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
              { value: 1.5, time: 0 },
              { value: 2.5, time: 0.5 },
              { value: 1.5, time: 1 },
            ],
          },
          minMult: 0.5,
        },
      },
    ],
  };
}

function createStarBurstConfig(textures: Texture[]): EmitterConfigV3 {
  return {
    lifetime: { min: 0.4, max: 1.2 },
    frequency: 0.01,
    emitterLifetime: 0.3,
    maxParticles: 20,
    addAtBack: true,
    pos: { x: 0, y: 0 },
    behaviors: [
      {
        type: "spawnShape",
        config: {
          type: "rect",
          data: { x: -20, y: -20, w: 40, h: 40 },
        },
      },
      {
        type: "textureRandom",
        config: { textures },
      },
      {
        type: "alpha",
        config: {
          alpha: {
            list: [
              { value: 0, time: 0 },
              { value: 1, time: 0.15 },
              { value: 0.6, time: 0.6 },
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
              { value: 2, time: 0 },
              { value: 3, time: 0.5 },
              { value: 1, time: 1 },
            ],
          },
          minMult: 0.5,
        },
      },
      {
        type: "moveSpeed",
        config: {
          speed: {
            list: [
              { value: 20, time: 0 },
              { value: 5, time: 1 },
            ],
          },
        },
      },
      {
        type: "rotation",
        config: {
          minStart: 0,
          maxStart: 360,
          minSpeed: 0,
          maxSpeed: 0,
          accel: 0,
        },
      },
    ],
  };
}

export class StarParticleManager {
  private fieldEmitter: Emitter;
  private burstEmitters: Emitter[] = [];
  private burstTimer = 0;
  private burstInterval: number;
  private starTextures: Texture[];
  readonly container: Container;

  constructor(starTextures: Texture[]) {
    this.starTextures = starTextures;
    this.container = new Container();
    this.burstInterval = 4 + Math.random() * 3;

    const fieldConfig = createStarFieldConfig(starTextures);
    this.fieldEmitter = new Emitter(this.container, fieldConfig);
    this.fieldEmitter.emit = true;
  }

  update(dt: number): void {
    this.fieldEmitter.update(dt);

    this.burstTimer += dt;
    if (this.burstTimer >= this.burstInterval) {
      this.burstTimer = 0;
      this.burstInterval = 4 + Math.random() * 3;

      const config = createStarBurstConfig(this.starTextures);
      const emitter = new Emitter(this.container, config);
      emitter.updateOwnerPos(
        Math.random() * CANVAS_WIDTH,
        Math.random() * CANVAS_HEIGHT
      );
      emitter.emitNow();
      this.burstEmitters.push(emitter);
    }

    for (let i = this.burstEmitters.length - 1; i >= 0; i--) {
      const e = this.burstEmitters[i];
      e.update(dt);
      if (!e.emit && e.particleCount === 0) {
        e.destroy();
        this.burstEmitters.splice(i, 1);
      }
    }
  }

  destroy(): void {
    this.fieldEmitter.destroy();
    for (const e of this.burstEmitters) {
      e.destroy();
    }
    this.burstEmitters.length = 0;
  }
}
