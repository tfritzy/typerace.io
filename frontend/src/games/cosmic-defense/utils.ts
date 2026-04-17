export function approachAngle(current: number, target: number, maxStep: number): number {
  const TWO_PI = Math.PI * 2;
  let delta = ((target - current + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI;
  if (delta > maxStep) delta = maxStep;
  else if (delta < -maxStep) delta = -maxStep;
  return current + delta;
}
