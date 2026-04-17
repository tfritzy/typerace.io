export const CANVAS_WIDTH = 1920;
export const CANVAS_HEIGHT = 1080;

export const SHIP_TURN_SPEED = 8;

export function approachAngle(current: number, target: number, maxStep: number): number {
  const TWO_PI = Math.PI * 2;
  let delta = ((target - current + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  if (delta > maxStep) delta = maxStep;
  else if (delta < -maxStep) delta = -maxStep;
  return current + delta;
}

export function formatGold(value: number): string {
  if (value >= 1_000_000) return `${+(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${+(value / 1_000).toFixed(1)}K`;
  return `${value}`;
}
