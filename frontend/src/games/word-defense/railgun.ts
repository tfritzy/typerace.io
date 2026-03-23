import type { RailgunProjectile, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY,
  RAILGUN_SPEED,
} from "./constants";

export function fireRailgun(turret: TurretSlot, target: Meteor): RailgunProjectile | null {
  const targetCx = target.x;
  const targetCy = target.y;

  const dx = targetCx - turret.x;
  const dy = targetCy - turret.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  let t = dist / RAILGUN_SPEED;

  for (let iter = 0; iter < 4; iter++) {
    const predX = targetCx + target.vx * t;
    const predY = targetCy + target.vy * t;
    const pdx = predX - turret.x;
    const pdy = predY - turret.y;
    t = Math.sqrt(pdx * pdx + pdy * pdy) / RAILGUN_SPEED;
  }

  const meteorPredX = targetCx + target.vx * t;
  const meteorPredY = targetCy + target.vy * t;

  const finalDx = meteorPredX - turret.x;
  const finalDy = meteorPredY - turret.y;
  const finalDist = Math.sqrt(finalDx * finalDx + finalDy * finalDy);

  const vx = (finalDx / finalDist) * RAILGUN_SPEED;
  const vy = (finalDy / finalDist) * RAILGUN_SPEED;

  const outX = turret.x - EARTH_CX;
  const outY = turret.y - EARTH_CY;
  if (vx * outX + vy * outY <= 0) return null;

  return {
    x: turret.x,
    y: turret.y,
    vx,
    vy,
    target,
  };
}
