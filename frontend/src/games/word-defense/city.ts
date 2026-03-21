import {
  CITY_DATA_VALUE,
  CITY_HALF_WIDTH,
  CITY_MAX_HEIGHT,
  CITY_EMBED_DEPTH,
} from "./constants";
import { noiseHash } from "./noise";

export function stampCities(
  data: Uint8Array,
  size: number,
  planetRadius: number,
  cityAngles: number[],
): number {
  let total = 0;
  const center = size / 2;
  for (const angle of cityAngles) {
    total += stampCity(data, size, center, planetRadius, angle);
  }
  return total;
}

function stampCity(
  data: Uint8Array,
  size: number,
  center: number,
  radius: number,
  angle: number,
): number {
  const outX = Math.cos(angle);
  const outY = Math.sin(angle);
  const tanX = -Math.sin(angle);
  const tanY = Math.cos(angle);

  const seed = Math.floor(angle * 1000) + 42;
  const totalWidth = CITY_HALF_WIDTH * 2;
  const heights = new Float64Array(totalWidth);

  for (let i = 0; i < totalWidth; i++) {
    const t = (i - CITY_HALF_WIDTH) / CITY_HALF_WIDTH;
    const envelope = Math.max(0, 1 - t * t);
    const moundBase = envelope * envelope * CITY_MAX_HEIGHT * 0.55;
    const n1 = noiseHash(i + seed, seed) * 0.3 + 0.7;
    heights[i] = Math.max(1, moundBase * n1);
  }

  const towerCount = 5 + Math.floor(noiseHash(seed, seed + 7) * 5);
  for (let ti = 0; ti < towerCount; ti++) {
    const tPos = Math.floor(CITY_HALF_WIDTH * 0.7 * (noiseHash(seed + ti * 3, seed + ti * 5) * 2 - 1) + CITY_HALF_WIDTH);
    if (tPos < 1 || tPos >= totalWidth - 1) continue;
    const t = (tPos - CITY_HALF_WIDTH) / CITY_HALF_WIDTH;
    const envelope = Math.max(0, 1 - t * t);
    const baseHeight = heights[tPos];
    const maxExtra = CITY_MAX_HEIGHT * envelope - baseHeight;
    if (maxExtra <= 0) continue;
    const towerHeight = baseHeight + maxExtra * (0.4 + 0.5 * noiseHash(seed + ti * 11, seed + ti * 13));
    heights[tPos] = Math.max(heights[tPos], towerHeight);
  }

  for (let i = 1; i < totalWidth - 1; i++) {
    const prev = heights[i - 1];
    const next = heights[i + 1];
    const minNeighbor = Math.min(prev, next);
    if (heights[i] < minNeighbor) {
      heights[i] = minNeighbor;
    }
  }

  let pixelCount = 0;

  for (let i = 0; i < totalWidth; i++) {
    const colHeight = Math.floor(heights[i]);
    if (colHeight < 1) continue;

    const tangentOffset = i - CITY_HALF_WIDTH;
    for (let r = -CITY_EMBED_DEPTH; r < colHeight; r++) {
      const px = Math.round(center + outX * (radius + r) + tanX * tangentOffset);
      const py = Math.round(center + outY * (radius + r) + tanY * tangentOffset);

      if (px >= 0 && px < size && py >= 0 && py < size) {
        if (data[py * size + px] !== CITY_DATA_VALUE) {
          data[py * size + px] = CITY_DATA_VALUE;
          pixelCount++;
        }
      }
    }

    if (colHeight > CITY_MAX_HEIGHT * 0.6 && noiseHash(i + seed * 7, seed + 200) < 0.25) {
      const spireHeight = 1 + Math.floor(noiseHash(i + seed * 9, seed + 300) * 3);
      for (let r = colHeight; r < colHeight + spireHeight; r++) {
        const px = Math.round(center + outX * (radius + r) + tanX * tangentOffset);
        const py = Math.round(center + outY * (radius + r) + tanY * tangentOffset);
        if (px >= 0 && px < size && py >= 0 && py < size) {
          if (data[py * size + px] !== CITY_DATA_VALUE) {
            data[py * size + px] = CITY_DATA_VALUE;
            pixelCount++;
          }
        }
      }
    }
  }

  return pixelCount;
}

export function countCityPixels(data: Uint8Array): number {
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === CITY_DATA_VALUE) count++;
  }
  return count;
}
