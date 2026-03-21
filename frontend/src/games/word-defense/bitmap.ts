import type { SceneObject } from "./types";

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
  const changed = carveCircle(obj, hitX, hitY, radius);
  if (changed) {
    rebuildImageData(obj.data, obj.imageData, obj.width, obj.height, color);
    updateBitmap(obj);
  }
  return changed;
}
