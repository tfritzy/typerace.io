import type { Missile, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  GRAVITY_STRENGTH,
  MISSILE_INITIAL_SPEED, MISSILE_MAX_SPEED, MISSILE_ACCEL_DURATION,
  MISSILE_FUSE_BUFFER,
  CANVAS_WIDTH, CANVAS_HEIGHT, METEOR_CLEANUP_MARGIN,
} from "./constants";

interface SimState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

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

function simulateMeteorPosition(
  x: number, y: number, vx: number, vy: number, totalTime: number
): { x: number; y: number } {
  const steps = Math.max(Math.ceil(totalTime * 60), 1);
  const stepDt = totalTime / steps;
  const sim: SimState = { x, y, vx, vy };
  for (let s = 0; s < steps; s++) {
    applyGravityStep(sim, stepDt);
  }
  return { x: sim.x, y: sim.y };
}

function getMissileSpeedAtTime(age: number): number {
  if (age >= MISSILE_ACCEL_DURATION) return MISSILE_MAX_SPEED;
  const t = age / MISSILE_ACCEL_DURATION;
  const eased = t * t;
  return MISSILE_INITIAL_SPEED + (MISSILE_MAX_SPEED - MISSILE_INITIAL_SPEED) * eased;
}

function estimateMissileFlightTime(turretX: number, turretY: number, targetX: number, targetY: number): number {
  const dx = targetX - turretX;
  const dy = targetY - turretY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const avgSpeed = (MISSILE_INITIAL_SPEED + MISSILE_MAX_SPEED) / 2;
  return dist / avgSpeed;
}

function simulateMissilePosition(
  startX: number, startY: number, angle: number, totalTime: number
): { x: number; y: number } {
  const steps = Math.max(Math.ceil(totalTime * 60), 1);
  const stepDt = totalTime / steps;
  let x = startX;
  let y = startY;
  let age = 0;

  for (let s = 0; s < steps; s++) {
    const speed = getMissileSpeedAtTime(age);
    x += Math.cos(angle) * speed * stepDt;
    y += Math.sin(angle) * speed * stepDt;
    age += stepDt;
  }

  return { x, y };
}

export function fireMissile(turret: TurretSlot, target: Meteor): Missile | null {
  const targetCx = target.x + target.width / 2;
  const targetCy = target.y + target.height / 2;

  let flightTime = estimateMissileFlightTime(turret.x, turret.y, targetCx, targetCy);

  for (let iter = 0; iter < 6; iter++) {
    const pred = simulateMeteorPosition(targetCx, targetCy, target.vx, target.vy, flightTime);

    let bestAngle = Math.atan2(pred.y - turret.y, pred.x - turret.x);

    for (let a = 0; a < 3; a++) {
      const missileEnd = simulateMissilePosition(turret.x, turret.y, bestAngle, flightTime);
      const errX = pred.x - missileEnd.x;
      const errY = pred.y - missileEnd.y;
      bestAngle = Math.atan2(pred.y - turret.y + errY, pred.x - turret.x + errX);
    }

    const missileEnd = simulateMissilePosition(turret.x, turret.y, bestAngle, flightTime);
    const dx = pred.x - missileEnd.x;
    const dy = pred.y - missileEnd.y;
    const endDist = Math.sqrt(dx * dx + dy * dy);

    if (endDist < 5) break;

    const newDx = pred.x - turret.x;
    const newDy = pred.y - turret.y;
    const newDist = Math.sqrt(newDx * newDx + newDy * newDy);
    const avgSpeed = (MISSILE_INITIAL_SPEED + MISSILE_MAX_SPEED) / 2;
    flightTime = newDist / avgSpeed;
  }

  const meteorPred = simulateMeteorPosition(targetCx, targetCy, target.vx, target.vy, flightTime);
  let launchAngle = Math.atan2(meteorPred.y - turret.y, meteorPred.x - turret.x);

  for (let iter = 0; iter < 4; iter++) {
    const missileEnd = simulateMissilePosition(turret.x, turret.y, launchAngle, flightTime);
    const errX = meteorPred.x - missileEnd.x;
    const errY = meteorPred.y - missileEnd.y;
    launchAngle = Math.atan2(
      meteorPred.y - turret.y + errY,
      meteorPred.x - turret.x + errX
    );
  }

  const fuseTime = flightTime + MISSILE_FUSE_BUFFER;
  const initialSpeed = MISSILE_INITIAL_SPEED;

  const outX = turret.x - EARTH_CX;
  const outY = turret.y - EARTH_CY;
  if (Math.cos(launchAngle) * outX + Math.sin(launchAngle) * outY <= 0) return null;

  return {
    x: turret.x,
    y: turret.y,
    vx: Math.cos(launchAngle) * initialSpeed,
    vy: Math.sin(launchAngle) * initialSpeed,
    target,
    age: 0,
    fuseTime,
    launchAngle,
    speed: initialSpeed,
  };
}

export function updateMissile(missile: Missile, dt: number): boolean {
  missile.age += dt;

  if (missile.age >= missile.fuseTime) {
    return true;
  }

  missile.speed = getMissileSpeedAtTime(missile.age);
  missile.vx = Math.cos(missile.launchAngle) * missile.speed;
  missile.vy = Math.sin(missile.launchAngle) * missile.speed;

  missile.x += missile.vx * dt;
  missile.y += missile.vy * dt;

  if (
    missile.x < -METEOR_CLEANUP_MARGIN || missile.x > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
    missile.y < -METEOR_CLEANUP_MARGIN || missile.y > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
  ) {
    return true;
  }

  return false;
}
