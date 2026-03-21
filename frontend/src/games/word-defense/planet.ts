import type { SceneObject } from "./types";
import { rebuildImageData } from "./bitmap";

export function createPlanet(
  cx: number,
  cy: number,
  radius: number,
  color: [number, number, number]
): SceneObject {
  const diameter = radius * 2;
  const data = new Uint8Array(diameter * diameter);
  const r2 = radius * radius;

  for (let y = 0; y < diameter; y++) {
    for (let x = 0; x < diameter; x++) {
      const dx = x - radius;
      const dy = y - radius;
      if (dx * dx + dy * dy <= r2) {
        data[y * diameter + x] = 255;
      }
    }
  }

  const imageData = new ImageData(diameter, diameter);
  rebuildImageData(data, imageData, diameter, diameter, color);
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
  };
}
