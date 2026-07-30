export interface Point {
  x: number;
  y: number;
}

const FOLLOW_RATE_PER_SECOND = 30;
const SNAP_DISTANCE_PX = 0.1;

export const followPoint = (
  current: Point,
  target: Point,
  elapsedMs: number,
): void => {
  const blend = 1 - Math.exp((-FOLLOW_RATE_PER_SECOND * elapsedMs) / 1000);
  const x = current.x + (target.x - current.x) * blend;
  const y = current.y + (target.y - current.y) * blend;

  current.x = Math.abs(target.x - x) < SNAP_DISTANCE_PX ? target.x : x;
  current.y = Math.abs(target.y - y) < SNAP_DISTANCE_PX ? target.y : y;
};
