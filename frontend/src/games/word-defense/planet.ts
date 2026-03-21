import type { SceneObject } from "./types";
import { rebuildImageDataFromColors } from "./bitmap";
import { valueNoise } from "./noise";

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

  for (let y = 0; y < diameter; y++) {
    for (let x = 0; x < diameter; x++) {
      const dx = x - radius;
      const dy = y - radius;
      if (dx * dx + dy * dy <= r2) {
        const i = y * diameter + x;
        data[i] = 1;

        const n1 = valueNoise(x * 0.05, y * 0.05);
        const n2 = valueNoise(x * 0.12 + 100, y * 0.12 + 100);
        const variation = 0.9 + (n1 * 0.08 + n2 * 0.06);
        colors[i * 3] = Math.min(255, Math.round(color[0] * variation));
        colors[i * 3 + 1] = Math.min(255, Math.round(color[1] * variation));
        colors[i * 3 + 2] = Math.min(255, Math.round(color[2] * variation));
      }
    }
  }

  const imageData = new ImageData(diameter, diameter);
  rebuildImageDataFromColors(data, colors, imageData, diameter, diameter);
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
    colors,
    imageData,
    bitmap,
  };
}
