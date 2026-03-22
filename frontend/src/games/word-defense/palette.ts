import type { Palette } from "./types";

export const BACKGROUND_INDEX = 0;
export const FOREGROUND_INDEX = 1;
export const CARD_INDEX = 2;
export const PRIMARY_INDEX = 3;
export const SECONDARY_INDEX = 4;
export const MUTED_INDEX = 5;
export const ACCENT_INDEX = 6;
export const ACCENT_PRIMARY_INDEX = 7;
export const ACCENT_LIGHT_INDEX = 8;
export const ACCENT_DARK_INDEX = 9;
export const DESTRUCTIVE_INDEX = 10;
export const BORDER_INDEX = 11;

let globalPalette: Palette = [
  [30, 30, 46],
  [205, 214, 244],
  [42, 42, 62],
  [203, 166, 247],
  [80, 80, 100],
  [205, 214, 244],
  [203, 166, 247],
  [203, 166, 247],
  [210, 180, 255],
  [152, 124, 245],
  [243, 139, 168],
  [50, 50, 70],
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

  const background = parseCssColor(style.getPropertyValue("--background"));
  const foreground = parseCssColor(style.getPropertyValue("--foreground"));
  const card = parseCssColor(style.getPropertyValue("--card"));
  const primary = parseCssColor(style.getPropertyValue("--primary"));
  const secondary = parseCssColor(style.getPropertyValue("--secondary"));
  const muted = parseCssColor(style.getPropertyValue("--muted-foreground"));
  const accent = parseCssColor(style.getPropertyValue("--accent"));
  const accentPrimary = parseCssColor(style.getPropertyValue("--accent-primary"));
  const accentLight = parseCssColor(style.getPropertyValue("--accent-light"));
  const accentDark = parseCssColor(style.getPropertyValue("--accent-dark"));
  const destructive = parseCssColor(style.getPropertyValue("--destructive"));
  const border = parseCssColor(style.getPropertyValue("--border"));

  if (background) globalPalette[BACKGROUND_INDEX] = background;
  if (foreground) globalPalette[FOREGROUND_INDEX] = foreground;
  if (card) globalPalette[CARD_INDEX] = card;
  if (primary) globalPalette[PRIMARY_INDEX] = primary;
  if (secondary) globalPalette[SECONDARY_INDEX] = secondary;
  if (muted) globalPalette[MUTED_INDEX] = muted;
  if (accent) globalPalette[ACCENT_INDEX] = accent;
  if (accentPrimary) globalPalette[ACCENT_PRIMARY_INDEX] = accentPrimary;
  if (accentLight) globalPalette[ACCENT_LIGHT_INDEX] = accentLight;
  if (accentDark) globalPalette[ACCENT_DARK_INDEX] = accentDark;
  if (destructive) globalPalette[DESTRUCTIVE_INDEX] = destructive;
  if (border) globalPalette[BORDER_INDEX] = border;
}

export function getPalette(): Palette {
  return globalPalette;
}

export function getBackgroundColor(): number {
  const bg = globalPalette[BACKGROUND_INDEX];
  return (bg[0] << 16) | (bg[1] << 8) | bg[2];
}
