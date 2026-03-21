import type { SceneObject } from "./types";
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
  const localX = hitX - obj.x;
  const localY = hitY - obj.y;
  let changed = false;

  const planetCx = obj.width / 2;
  const planetCy = obj.height / 2;
  const dirX = localX - planetCx;
  const dirY = localY - planetCy;
  const dirLen = Math.sqrt(dirX * dirX + dirY * dirY);
  const ndx = dirLen > 0 ? dirX / dirLen : 0;
  const ndy = dirLen > 0 ? dirY / dirLen : -1;

  const domeRadius = radius * 2.0;
  const domeOffset = radius * 1.5;
  const domeCx = localX + ndx * domeOffset;
  const domeCy = localY + ndy * domeOffset;

  const scanMargin = domeRadius * 1.15;
  const minX = Math.max(0, Math.floor(domeCx - scanMargin));
  const maxX = Math.min(obj.width - 1, Math.ceil(domeCx + scanMargin));
  const minY = Math.max(0, Math.floor(domeCy - scanMargin));
  const maxY = Math.min(obj.height - 1, Math.ceil(domeCy + scanMargin));

  if (minX >= obj.width || maxX < 0 || minY >= obj.height || maxY < 0) {
    return false;
  }

  const noiseSeed = localX * 7.3 + localY * 13.7;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const i = y * obj.width + x;
      if (!obj.data[i]) continue;

      const dx = x - domeCx;
      const dy = y - domeCy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const edgeNoise = (valueNoise(x * 0.3 + noiseSeed, y * 0.3) - 0.5) * 0.2;
      const effectiveRadius = domeRadius * (1 + edgeNoise);

      if (dist <= effectiveRadius) {
        obj.data[i] = 0;
        changed = true;
      }
    }
  }

  if (changed) {
    rebuildImageData(obj.data, obj.imageData, obj.width, obj.height, color);
    updateBitmap(obj);
  }
  return changed;
}
