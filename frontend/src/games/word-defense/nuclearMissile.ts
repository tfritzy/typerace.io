import type { Projectile, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY,
  NUCLEAR_MISSILE_INITIAL_SPEED, NUCLEAR_MISSILE_ACCELERATION,
  NUCLEAR_MISSILE_FUSE_BUFFER, NUCLEAR_MISSILE_DAMAGE,
  NUCLEAR_MISSILE_EXPLOSION_RADIUS,
  CANVAS_WIDTH, CANVAS_HEIGHT, METEOR_CLEANUP_MARGIN,
} from "./constants";

const ACCEL_DURATION = 12.0;
const EPSILON = 1e-6;

function getNukeSpeedAtTime(age: number): number {
  const accelTime = Math.min(Math.max(age, 0), ACCEL_DURATION);
  return NUCLEAR_MISSILE_INITIAL_SPEED + NUCLEAR_MISSILE_ACCELERATION * accelTime;
}

function estimateFlightTimeForDistance(dist: number): number {
  const safeDist = Math.max(dist, 0);
  if (NUCLEAR_MISSILE_ACCELERATION <= 0) {
    return safeDist / Math.max(NUCLEAR_MISSILE_INITIAL_SPEED, EPSILON);
  }
  const accelTime = Math.max(ACCEL_DURATION, 0);
  const speedAfterAccel = NUCLEAR_MISSILE_INITIAL_SPEED + NUCLEAR_MISSILE_ACCELERATION * accelTime;
  const accelDist = NUCLEAR_MISSILE_INITIAL_SPEED * accelTime + 0.5 * NUCLEAR_MISSILE_ACCELERATION * accelTime * accelTime;
  if (safeDist <= accelDist) {
    const disc = Math.max(NUCLEAR_MISSILE_INITIAL_SPEED * NUCLEAR_MISSILE_INITIAL_SPEED + 2 * NUCLEAR_MISSILE_ACCELERATION * safeDist, 0);
    return (-NUCLEAR_MISSILE_INITIAL_SPEED + Math.sqrt(disc)) / NUCLEAR_MISSILE_ACCELERATION;
  }
  const cruiseDist = safeDist - accelDist;
  return accelTime + cruiseDist / Math.max(speedAfterAccel, EPSILON);
}

function simulatePosition(startX: number, startY: number, angle: number, totalTime: number): { x: number; y: number } {
  const steps = Math.max(Math.ceil(totalTime * 60), 1);
  const stepDt = totalTime / steps;
  let x = startX;
  let y = startY;
  let age = 0;
  for (let s = 0; s < steps; s++) {
    const speed = getNukeSpeedAtTime(age);
    x += Math.cos(angle) * speed * stepDt;
    y += Math.sin(angle) * speed * stepDt;
    age += stepDt;
  }
  return { x, y };
}

export function fireNuclearMissile(turret: TurretSlot, target: Meteor): Projectile | null {
  const targetCx = target.x;
  const targetCy = target.y;

  const dx0 = targetCx - turret.x;
  const dy0 = targetCy - turret.y;
  const dist0 = Math.sqrt(dx0 * dx0 + dy0 * dy0);
  let flightTime = estimateFlightTimeForDistance(dist0);

  for (let iter = 0; iter < 6; iter++) {
    const predX = targetCx + target.vx * flightTime;
    const predY = targetCy + target.vy * flightTime;
    let bestAngle = Math.atan2(predY - turret.y, predX - turret.x);
    for (let a = 0; a < 3; a++) {
      const end = simulatePosition(turret.x, turret.y, bestAngle, flightTime);
      const errX = predX - end.x;
      const errY = predY - end.y;
      bestAngle = Math.atan2(predY - turret.y + errY, predX - turret.x + errX);
    }
    const end = simulatePosition(turret.x, turret.y, bestAngle, flightTime);
    const edx = predX - end.x;
    const edy = predY - end.y;
    if (Math.sqrt(edx * edx + edy * edy) < 5) break;
    const newDx = predX - turret.x;
    const newDy = predY - turret.y;
    flightTime = estimateFlightTimeForDistance(Math.sqrt(newDx * newDx + newDy * newDy));
  }

  const meteorPredX = targetCx + target.vx * flightTime;
  const meteorPredY = targetCy + target.vy * flightTime;
  let launchAngle = Math.atan2(meteorPredY - turret.y, meteorPredX - turret.x);

  for (let iter = 0; iter < 4; iter++) {
    const end = simulatePosition(turret.x, turret.y, launchAngle, flightTime);
    const errX = meteorPredX - end.x;
    const errY = meteorPredY - end.y;
    launchAngle = Math.atan2(meteorPredY - turret.y + errY, meteorPredX - turret.x + errX);
  }

  const fuseTime = flightTime + NUCLEAR_MISSILE_FUSE_BUFFER;

  const outX = turret.x - EARTH_CX;
  const outY = turret.y - EARTH_CY;
  if (Math.cos(launchAngle) * outX + Math.sin(launchAngle) * outY <= 0) return null;

  return {
    x: turret.x,
    y: turret.y,
    vx: Math.cos(launchAngle) * NUCLEAR_MISSILE_INITIAL_SPEED,
    vy: Math.sin(launchAngle) * NUCLEAR_MISSILE_INITIAL_SPEED,
    damage: NUCLEAR_MISSILE_DAMAGE,
    target,
    explosionRadius: NUCLEAR_MISSILE_EXPLOSION_RADIUS,
    age: 0,
    fuseTime,
    launchAngle,
    speed: NUCLEAR_MISSILE_INITIAL_SPEED,
  };
}

export function updateNuclearMissile(proj: Projectile, dt: number): boolean {
  proj.age += dt;
  if (proj.age >= proj.fuseTime) return true;
  proj.speed = getNukeSpeedAtTime(proj.age);
  proj.vx = Math.cos(proj.launchAngle) * proj.speed;
  proj.vy = Math.sin(proj.launchAngle) * proj.speed;
  proj.x += proj.vx * dt;
  proj.y += proj.vy * dt;
  if (
    proj.x < -METEOR_CLEANUP_MARGIN || proj.x > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
    proj.y < -METEOR_CLEANUP_MARGIN || proj.y > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
  ) {
    return true;
  }
  return false;
}
