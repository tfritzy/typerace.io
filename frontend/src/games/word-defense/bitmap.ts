import type { SceneObject } from "./types";
import {
  CRATER_CARVE_RATIO, CRATER_FLOOR_RATIO, CRATER_RIM_RATIO,
  CRATER_EJECTA_RATIO, CRATER_FLOOR_DARKEN, CRATER_RIM_BRIGHTEN,
  CRATER_EJECTA_DARKEN,
} from "./constants";
import { valueNoise } from "./noise";

export function rebuildImageData(
  data: Uint8Array,
  imageData: ImageData,
  width: number,
  height: number,
  color: [number, number, number]
) {
  const pixels = imageData.data;
  for (let i = 0; i < width * height; i++) {
    if (data[i]) {
      pixels[i * 4] = color[0];
      pixels[i * 4 + 1] = color[1];
      pixels[i * 4 + 2] = color[2];
      pixels[i * 4 + 3] = 255;
    } else {
      pixels[i * 4] = 0;
      pixels[i * 4 + 1] = 0;
      pixels[i * 4 + 2] = 0;
      pixels[i * 4 + 3] = 0;
    }
  }
}

export function rebuildImageDataFromColors(
  data: Uint8Array,
  colors: Uint8Array,
  imageData: ImageData,
  width: number,
  height: number
) {
  const pixels = imageData.data;
  for (let i = 0; i < width * height; i++) {
    if (data[i]) {
      pixels[i * 4] = colors[i * 3];
      pixels[i * 4 + 1] = colors[i * 3 + 1];
      pixels[i * 4 + 2] = colors[i * 3 + 2];
      pixels[i * 4 + 3] = 255;
    } else {
      pixels[i * 4] = 0;
      pixels[i * 4 + 1] = 0;
      pixels[i * 4 + 2] = 0;
      pixels[i * 4 + 3] = 0;
    }
  }
}

export function updateBitmap(obj: SceneObject) {
  obj.bitmap.width = obj.width;
  obj.bitmap.height = obj.height;
  const bctx = obj.bitmap.getContext("2d")!;
  bctx.putImageData(obj.imageData, 0, 0);
}

export function carveCircle(
  obj: SceneObject,
  hitX: number,
  hitY: number,
  radius: number
): boolean {
  const localX = hitX - obj.x;
  const localY = hitY - obj.y;
  const r2 = radius * radius;
  let changed = false;

  const minX = Math.max(0, Math.floor(localX - radius));
  const maxX = Math.min(obj.width - 1, Math.ceil(localX + radius));
  const minY = Math.max(0, Math.floor(localY - radius));
  const maxY = Math.min(obj.height - 1, Math.ceil(localY + radius));

  if (minX >= obj.width || maxX < 0 || minY >= obj.height || maxY < 0) {
    return false;
  }

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - localX;
      const dy = y - localY;
      if (dx * dx + dy * dy <= r2 && obj.data[y * obj.width + x]) {
        obj.data[y * obj.width + x] = 0;
        changed = true;
      }
    }
  }

  return changed;
}

export function destroyCircle(
  obj: SceneObject,
  hitX: number,
  hitY: number,
  radius: number,
  color: [number, number, number]
): boolean {
  const changed = carveCircle(obj, hitX, hitY, radius);
  if (changed) {
    rebuildImageData(obj.data, obj.imageData, obj.width, obj.height, color);
    updateBitmap(obj);
  }
  return changed;
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

export function carveCrater(
  obj: SceneObject,
  hitX: number,
  hitY: number,
  radius: number
): boolean {
  const colors = obj.colors;
  if (!colors) return false;

  const localX = hitX - obj.x;
  const localY = hitY - obj.y;
  let changed = false;

  const outerRadius = radius * CRATER_EJECTA_RATIO;
  const minX = Math.max(0, Math.floor(localX - outerRadius));
  const maxX = Math.min(obj.width - 1, Math.ceil(localX + outerRadius));
  const minY = Math.max(0, Math.floor(localY - outerRadius));
  const maxY = Math.min(obj.height - 1, Math.ceil(localY + outerRadius));

  if (minX >= obj.width || maxX < 0 || minY >= obj.height || maxY < 0) {
    return false;
  }

  const carveR = radius * CRATER_CARVE_RATIO;
  const floorR = radius * CRATER_FLOOR_RATIO;
  const rimR = radius * CRATER_RIM_RATIO;
  const ejectaR = radius * CRATER_EJECTA_RATIO;
  const noiseSeed = localX * 7.3 + localY * 13.7;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - localX;
      const dy = y - localY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const i = y * obj.width + x;

      if (!obj.data[i]) continue;

      const rimNoise = valueNoise(x * 0.3 + noiseSeed, y * 0.3) * 0.2;

      if (dist <= carveR * (1 + rimNoise * 0.5)) {
        obj.data[i] = 0;
        changed = true;
      } else if (dist <= floorR) {
        const t = (dist - carveR) / (floorR - carveR);
        const floorNoise = valueNoise(x * 0.15 + noiseSeed, y * 0.15 + 50) * 0.15;
        const darken = CRATER_FLOOR_DARKEN + t * 0.15 + floorNoise;
        colors[i * 3] = clampByte(colors[i * 3] * darken);
        colors[i * 3 + 1] = clampByte(colors[i * 3 + 1] * darken);
        colors[i * 3 + 2] = clampByte(colors[i * 3 + 2] * darken);
        changed = true;
      } else if (dist <= rimR) {
        const t = (dist - floorR) / (rimR - floorR);
        const rimDetailNoise = valueNoise(x * 0.2 + noiseSeed + 200, y * 0.2) * 0.1;
        const factor = CRATER_FLOOR_DARKEN + 0.15 + t * (CRATER_RIM_BRIGHTEN - CRATER_FLOOR_DARKEN - 0.15) + rimDetailNoise;
        colors[i * 3] = clampByte(colors[i * 3] * factor);
        colors[i * 3 + 1] = clampByte(colors[i * 3 + 1] * factor);
        colors[i * 3 + 2] = clampByte(colors[i * 3 + 2] * factor);
        changed = true;
      } else if (dist <= ejectaR) {
        const t = (dist - rimR) / (ejectaR - rimR);
        const ejectaNoise = valueNoise(x * 0.25 + noiseSeed + 400, y * 0.25 + 100) * 0.1;
        const factor = CRATER_RIM_BRIGHTEN + t * (CRATER_EJECTA_DARKEN - CRATER_RIM_BRIGHTEN) + ejectaNoise;
        const blendFactor = 1 + (factor - 1) * (1 - t);
        colors[i * 3] = clampByte(colors[i * 3] * blendFactor);
        colors[i * 3 + 1] = clampByte(colors[i * 3 + 1] * blendFactor);
        colors[i * 3 + 2] = clampByte(colors[i * 3 + 2] * blendFactor);
        changed = true;
      }
    }
  }

  if (changed) {
    rebuildImageDataFromColors(obj.data, colors, obj.imageData, obj.width, obj.height);
    updateBitmap(obj);
  }

  return changed;
}
