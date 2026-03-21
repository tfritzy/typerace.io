import type { SceneObject } from "./types";
import { rebuildImageData } from "./bitmap";
import { CITY_MARGIN, CITY_COLOR } from "./constants";
import { stampCities } from "./city";

export function createPlanet(
  cx: number,
  cy: number,
  radius: number,
  color: [number, number, number],
  cityAngles: number[]
): { planet: SceneObject; initialCityPixels: number } {
  const margin = CITY_MARGIN;
  const size = (radius + margin) * 2;
  const center = size / 2;
  const data = new Uint8Array(size * size);
  const r2 = radius * radius;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      if (dx * dx + dy * dy <= r2) {
        data[y * size + x] = 1;
      }
    }
  }

  const initialCityPixels = stampCities(data, size, radius, cityAngles);

  const imageData = new ImageData(size, size);
  rebuildImageData(data, imageData, size, size, color, CITY_COLOR);
  const bitmap = document.createElement("canvas");
  bitmap.width = size;
  bitmap.height = size;
  bitmap.getContext("2d")!.putImageData(imageData, 0, 0);

  return {
    planet: {
      x: cx - center,
      y: cy - center,
      width: size,
      height: size,
      data,
      imageData,
      bitmap,
    },
    initialCityPixels,
  };
}
