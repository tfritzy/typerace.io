import {
  CITY_DATA_VALUE,
  CITY_HALF_WIDTH,
  CITY_MAX_HEIGHT,
  CITY_MIN_HEIGHT,
  CITY_EMBED_DEPTH,
  CITY_MIN_BUILDINGS,
  CITY_BUILDING_COUNT_VARIANCE,
} from "./constants";

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

  const numBuildings = CITY_MIN_BUILDINGS + Math.floor(Math.random() * CITY_BUILDING_COUNT_VARIANCE);

  let pixelCount = 0;
  let x = -CITY_HALF_WIDTH;

  for (let b = 0; b < numBuildings && x < CITY_HALF_WIDTH; b++) {
    const bw = 2 + Math.floor(Math.random() * 3);
    const gap = Math.random() < 0.3 ? 1 : 0;
    const normalizedPos = (x + bw / 2) / CITY_HALF_WIDTH;
    const envelope = Math.max(0, 1 - normalizedPos * normalizedPos);
    const height = Math.floor(
      CITY_MIN_HEIGHT + envelope * (CITY_MAX_HEIGHT - CITY_MIN_HEIGHT) * (0.4 + 0.6 * Math.random()),
    );

    for (let t = 0; t < bw; t++) {
      for (let r = -CITY_EMBED_DEPTH; r < height; r++) {
        const tangentOffset = x + t;
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

    x += bw + gap;
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
