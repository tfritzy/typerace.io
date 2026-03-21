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
    const moundBase = envelope * envelope * CITY_MAX_HEIGHT * 0.5;
    const n1 = noiseHash(i + seed, seed) * 0.6 + 0.4;
    heights[i] = moundBase * n1;
  }

  const towerCount = 4 + Math.floor(noiseHash(seed, seed + 7) * 4);
  for (let ti = 0; ti < towerCount; ti++) {
    const tPos = Math.floor(CITY_HALF_WIDTH * 0.6 * (noiseHash(seed + ti * 3, seed + ti * 5) * 2 - 1) + CITY_HALF_WIDTH);
    if (tPos < 2 || tPos >= totalWidth - 2) continue;
    const t = (tPos - CITY_HALF_WIDTH) / CITY_HALF_WIDTH;
    const envelope = Math.max(0, 1 - t * t);
    const towerHeight = CITY_MAX_HEIGHT * (0.6 + 0.4 * noiseHash(seed + ti * 11, seed + ti * 13)) * envelope;
    const towerWidth = 1 + Math.floor(noiseHash(seed + ti * 17, seed + ti * 19) * 2);
    for (let w = 0; w < towerWidth && tPos + w < totalWidth; w++) {
      heights[tPos + w] = Math.max(heights[tPos + w], towerHeight);
    }
  }

  let pixelCount = 0;

  for (let i = 0; i < totalWidth; i++) {
    const isGap = noiseHash(i + seed * 3, seed + 99) < 0.08;
    if (isGap) continue;

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

    if (colHeight > CITY_MAX_HEIGHT * 0.5 && noiseHash(i + seed * 7, seed + 200) < 0.35) {
      const spireHeight = 2 + Math.floor(noiseHash(i + seed * 9, seed + 300) * 5);
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
