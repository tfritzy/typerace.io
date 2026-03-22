import type { Meteor, SceneObject, WaveConfig } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  METEOR_NOISE_FREQ,
  METEOR_CORE_RADIUS, METEOR_LUMP_HEIGHT,
  ACTIVE_WAVE_ZOOM,
} from "./constants";
import { valueNoise } from "./noise";
import { rebuildImageData } from "./bitmap";
import { getRandomWord } from "../../utils/wordLists";
import { ACCENT_DARK_INDEX } from "./palette";

function createMeteorBitmap(
  radius: number
): { width: number; height: number; bitmap: HTMLCanvasElement } {
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
  return { width: diameter, height: diameter, bitmap };
}

export function spawnMeteor(langCode: string, usedWords: Set<string>, waveConfig: WaveConfig): Meteor {
  const side = Math.floor(Math.random() * 4);
  const margin = 20;
  const viewHalfW = CANVAS_WIDTH / (2 * ACTIVE_WAVE_ZOOM);
  const viewHalfH = CANVAS_HEIGHT / (2 * ACTIVE_WAVE_ZOOM);
  const spawnLeft = EARTH_CX - viewHalfW - margin;
  const spawnRight = EARTH_CX + viewHalfW + margin;
  const spawnTop = EARTH_CY - viewHalfH - margin;
  const spawnBottom = EARTH_CY + viewHalfH + margin;
  const spawnW = spawnRight - spawnLeft;
  const spawnH = spawnBottom - spawnTop;

  let x: number, y: number;
  if (side === 0) {
    x = spawnLeft + Math.random() * spawnW;
    y = spawnTop;
  } else if (side === 1) {
    x = spawnRight;
    y = spawnTop + Math.random() * spawnH;
  } else if (side === 2) {
    x = spawnLeft + Math.random() * spawnW;
    y = spawnBottom;
  } else {
    x = spawnLeft;
    y = spawnTop + Math.random() * spawnH;
  }

  const dx = EARTH_CX - x;
  const dy = EARTH_CY - y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const aimOffset = (Math.random() - 0.5) * EARTH_RADIUS * 0.8;
  const perpX = -dy / dist;
  const perpY = dx / dist;
  const tdx = EARTH_CX + perpX * aimOffset - x;
  const tdy = EARTH_CY + perpY * aimOffset - y;
  const tdist = Math.sqrt(tdx * tdx + tdy * tdy);

  const radius = waveConfig.meteorRadiusMin + Math.random() * (waveConfig.meteorRadiusMax - waveConfig.meteorRadiusMin);
  const speed = waveConfig.meteorSpeed;
  const vx = (tdx / tdist) * speed;
  const vy = (tdy / tdist) * speed;

  const bmp = createMeteorBitmap(radius);
  const word = getRandomWord(langCode, usedWords);
  const health = Math.ceil(radius);

  return {
    x: x - bmp.width / 2,
    y: y - bmp.height / 2,
    vx,
    vy,
    radius,
    word,
    typedCount: 0,
    health,
    maxHealth: health,
    ...bmp,
  };
}

export function checkMeteorHitsPlanet(planet: SceneObject, meteor: Meteor, planetRotation: number): boolean {
  const cx = meteor.x + meteor.width / 2;
  const cy = meteor.y + meteor.height / 2;

  const planetCx = planet.x + planet.width / 2;
  const planetCy = planet.y + planet.height / 2;
  const relX = cx - planetCx;
  const relY = cy - planetCy;
  const cos = Math.cos(-planetRotation);
  const sin = Math.sin(-planetRotation);
  const rotX = relX * cos - relY * sin;
  const rotY = relX * sin + relY * cos;

  const px = Math.floor(rotX + planet.width / 2);
  const py = Math.floor(rotY + planet.height / 2);
  if (px >= 0 && px < planet.width && py >= 0 && py < planet.height) {
    return planet.data[py * planet.width + px] !== 0;
  }
  return false;
}

export function getActiveWords(meteors: Meteor[]): Set<string> {
  const words = new Set<string>();
  for (const m of meteors) words.add(m.word);
  return words;
}
