import type { Meteor, SceneObject, WaveConfig } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  METEOR_COLOR, METEOR_NOISE_FREQ,
  METEOR_CORE_RADIUS, METEOR_LUMP_HEIGHT,
  BULLET_CARVE_RADIUS, MIN_SPLIT_PIXELS,
  ACTIVE_WAVE_ZOOM,
} from "./constants";
import { valueNoise } from "./noise";
import { rebuildImageData, updateBitmap, carveCircle } from "./bitmap";
import { getRandomWord } from "../../utils/wordLists";

function createMeteorBitmap(
  radius: number
): Pick<SceneObject, "data" | "imageData" | "width" | "height" | "bitmap"> {
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
        data[py * diameter + px] = 1;
        continue;
      }
      const n = valueNoise(px * noiseFreq + seedX, py * noiseFreq + seedY);
      if (dist <= METEOR_CORE_RADIUS + n * METEOR_LUMP_HEIGHT) {
        data[py * diameter + px] = 1;
      }
    }
  }

  const imageData = new ImageData(diameter, diameter);
  rebuildImageData(data, imageData, diameter, diameter, METEOR_COLOR);
  const bitmap = document.createElement("canvas");
  bitmap.width = diameter;
  bitmap.height = diameter;
  bitmap.getContext("2d")!.putImageData(imageData, 0, 0);
  return { data, imageData, width: diameter, height: diameter, bitmap };
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

  return {
    x: x - bmp.width / 2,
    y: y - bmp.height / 2,
    vx,
    vy,
    radius,
    word,
    typedCount: 0,
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

function findConnectedComponents(data: Uint8Array, width: number, height: number): number[][] {
  const visited = new Uint8Array(width * height);
  const components: number[][] = [];

  for (let i = 0; i < width * height; i++) {
    if (data[i] && !visited[i]) {
      const component: number[] = [];
      const stack = [i];
      visited[i] = 1;

      while (stack.length > 0) {
        const idx = stack.pop()!;
        component.push(idx);
        const x = idx % width;
        const y = Math.floor(idx / width);

        if (y > 0 && data[idx - width] && !visited[idx - width]) {
          visited[idx - width] = 1;
          stack.push(idx - width);
        }
        if (y < height - 1 && data[idx + width] && !visited[idx + width]) {
          visited[idx + width] = 1;
          stack.push(idx + width);
        }
        if (x > 0 && data[idx - 1] && !visited[idx - 1]) {
          visited[idx - 1] = 1;
          stack.push(idx - 1);
        }
        if (x < width - 1 && data[idx + 1] && !visited[idx + 1]) {
          visited[idx + 1] = 1;
          stack.push(idx + 1);
        }
      }

      components.push(component);
    }
  }

  return components;
}

function createMeteorFromComponent(
  original: Meteor,
  pixelIndices: number[],
  langCode: string,
  usedWords: Set<string>
): Meteor {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const idx of pixelIndices) {
    const x = idx % original.width;
    const y = Math.floor(idx / original.width);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const newWidth = maxX - minX + 1;
  const newHeight = maxY - minY + 1;
  const newData = new Uint8Array(newWidth * newHeight);

  for (const idx of pixelIndices) {
    const x = idx % original.width - minX;
    const y = Math.floor(idx / original.width) - minY;
    newData[y * newWidth + x] = 1;
  }

  const imageData = new ImageData(newWidth, newHeight);
  rebuildImageData(newData, imageData, newWidth, newHeight, METEOR_COLOR);
  const bitmap = document.createElement("canvas");
  bitmap.width = newWidth;
  bitmap.height = newHeight;
  bitmap.getContext("2d")!.putImageData(imageData, 0, 0);

  const newRadius = Math.max(newWidth, newHeight) / 2;
  const word = getRandomWord(langCode, usedWords);

  return {
    x: original.x + minX,
    y: original.y + minY,
    vx: original.vx,
    vy: original.vy,
    radius: newRadius,
    word,
    typedCount: 0,
    width: newWidth,
    height: newHeight,
    data: newData,
    imageData,
    bitmap,
  };
}

export interface BulletImpactResult {
  meteors: Meteor[];
  pixelsDestroyed: number;
}

export function handleBulletImpact(
  meteor: Meteor,
  hitX: number,
  hitY: number,
  langCode: string,
  usedWords: Set<string>
): BulletImpactResult {
  let pixelsBefore = 0;
  for (let i = 0; i < meteor.data.length; i++) {
    if (meteor.data[i]) pixelsBefore++;
  }

  carveCircle(meteor, hitX, hitY, BULLET_CARVE_RADIUS);

  const components = findConnectedComponents(meteor.data, meteor.width, meteor.height);
  const validComponents = components.filter(c => c.length >= MIN_SPLIT_PIXELS);

  let pixelsAfter = 0;
  for (const comp of validComponents) {
    pixelsAfter += comp.length;
  }
  const pixelsDestroyed = pixelsBefore - pixelsAfter;

  if (validComponents.length === 0) {
    return { meteors: [], pixelsDestroyed };
  }

  if (validComponents.length === 1) {
    if (components.length > 1) {
      const validSet = new Set(validComponents[0]);
      for (let i = 0; i < meteor.data.length; i++) {
        if (meteor.data[i] && !validSet.has(i)) {
          meteor.data[i] = 0;
        }
      }
    }
    rebuildImageData(meteor.data, meteor.imageData, meteor.width, meteor.height, METEOR_COLOR);
    updateBitmap(meteor);
    return { meteors: [meteor], pixelsDestroyed };
  }

  return {
    meteors: validComponents.map(comp =>
      createMeteorFromComponent(meteor, comp, langCode, usedWords)
    ),
    pixelsDestroyed,
  };
}
