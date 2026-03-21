import type { SceneObject } from "./types";
import { rebuildImageData } from "./bitmap";
import { fractalNoise } from "./noise";

const TERRAIN_NOISE_SCALE = 0.012;
const TERRAIN_WARP_STRENGTH = 40;
const TERRAIN_SEED_RANGE = 1000;

const SNOW_THRESHOLD = 0.82;
const MOUNTAIN_THRESHOLD = 0.72;
const HIGHLAND_THRESHOLD = 0.60;
const LOWLAND_THRESHOLD = 0.48;
const BEACH_THRESHOLD = 0.45;
const SHALLOW_OCEAN_THRESHOLD = 0.35;

const POLAR_CAP_STRENGTH = 0.25;
const EDGE_FALLOFF_START = 0.85;
const ATMOSPHERE_SHADE_STRENGTH = 0.3;
const HAZE_START = 0.6;
const HAZE_STRENGTH = 0.15;
const HAZE_COLOR: [number, number, number] = [100, 130, 180];

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function createPlanet(
  cx: number,
  cy: number,
  radius: number,
  color: [number, number, number]
): SceneObject {
  const diameter = radius * 2;
  const data = new Uint8Array(diameter * diameter);
  const colors = new Uint8Array(diameter * diameter * 3);
  const r2 = radius * radius;

  const seedX = Math.random() * TERRAIN_SEED_RANGE;
  const seedY = Math.random() * TERRAIN_SEED_RANGE;
  const warpSeedX = Math.random() * TERRAIN_SEED_RANGE;
  const warpSeedY = Math.random() * TERRAIN_SEED_RANGE;

  for (let y = 0; y < diameter; y++) {
    for (let x = 0; x < diameter; x++) {
      const dx = x - radius;
      const dy = y - radius;
      const distSq = dx * dx + dy * dy;

      if (distSq <= r2) {
        const idx = y * diameter + x;

        const wx = fractalNoise(
          (x + warpSeedX) * TERRAIN_NOISE_SCALE * 0.7,
          (y + warpSeedY) * TERRAIN_NOISE_SCALE * 0.7,
          3, 2.0, 0.5
        ) * TERRAIN_WARP_STRENGTH;
        const wy = fractalNoise(
          (x + warpSeedX + 300) * TERRAIN_NOISE_SCALE * 0.7,
          (y + warpSeedY + 300) * TERRAIN_NOISE_SCALE * 0.7,
          3, 2.0, 0.5
        ) * TERRAIN_WARP_STRENGTH;

        let height = fractalNoise(
          (x + wx + seedX) * TERRAIN_NOISE_SCALE,
          (y + wy + seedY) * TERRAIN_NOISE_SCALE,
          5, 2.0, 0.5
        );

        const normalizedY = dy / radius;
        const polarEffect = Math.pow(Math.abs(normalizedY), 3) * POLAR_CAP_STRENGTH;

        const dist = Math.sqrt(distSq) / radius;
        if (dist > EDGE_FALLOFF_START) {
          height -= (dist - EDGE_FALLOFF_START) / (1 - EDGE_FALLOFF_START) * (1 - EDGE_FALLOFF_START);
        }

        let r: number, g: number, b: number;

        if (height + polarEffect > SNOW_THRESHOLD) {
          data[idx] = 8;
          const t = Math.min((height + polarEffect - SNOW_THRESHOLD) / (1 - SNOW_THRESHOLD), 1);
          [r, g, b] = lerpColor([200, 210, 220], [240, 245, 250], t);
        } else if (height > MOUNTAIN_THRESHOLD) {
          data[idx] = 7;
          const t = (height - MOUNTAIN_THRESHOLD) / (SNOW_THRESHOLD - MOUNTAIN_THRESHOLD);
          [r, g, b] = lerpColor([110, 100, 80], [145, 135, 115], t);
        } else if (height > HIGHLAND_THRESHOLD) {
          data[idx] = 6;
          const t = (height - HIGHLAND_THRESHOLD) / (MOUNTAIN_THRESHOLD - HIGHLAND_THRESHOLD);
          [r, g, b] = lerpColor([45, 110, 45], [65, 130, 55], t);
        } else if (height > LOWLAND_THRESHOLD) {
          data[idx] = 5;
          const t = (height - LOWLAND_THRESHOLD) / (HIGHLAND_THRESHOLD - LOWLAND_THRESHOLD);
          [r, g, b] = lerpColor([75, 150, 65], [55, 125, 50], t);
        } else if (height > BEACH_THRESHOLD) {
          data[idx] = 4;
          const t = (height - BEACH_THRESHOLD) / (LOWLAND_THRESHOLD - BEACH_THRESHOLD);
          [r, g, b] = lerpColor([60, 110, 160], [190, 180, 140], t);
        } else if (height > SHALLOW_OCEAN_THRESHOLD) {
          data[idx] = 2;
          const t = (height - SHALLOW_OCEAN_THRESHOLD) / (BEACH_THRESHOLD - SHALLOW_OCEAN_THRESHOLD);
          [r, g, b] = lerpColor([35, 75, 140], [55, 105, 165], t);
        } else {
          data[idx] = 1;
          const t = Math.max(height / SHALLOW_OCEAN_THRESHOLD, 0);
          [r, g, b] = lerpColor([15, 40, 90], [30, 65, 130], t);
        }

        const shade = 1 - dist * dist * ATMOSPHERE_SHADE_STRENGTH;
        const haze = Math.max(0, dist - HAZE_START) / (1 - HAZE_START);

        r = r * shade + HAZE_COLOR[0] * haze * HAZE_STRENGTH;
        g = g * shade + HAZE_COLOR[1] * haze * HAZE_STRENGTH;
        b = b * shade + HAZE_COLOR[2] * haze * HAZE_STRENGTH;

        colors[idx * 3] = Math.max(0, Math.min(255, Math.round(r)));
        colors[idx * 3 + 1] = Math.max(0, Math.min(255, Math.round(g)));
        colors[idx * 3 + 2] = Math.max(0, Math.min(255, Math.round(b)));
      }
    }
  }

  const imageData = new ImageData(diameter, diameter);
  rebuildImageData(data, imageData, diameter, diameter, color, colors);
  const bitmap = document.createElement("canvas");
  bitmap.width = diameter;
  bitmap.height = diameter;
  bitmap.getContext("2d")!.putImageData(imageData, 0, 0);

  return {
    x: cx - radius,
    y: cy - radius,
    width: diameter,
    height: diameter,
    data,
    imageData,
    bitmap,
    colors,
  };
}
