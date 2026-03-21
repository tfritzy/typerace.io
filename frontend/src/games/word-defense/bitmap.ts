import type { SceneObject } from "./types";

export function rebuildImageData(
  data: Uint8Array,
  imageData: ImageData,
  width: number,
  height: number,
  color: [number, number, number],
  rimColor?: [number, number, number]
) {
  const pixels = imageData.data;
  const rc = rimColor ?? color;
  for (let i = 0; i < width * height; i++) {
    const v = data[i];
    if (v === 1) {
      pixels[i * 4] = color[0];
      pixels[i * 4 + 1] = color[1];
      pixels[i * 4 + 2] = color[2];
      pixels[i * 4 + 3] = 255;
    } else if (v === 2) {
      pixels[i * 4] = rc[0];
      pixels[i * 4 + 1] = rc[1];
      pixels[i * 4 + 2] = rc[2];
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

export function carveCrater(
  obj: SceneObject,
  hitX: number,
  hitY: number,
  radius: number,
  seed: number
): boolean {
  const localX = hitX - obj.x;
  const localY = hitY - obj.y;
  const rimWidth = Math.max(3, radius * 0.22);
  const maxCraterR = radius * 1.32 + rimWidth;

  const minX = Math.max(0, Math.floor(localX - maxCraterR));
  const maxX = Math.min(obj.width - 1, Math.ceil(localX + maxCraterR));
  const minY = Math.max(0, Math.floor(localY - maxCraterR));
  const maxY = Math.min(obj.height - 1, Math.ceil(localY + maxCraterR));

  if (minX >= obj.width || maxX < 0 || minY >= obj.height || maxY < 0) {
    return false;
  }

  let changed = false;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - localX;
      const dy = y - localY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      const noise =
        Math.sin(angle * 5.3 + seed * 6.28) * 0.40 +
        Math.sin(angle * 7.1 + seed * 14.0) * 0.30 +
        Math.sin(angle * 11.7 + seed * 10.0) * 0.20 +
        Math.sin(angle * 3.2 + seed * 19.0) * 0.10;
      const craterR = radius * (1.0 + noise * 0.25);
      const idx = y * obj.width + x;

      if (dist <= craterR) {
        if (obj.data[idx]) {
          obj.data[idx] = 0;
          changed = true;
        }
      } else if (dist <= craterR + rimWidth && obj.data[idx] === 1) {
        obj.data[idx] = 2;
        changed = true;
      }
    }
  }

  const numRays = 5 + ((seed * 5) | 0);
  const rayLength = radius * 1.8;
  const rayStart = Math.ceil(radius * 1.05);
  const rayEnd = Math.ceil(rayLength);
  const raySpan = Math.max(1, rayEnd - rayStart);

  for (let ri = 0; ri < numRays; ri++) {
    const rayAngle = (ri / numRays) * Math.PI * 2 + seed * Math.PI * 2;
    const cosA = Math.cos(rayAngle);
    const sinA = Math.sin(rayAngle);

    for (let s = rayStart; s <= rayEnd; s++) {
      const halfW = Math.max(0, Math.ceil(2.0 * (1.0 - (s - rayStart) / raySpan)));
      for (let w = -halfW; w <= halfW; w++) {
        const px = Math.round(localX + cosA * s - sinA * w);
        const py = Math.round(localY + sinA * s + cosA * w);
        if (px >= 0 && px < obj.width && py >= 0 && py < obj.height) {
          const idx = py * obj.width + px;
          if (obj.data[idx] === 1) {
            obj.data[idx] = 2;
            changed = true;
          }
        }
      }
    }
  }

  return changed;
}

export function destroyCrater(
  obj: SceneObject,
  hitX: number,
  hitY: number,
  radius: number,
  color: [number, number, number],
  rimColor: [number, number, number],
  seed: number
): boolean {
  const changed = carveCrater(obj, hitX, hitY, radius, seed);
  if (changed) {
    rebuildImageData(obj.data, obj.imageData, obj.width, obj.height, color, rimColor);
    updateBitmap(obj);
  }
  return changed;
}
