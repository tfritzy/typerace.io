import {
  CITY_HALF_WIDTH,
  CITY_MAX_HEIGHT,
  CITY_EMBED_DEPTH,
} from "./constants";
import { noiseHash, valueNoise } from "./noise";

export function stampCities(
  data: Uint32Array,
  size: number,
  planetRadius: number,
  cityAngles: number[],
  cityPacked: number,
): number {
  let total = 0;
  const center = size / 2;
  for (const angle of cityAngles) {
    total += stampCity(data, size, center, planetRadius, angle, cityPacked);
  }
  return total;
}

function cityHeight(tangent: number, seed: number): number {
  const t = tangent / CITY_HALF_WIDTH;
  if (Math.abs(t) >= 1) return 0;

  const envelope = 1 - t * t;
  const envSq = envelope * envelope;

  const n1 = valueNoise(tangent * 0.15 + seed, seed * 0.7);
  const n2 = valueNoise(tangent * 0.4 + seed * 1.3, seed * 0.3) * 0.5;
  const n3 = valueNoise(tangent * 1.2 + seed * 2.1, seed * 1.1) * 0.25;
  const terrain = (n1 + n2 + n3) / 1.75;

  const baseH = envSq * CITY_MAX_HEIGHT * terrain;

  const towerNoise = valueNoise(tangent * 0.8 + seed * 3.7, seed * 2.3);
  const towerThreshold = 0.55;
  let towerH = 0;
  if (towerNoise > towerThreshold && envSq > 0.05) {
    const towerStrength = (towerNoise - towerThreshold) / (1 - towerThreshold);
    towerH = towerStrength * CITY_MAX_HEIGHT * 0.6 * envSq;
  }

  const spireNoise = valueNoise(tangent * 2.5 + seed * 5.1, seed * 4.2);
  let spireH = 0;
  if (spireNoise > 0.7 && envSq > 0.15) {
    spireH = (spireNoise - 0.7) / 0.3 * CITY_MAX_HEIGHT * 0.3 * envSq;
  }

  return baseH + towerH + spireH;
}

function stampCity(
  data: Uint32Array,
  size: number,
  center: number,
  radius: number,
  angle: number,
  cityPacked: number,
): number {
  const outX = Math.cos(angle);
  const outY = Math.sin(angle);
  const tanX = -Math.sin(angle);
  const tanY = Math.cos(angle);

  const seed = Math.floor(angle * 1000) + 42;

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
      const idx = py * size + px;
      if (data[idx] === cityPacked) continue;

      const dx = px - center;
      const dy = py - center;
      const radial = dx * outX + dy * outY;
      const tangent = dx * tanX + dy * tanY;

      const h = cityHeight(tangent, seed);
      if (h <= 0) continue;

      const r = radial - radius;
      const surfaceR =
        Math.sqrt(Math.max(0, radius * radius - tangent * tangent)) - radius;

      if (r >= surfaceR - CITY_EMBED_DEPTH && r < surfaceR + h) {
        data[idx] = cityPacked;
        pixelCount++;
      }
    }
  }

  return pixelCount;
}

export function countCityPixels(data: Uint32Array, cityPacked: number): number {
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    if (data[i] === cityPacked) count++;
  }
  return count;
}
