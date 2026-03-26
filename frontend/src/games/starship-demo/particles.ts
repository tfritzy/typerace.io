import { Emitter } from "@pixi/particle-emitter";
import type { EmitterConfigV3 } from "@pixi/particle-emitter";
import { Container, type Spritesheet } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

function createStarFieldConfig(starSheet: Spritesheet): EmitterConfigV3 {
  const firstTexture = Object.values(starSheet.textures)[0];

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
        config: { texture: firstTexture },
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

function createStarBurstConfig(starSheet: Spritesheet): EmitterConfigV3 {
  const textures = Object.values(starSheet.textures);

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
  private starSheet: Spritesheet;
  readonly container: Container;

  constructor(starSheet: Spritesheet) {
    this.starSheet = starSheet;
    this.container = new Container();
    this.burstInterval = 4 + Math.random() * 3;

    this.fieldEmitter = new Emitter(
      this.container,
      createStarFieldConfig(starSheet)
    );
    this.fieldEmitter.emit = true;
  }

  update(dt: number): void {
    this.fieldEmitter.update(dt);

    this.burstTimer += dt;
    if (this.burstTimer >= this.burstInterval) {
      this.burstTimer = 0;
      this.burstInterval = 4 + Math.random() * 3;

      const emitter = new Emitter(
        this.container,
        createStarBurstConfig(this.starSheet)
      );
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
