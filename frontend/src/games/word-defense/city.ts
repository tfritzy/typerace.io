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

interface Tower {
  start: number;
  end: number;
  height: number;
  spireEnd: number;
  spireHeight: number;
}

function moundEnvelope(tangent: number): number {
  const t = tangent / CITY_HALF_WIDTH;
  if (Math.abs(t) >= 1) return 0;
  const envelope = 1 - t * t;
  return envelope * envelope;
}

function interpolatedNoise(tangent: number, seed: number): number {
  const col = tangent + CITY_HALF_WIDTH;
  const c0 = Math.floor(col);
  const frac = col - c0;
  const n0 = noiseHash(c0 + seed, seed) * 0.3 + 0.7;
  const n1 = noiseHash(c0 + 1 + seed, seed) * 0.3 + 0.7;
  return n0 + (n1 - n0) * frac;
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

  const towers: Tower[] = [];
  const towerCount = 5 + Math.floor(noiseHash(seed, seed + 7) * 5);
  for (let ti = 0; ti < towerCount; ti++) {
    const tCenter =
      CITY_HALF_WIDTH *
      0.7 *
      (noiseHash(seed + ti * 3, seed + ti * 5) * 2 - 1);
    const tWidth =
      2 + Math.floor(noiseHash(seed + ti * 17, seed + ti * 19) * 2);
    const env = moundEnvelope(tCenter);
    const moundH = env * CITY_MAX_HEIGHT * 0.55;
    const maxExtra = CITY_MAX_HEIGHT * Math.sqrt(env) - moundH;
    if (maxExtra <= 0) continue;
    const height =
      moundH +
      maxExtra * (0.4 + 0.5 * noiseHash(seed + ti * 11, seed + ti * 13));
    const hasSpire =
      height > CITY_MAX_HEIGHT * 0.6 &&
      noiseHash(ti + seed * 7, seed + 200) < 0.25;
    const spireH = hasSpire
      ? 1 + Math.floor(noiseHash(ti + seed * 9, seed + 300) * 3)
      : 0;
    towers.push({
      start: tCenter - tWidth / 2,
      end: tCenter + tWidth / 2,
      height,
      spireEnd: tCenter + 0.5,
      spireHeight: spireH,
    });
  }

  let pixelCount = 0;
  const maxOutward = CITY_MAX_HEIGHT + 5;
  const extent = maxOutward + CITY_HALF_WIDTH + CITY_EMBED_DEPTH;
  const cityCx = center + outX * radius;
  const cityCy = center + outY * radius;
  const minPx = Math.max(0, Math.floor(cityCx - extent));
  const maxPx = Math.min(size - 1, Math.ceil(cityCx + extent));
  const minPy = Math.max(0, Math.floor(cityCy - extent));
  const maxPy = Math.min(size - 1, Math.ceil(cityCy + extent));

  for (let py = minPy; py <= maxPy; py++) {
    for (let px = minPx; px <= maxPx; px++) {
      if (data[py * size + px] === CITY_DATA_VALUE) continue;

      const dx = px - center;
      const dy = py - center;
      const radial = dx * outX + dy * outY;
      const tangent = dx * tanX + dy * tanY;

      const env = moundEnvelope(tangent);
      if (env <= 0) continue;

      const noise = interpolatedNoise(tangent, seed);
      let h = env * CITY_MAX_HEIGHT * 0.55 * noise;

      for (let ti = 0; ti < towers.length; ti++) {
        const tw = towers[ti];
        if (tangent >= tw.start && tangent < tw.end) {
          h = Math.max(h, tw.height);
          if (tw.spireHeight > 0 && tangent < tw.spireEnd) {
            h = Math.max(h, tw.height + tw.spireHeight);
          }
        }
      }

      const r = radial - radius;
      const surfaceR =
        Math.sqrt(Math.max(0, radius * radius - tangent * tangent)) - radius;

      if (r >= surfaceR - CITY_EMBED_DEPTH && r < surfaceR + h) {
        data[py * size + px] = CITY_DATA_VALUE;
        pixelCount++;
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
