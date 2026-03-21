import type { Bullet, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  BULLET_SPEED, GRAVITY_STRENGTH,
} from "./constants";

interface SimState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const _sim: SimState = { x: 0, y: 0, vx: 0, vy: 0 };
const _result: { x: number; y: number } = { x: 0, y: 0 };

function applyGravityStep(s: SimState, stepDt: number): void {
  s.x += s.vx * stepDt;
  s.y += s.vy * stepDt;
  const gx = EARTH_CX - s.x;
  const gy = EARTH_CY - s.y;
  const gd = Math.sqrt(gx * gx + gy * gy);
  if (gd > 1) {
    const accel = GRAVITY_STRENGTH / Math.max(gd, EARTH_RADIUS);
    s.vx += (gx / gd) * accel * stepDt;
    s.vy += (gy / gd) * accel * stepDt;
  }
}

function simulatePosition(
  x: number, y: number, vx: number, vy: number, totalTime: number
): { x: number; y: number } {
  const steps = Math.max(Math.ceil(totalTime * 60), 1);
  const stepDt = totalTime / steps;
  _sim.x = x;
  _sim.y = y;
  _sim.vx = vx;
  _sim.vy = vy;
  for (let s = 0; s < steps; s++) {
    applyGravityStep(_sim, stepDt);
  }
  _result.x = _sim.x;
  _result.y = _sim.y;
  return _result;
}

export function fireBullet(turret: TurretSlot, target: Meteor): Bullet {
  const targetCx = target.x + target.width / 2;
  const targetCy = target.y + target.height / 2;

  const dx = targetCx - turret.x;
  const dy = targetCy - turret.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  let t = dist / BULLET_SPEED;

  for (let iter = 0; iter < 4; iter++) {
    const pred = simulatePosition(targetCx, targetCy, target.vx, target.vy, t);
    const pdx = pred.x - turret.x;
    const pdy = pred.y - turret.y;
    t = Math.sqrt(pdx * pdx + pdy * pdy) / BULLET_SPEED;
  }

  const meteorPred = simulatePosition(targetCx, targetCy, target.vx, target.vy, t);
  const meteorPredX = meteorPred.x;
  const meteorPredY = meteorPred.y;

  let aimX = meteorPredX;
  let aimY = meteorPredY;

  for (let iter = 0; iter < 4; iter++) {
    const adx = aimX - turret.x;
    const ady = aimY - turret.y;
    const aDist = Math.sqrt(adx * adx + ady * ady);
    const bvx = (adx / aDist) * BULLET_SPEED;
    const bvy = (ady / aDist) * BULLET_SPEED;

    const bulletEnd = simulatePosition(turret.x, turret.y, bvx, bvy, t);

    aimX += meteorPredX - bulletEnd.x;
    aimY += meteorPredY - bulletEnd.y;
  }

  const finalDx = aimX - turret.x;
  const finalDy = aimY - turret.y;
  const finalDist = Math.sqrt(finalDx * finalDx + finalDy * finalDy);

  return {
    x: turret.x,
    y: turret.y,
    vx: (finalDx / finalDist) * BULLET_SPEED,
    vy: (finalDy / finalDist) * BULLET_SPEED,
    target,
  };
}
