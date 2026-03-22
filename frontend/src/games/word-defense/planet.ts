import type { SceneObject } from "./types";
import { rebuildImageData } from "./bitmap";
import { CARD_INDEX, ACCENT_INDEX } from "./palette";
import { valueNoise } from "./noise";

export function createPlanet(
  cx: number,
  cy: number,
  radius: number,
): { planet: SceneObject; habitablePixels: number } {
  const margin = 4;
  const size = (radius + margin) * 2;
  const center = size / 2;
  const data = new Uint8Array(size * size);
  const r2 = radius * radius;
  let habitablePixels = 0;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist2 = dx * dx + dy * dy;
      if (dist2 <= r2) {
        const dist = Math.sqrt(dist2);
        const angle = Math.atan2(dy, dx);
        const n1 = valueNoise(angle * 3.0 + 100, 42.0);
        const n2 = valueNoise(angle * 7.0 + 200, 73.0) * 0.5;
        const n3 = valueNoise(angle * 18.0 + 300, 17.0) * 0.35;
        const n4 = valueNoise(angle * 40.0 + 500, 91.0) * 0.15;
        const depth = 1 + (n1 + n2 + n3 + n4) / 2.0 * 3;
        if (dist > radius - depth) {
          data[y * size + x] = ACCENT_INDEX;
          habitablePixels++;
        } else {
          data[y * size + x] = CARD_INDEX;
        }
      }
    }
  }

  const imageData = new ImageData(size, size);
  rebuildImageData(data, imageData, size, size);
  const bitmap = document.createElement("canvas");
  bitmap.width = size;
  bitmap.height = size;
  bitmap.getContext("2d")!.putImageData(imageData, 0, 0);

  const planet: SceneObject = {
    x: cx - center,
    y: cy - center,
    width: size,
    height: size,
    data,
    imageData,
    bitmap,
  };

  return { planet, habitablePixels };
}
