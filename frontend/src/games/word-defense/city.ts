import type { SceneObject } from "./types";
import {
  CITY_HALF_WIDTH,
  CITY_MAX_HEIGHT,
  CITY_EMBED_DEPTH,
} from "./constants";
import { valueNoise } from "./noise";
import { ACCENT_INDEX } from "./palette";
import { rebuildImageData } from "./bitmap";

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

function createCityObject(
  planetCx: number,
  planetCy: number,
  planetRadius: number,
  angle: number,
): SceneObject {
  const outX = Math.cos(angle);
  const outY = Math.sin(angle);
  const tanX = -Math.sin(angle);
  const tanY = Math.cos(angle);

  const seed = Math.floor(angle * 1000) + 42;

  const maxOutward = CITY_MAX_HEIGHT + 5;
  const extent = maxOutward + CITY_HALF_WIDTH + CITY_EMBED_DEPTH;
  const bboxSize = Math.ceil(extent * 2) + 2;

  const surfaceCx = planetCx + outX * planetRadius;
  const surfaceCy = planetCy + outY * planetRadius;

  const objX = surfaceCx - bboxSize / 2;
  const objY = surfaceCy - bboxSize / 2;

  const data = new Uint8Array(bboxSize * bboxSize);
  let pixelCount = 0;

  for (let py = 0; py < bboxSize; py++) {
    for (let px = 0; px < bboxSize; px++) {
      const worldX = objX + px;
      const worldY = objY + py;
      const dx = worldX - planetCx;
      const dy = worldY - planetCy;
      const radial = dx * outX + dy * outY;
      const tangent = dx * tanX + dy * tanY;

      const h = cityHeight(tangent, seed);
      if (h <= 0) continue;

      const r = radial - planetRadius;
      const surfaceR =
        Math.sqrt(Math.max(0, planetRadius * planetRadius - tangent * tangent)) - planetRadius;

      if (r >= surfaceR - CITY_EMBED_DEPTH && r < surfaceR + h) {
        data[py * bboxSize + px] = ACCENT_INDEX;
        pixelCount++;
      }
    }
  }

  const imageData = new ImageData(bboxSize, bboxSize);
  rebuildImageData(data, imageData, bboxSize, bboxSize);
  const bitmap = document.createElement("canvas");
  bitmap.width = bboxSize;
  bitmap.height = bboxSize;
  bitmap.getContext("2d")!.putImageData(imageData, 0, 0);

  return {
    x: objX,
    y: objY,
    width: bboxSize,
    height: bboxSize,
    data,
    imageData,
    bitmap,
  };
}

export function createCityObjects(
  planetCx: number,
  planetCy: number,
  planetRadius: number,
  cityAngles: number[],
): SceneObject[] {
  return cityAngles.map(angle =>
    createCityObject(planetCx, planetCy, planetRadius, angle)
  );
}

export function countCityPixels(city: SceneObject): number {
  let count = 0;
  for (let i = 0; i < city.data.length; i++) {
    if (city.data[i] === ACCENT_INDEX) count++;
  }
  return count;
}
