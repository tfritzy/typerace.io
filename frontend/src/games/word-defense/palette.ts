import type { Palette } from "./types";

export const PLANET_INDEX = 1;
export const CITY_INDEX = 2;
export const METEOR_INDEX = 3;

let globalPalette: Palette = [
  [0, 0, 0],
  [160, 160, 160],
  [100, 149, 237],
  [107, 90, 62],
];

function parseCssColor(raw: string): [number, number, number] | null {
  raw = raw.trim();
  if (raw.startsWith("#")) {
    let hex = raw.slice(1);
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    if (hex.length !== 6) return null;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return [r, g, b];
  }
  const rgbaMatch = raw.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbaMatch) {
    return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
  }
  return null;
}

export function buildPalette(): void {
  const style = getComputedStyle(document.documentElement);
  const planet = parseCssColor(style.getPropertyValue("--muted-foreground"));
  const city = parseCssColor(style.getPropertyValue("--accent-primary"));
  const meteor = parseCssColor(style.getPropertyValue("--accent-dark"));

  if (planet) globalPalette[PLANET_INDEX] = planet;
  if (city) globalPalette[CITY_INDEX] = city;
  if (meteor) globalPalette[METEOR_INDEX] = meteor;
}

export function getPalette(): Palette {
  return globalPalette;
}
