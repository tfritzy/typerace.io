import type { LaserBeam, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  LASER_BEAM_DURATION,
} from "./constants";

export function hasLineOfSight(
  startX: number, startY: number,
  endX: number, endY: number
): boolean {
  const dx = endX - startX;
  const dy = endY - startY;
  const fx = startX - EARTH_CX;
  const fy = startY - EARTH_CY;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - EARTH_RADIUS * EARTH_RADIUS;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return true;

  const sqrtDisc = Math.sqrt(discriminant);
  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  const eps = 0.02;
  if (t1 > eps && t1 < 1) return false;
  if (t2 > eps && t2 < 1) return false;

  return true;
}

export function fireLaser(turret: TurretSlot, target: Meteor): LaserBeam | null {
  if (!hasLineOfSight(turret.x, turret.y, target.x, target.y)) return null;

  return {
    startX: turret.x,
    startY: turret.y,
    endX: target.x,
    endY: target.y,
    age: 0,
    duration: LASER_BEAM_DURATION,
  };
}
