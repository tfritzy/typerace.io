import { Container, Sprite, Text, Texture, TextStyle, Graphics } from "pixi.js";
import type { EmitterConfigV3 } from "@pixi/particle-emitter";
import type { Meteor, MeteorObject } from "./types";
import {
  TARGET_WORD_FONT_SIZE, TARGET_WORD_OFFSET_Y, TARGET_WORD_UNTYPED_ALPHA, TARGET_WORD_TYPED_ALPHA,
  BULLET_RENDER_RADIUS,
  METEOR_NOISE_FREQ, METEOR_CORE_RADIUS, METEOR_LUMP_HEIGHT,
} from "./constants";
import { valueNoise } from "./noise";
import { rebuildImageData } from "./bitmap";
import { ACCENT_DARK_INDEX } from "./palette";

function createMeteorBitmap(radius: number): HTMLCanvasElement {
  const intRadius = Math.ceil(radius);
  const diameter = intRadius * 2;
  const data = new Uint8Array(diameter * diameter);
  const seedX = Math.random() * 1000;
  const seedY = Math.random() * 1000;
  const noiseFreq = METEOR_NOISE_FREQ / intRadius;

  for (let py = 0; py < diameter; py++) {
    for (let px = 0; px < diameter; px++) {
      const dx = px - intRadius;
      const dy = py - intRadius;
      const dist = Math.sqrt(dx * dx + dy * dy) / intRadius;
      if (dist <= METEOR_CORE_RADIUS) {
        data[py * diameter + px] = ACCENT_DARK_INDEX;
        continue;
      }
      const n = valueNoise(px * noiseFreq + seedX, py * noiseFreq + seedY);
      if (dist <= METEOR_CORE_RADIUS + n * METEOR_LUMP_HEIGHT) {
        data[py * diameter + px] = ACCENT_DARK_INDEX;
      }
    }
  }

  const imageData = new ImageData(diameter, diameter);
  rebuildImageData(data, imageData, diameter, diameter);
  const bitmap = document.createElement("canvas");
  bitmap.width = diameter;
  bitmap.height = diameter;
  bitmap.getContext("2d")!.putImageData(imageData, 0, 0);
  return bitmap;
}

export function createMeteorObject(meteor: Meteor, untypedStyle: TextStyle, typedStyle: TextStyle): MeteorObject {
  const container = new Container();
  container.position.set(meteor.x, meteor.y);

  const bitmap = createMeteorBitmap(meteor.radius);
  const tex = Texture.from({ resource: bitmap, transparent: true });
  const sprite = new Sprite(tex);
  sprite.anchor.set(0.5);
  container.addChild(sprite);

  const healthBar = new Graphics();
  container.addChild(healthBar);

  const untypedText = new Text({ text: meteor.word, style: untypedStyle });
  untypedText.anchor.set(0.5, 0);
  untypedText.position.set(0, meteor.radius + TARGET_WORD_OFFSET_Y + TARGET_WORD_FONT_SIZE);
  untypedText.alpha = TARGET_WORD_UNTYPED_ALPHA;
  container.addChild(untypedText);

  const typedText = new Text({ text: "", style: typedStyle });
  typedText.anchor.set(0, 0);
  typedText.alpha = TARGET_WORD_TYPED_ALPHA;
  typedText.visible = false;
  container.addChild(typedText);

  return { data: meteor, container, sprite, untypedText, typedText, healthBar };
}

export function createProjectileGraphics(): Graphics {
  const g = new Graphics();
  g.circle(0, 0, BULLET_RENDER_RADIUS);
  g.fill(0xffffff);
  return g;
}

export function createMeteorDestructionEmitterConfig(meteor: Meteor): EmitterConfigV3 {
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
    lifetime: {
      min: lifetimeMin,
      max: lifetimeMax,
    },
    frequency: 1,
    spawnChance: 1,
    particlesPerWave: particleCount,
    emitterLifetime: 0,
    maxParticles: particleCount,
    emit: false,
    pos: {
      x: 0,
      y: 0,
    },
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
        config: {
          texture: Texture.WHITE,
        },
      },
    ],
  };
}
