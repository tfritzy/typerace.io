import { Container, Sprite, Text, Texture, TextStyle, Graphics } from "pixi.js";
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
