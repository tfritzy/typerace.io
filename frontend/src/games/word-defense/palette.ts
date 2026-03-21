import type { Palette } from "./types";

export const PLANET_INDEX = 1;
export const CITY_INDEX = 2;
export const METEOR_INDEX = 3;

let globalPalette: Palette = [
  [0, 0, 0],
  [100, 180, 100],
  [140, 170, 210],
  [107, 90, 62],
];

function parseHexColor(hex: string): [number, number, number] | null {
  hex = hex.trim().replace("#", "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return [r, g, b];
}

function neutralColorFromAccent(accent: [number, number, number]): [number, number, number] {
  const avg = (accent[0] + accent[1] + accent[2]) / 3;
  const factor = 0.3;
  return [
    Math.round(avg * (1 - factor) + accent[0] * factor),
    Math.round(avg * (1 - factor) + accent[1] * factor),
    Math.round(avg * (1 - factor) + accent[2] * factor),
  ];
}

export function buildPalette(): Palette {
  const style = getComputedStyle(document.documentElement);
  const accentHex = style.getPropertyValue("--accent-primary");
  const accent = parseHexColor(accentHex);

  if (accent) {
    const neutral = neutralColorFromAccent(accent);
    globalPalette = [
      [0, 0, 0],
      neutral,
      accent,
      [107, 90, 62],
    ];
  }

  return globalPalette;
}

export function getPalette(): Palette {
  return globalPalette;
}
