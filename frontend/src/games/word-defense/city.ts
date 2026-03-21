import { CITY_DATA_VALUE } from "./constants";

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

  const cityHalfWidth = 18;
  const numBuildings = 8 + Math.floor(Math.random() * 5);
  const maxHeight = 20;
  const minHeight = 3;
  const embedDepth = 3;

  let pixelCount = 0;
  let x = -cityHalfWidth;

  for (let b = 0; b < numBuildings && x < cityHalfWidth; b++) {
    const bw = 2 + Math.floor(Math.random() * 3);
    const gap = Math.random() < 0.3 ? 1 : 0;
    const normalizedPos = (x + bw / 2) / cityHalfWidth;
    const envelope = Math.max(0, 1 - normalizedPos * normalizedPos);
    const height = Math.floor(
      minHeight + envelope * (maxHeight - minHeight) * (0.4 + 0.6 * Math.random()),
    );

    for (let t = 0; t < bw; t++) {
      for (let r = -embedDepth; r < height; r++) {
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
