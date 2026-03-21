import type { SceneObject } from "./types";
import type { Palette } from "./types";
import { rebuildImageData } from "./bitmap";
import {
  PLANET_COLOR, CRATER_FLOOR_COLOR, CRATER_WALL_COLOR,
  CRATER_RIM_COLOR, CRATER_EJECTA_COLOR,
} from "./constants";

export const PLANET_SURFACE = 1;
export const PLANET_CRATER_FLOOR = 2;
export const PLANET_CRATER_WALL = 3;
export const PLANET_CRATER_RIM = 4;
export const PLANET_CRATER_EJECTA = 5;

export function buildPlanetPalette(): Palette {
  const palette: Palette = new Array(256).fill(null).map(() => [0, 0, 0] as [number, number, number]);
  palette[PLANET_SURFACE] = PLANET_COLOR;
  palette[PLANET_CRATER_FLOOR] = CRATER_FLOOR_COLOR;
  palette[PLANET_CRATER_WALL] = CRATER_WALL_COLOR;
  palette[PLANET_CRATER_RIM] = CRATER_RIM_COLOR;
  palette[PLANET_CRATER_EJECTA] = CRATER_EJECTA_COLOR;
  return palette;
}

export function createPlanet(
  cx: number,
  cy: number,
  radius: number
): SceneObject {
  const diameter = radius * 2;
  const data = new Uint8Array(diameter * diameter);
  const palette = buildPlanetPalette();
  const r2 = radius * radius;

  for (let y = 0; y < diameter; y++) {
    for (let x = 0; x < diameter; x++) {
      const dx = x - radius;
      const dy = y - radius;
      if (dx * dx + dy * dy <= r2) {
        data[y * diameter + x] = PLANET_SURFACE;
      }
    }
  }

  const imageData = new ImageData(diameter, diameter);
  rebuildImageData(data, imageData, diameter, diameter, palette);
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
    palette,
    imageData,
    bitmap,
  };
}
