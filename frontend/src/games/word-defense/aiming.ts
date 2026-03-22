import type { Bullet, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  BULLET_SPEED, BULLET_MIN_SPEED, GRAVITY_STRENGTH,
  MAX_FIRING_HALF_ANGLE,
} from "./constants";

interface SimState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const _sim: SimState = { x: 0, y: 0, vx: 0, vy: 0 };
const _result: { x: number; y: number } = { x: 0, y: 0 };

const MIN_FIRING_COS = Math.cos(MAX_FIRING_HALF_ANGLE);
const BULLET_SPEED_STEPS = 6;

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

function isWithinFiringCone(vx: number, vy: number, turretX: number, turretY: number): boolean {
  const outX = turretX - EARTH_CX;
  const outY = turretY - EARTH_CY;
  const dot = vx * outX + vy * outY;
  const vMag = Math.sqrt(vx * vx + vy * vy);
  const outMag = Math.sqrt(outX * outX + outY * outY);
  if (vMag < 1e-6 || outMag < 1e-6) return false;
  return dot / (vMag * outMag) >= MIN_FIRING_COS;
}

function tryFireBulletAtSpeed(turret: TurretSlot, target: Meteor, speed: number): Bullet | null {
  const targetCx = target.x + target.width / 2;
  const targetCy = target.y + target.height / 2;

  const dx = targetCx - turret.x;
  const dy = targetCy - turret.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  let t = dist / speed;

  for (let iter = 0; iter < 4; iter++) {
    const pred = simulatePosition(targetCx, targetCy, target.vx, target.vy, t);
    const pdx = pred.x - turret.x;
    const pdy = pred.y - turret.y;
    t = Math.sqrt(pdx * pdx + pdy * pdy) / speed;
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
    const bvx = (adx / aDist) * speed;
    const bvy = (ady / aDist) * speed;

    const bulletEnd = simulatePosition(turret.x, turret.y, bvx, bvy, t);

    aimX += meteorPredX - bulletEnd.x;
    aimY += meteorPredY - bulletEnd.y;
  }

  const finalDx = aimX - turret.x;
  const finalDy = aimY - turret.y;
  const finalDist = Math.sqrt(finalDx * finalDx + finalDy * finalDy);

  const vx = (finalDx / finalDist) * speed;
  const vy = (finalDy / finalDist) * speed;

  if (!isWithinFiringCone(vx, vy, turret.x, turret.y)) return null;

  return {
    x: turret.x,
    y: turret.y,
    vx,
    vy,
    target,
  };
}

export function fireBullet(turret: TurretSlot, target: Meteor): Bullet | null {
  for (let i = 0; i < BULLET_SPEED_STEPS; i++) {
    const speed = BULLET_SPEED - (BULLET_SPEED - BULLET_MIN_SPEED) * (i / (BULLET_SPEED_STEPS - 1));
    const result = tryFireBulletAtSpeed(turret, target, speed);
    if (result) return result;
  }
  return null;
}
