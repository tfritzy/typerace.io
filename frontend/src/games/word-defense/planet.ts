import type { SceneObject } from "./types";
import { rebuildImageData } from "./bitmap";
import { CITY_MARGIN } from "./constants";
import { PLANET_INDEX } from "./palette";
import { createCityObjects } from "./city";

export function createPlanet(
  cx: number,
  cy: number,
  radius: number,
  cityCount: number,
): { planet: SceneObject; cities: SceneObject[] } {
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
        data[y * size + x] = PLANET_INDEX;
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

  const cityAngles = Array.from({ length: cityCount }, (_, i) =>
    (i / cityCount) * Math.PI * 2 - Math.PI / 2,
  );

  const cities = createCityObjects(cx, cy, radius, cityAngles);

  return { planet, cities };
}
