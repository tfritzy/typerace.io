import type { Missile, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY,
  MISSILE_INITIAL_SPEED, MISSILE_MAX_SPEED, MISSILE_ACCEL_DURATION,
  MISSILE_FUSE_BUFFER,
  CANVAS_WIDTH, CANVAS_HEIGHT, METEOR_CLEANUP_MARGIN,
} from "./constants";

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
  const targetCx = target.x;
  const targetCy = target.y;

  let flightTime = estimateMissileFlightTime(turret.x, turret.y, targetCx, targetCy);

  for (let iter = 0; iter < 6; iter++) {
    const predX = targetCx + target.vx * flightTime;
    const predY = targetCy + target.vy * flightTime;

    let bestAngle = Math.atan2(predY - turret.y, predX - turret.x);

    for (let a = 0; a < 3; a++) {
      const missileEnd = simulateMissilePosition(turret.x, turret.y, bestAngle, flightTime);
      const errX = predX - missileEnd.x;
      const errY = predY - missileEnd.y;
      bestAngle = Math.atan2(predY - turret.y + errY, predX - turret.x + errX);
    }

    const missileEnd = simulateMissilePosition(turret.x, turret.y, bestAngle, flightTime);
    const dx = predX - missileEnd.x;
    const dy = predY - missileEnd.y;
    const endDist = Math.sqrt(dx * dx + dy * dy);

    if (endDist < 5) break;

    const newDx = predX - turret.x;
    const newDy = predY - turret.y;
    const newDist = Math.sqrt(newDx * newDx + newDy * newDy);
    const avgSpeed = (MISSILE_INITIAL_SPEED + MISSILE_MAX_SPEED) / 2;
    flightTime = newDist / avgSpeed;
  }

  const meteorPredX = targetCx + target.vx * flightTime;
  const meteorPredY = targetCy + target.vy * flightTime;
  let launchAngle = Math.atan2(meteorPredY - turret.y, meteorPredX - turret.x);

  for (let iter = 0; iter < 4; iter++) {
    const missileEnd = simulateMissilePosition(turret.x, turret.y, launchAngle, flightTime);
    const errX = meteorPredX - missileEnd.x;
    const errY = meteorPredY - missileEnd.y;
    launchAngle = Math.atan2(
      meteorPredY - turret.y + errY,
      meteorPredX - turret.x + errX
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
