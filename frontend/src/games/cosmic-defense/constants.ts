export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

export function formatGold(value: number): string {
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${+(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}
