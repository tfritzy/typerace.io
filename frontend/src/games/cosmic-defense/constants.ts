export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

export const SHIP_TURN_SPEED = 8;

export const PIXEL_FONT_FAMILY = "Press Start 2P";

export function formatGold(value: number): string {
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${+(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}
