import type { Projectile, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY,
  MISSILE_INITIAL_SPEED, MISSILE_ACCEL_DURATION, MISSILE_ACCELERATION,
  MISSILE_FUSE_BUFFER, MISSILE_DAMAGE, MISSILE_EXPLOSION_RADIUS,
  NUCLEAR_MISSILE_DAMAGE, NUCLEAR_MISSILE_EXPLOSION_RADIUS,
  CANVAS_WIDTH, CANVAS_HEIGHT, METEOR_CLEANUP_MARGIN,
} from "./constants";

function getMissileSpeedAtTime(age: number): number {
  const accelTime = Math.min(Math.max(age, 0), MISSILE_ACCEL_DURATION);
  return MISSILE_INITIAL_SPEED + MISSILE_ACCELERATION * accelTime;
}

function estimateMissileFlightTimeForDistance(dist: number): number {
  const safeDist = Math.max(dist, 0);

  if (MISSILE_ACCELERATION <= 0) {
    return safeDist / Math.max(MISSILE_INITIAL_SPEED, 1e-6);
  }

  const accelTime = Math.max(MISSILE_ACCEL_DURATION, 0);
  const speedAfterAccel = MISSILE_INITIAL_SPEED + MISSILE_ACCELERATION * accelTime;
  const accelDist = MISSILE_INITIAL_SPEED * accelTime
    + 0.5 * MISSILE_ACCELERATION * accelTime * accelTime;

  if (safeDist <= accelDist) {
    const disc = Math.max(MISSILE_INITIAL_SPEED * MISSILE_INITIAL_SPEED + 2 * MISSILE_ACCELERATION * safeDist, 0);
    return (-MISSILE_INITIAL_SPEED + Math.sqrt(disc)) / MISSILE_ACCELERATION;
  }

  const cruiseDist = safeDist - accelDist;
  return accelTime + cruiseDist / Math.max(speedAfterAccel, 1e-6);
}

function estimateMissileFlightTime(turretX: number, turretY: number, targetX: number, targetY: number): number {
  const dx = targetX - turretX;
  const dy = targetY - turretY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return estimateMissileFlightTimeForDistance(dist);
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

export function fireMissile(turret: TurretSlot, target: Meteor): Projectile | null {
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
    flightTime = estimateMissileFlightTimeForDistance(newDist);
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
    damage: MISSILE_DAMAGE,
    target,
    explosionRadius: MISSILE_EXPLOSION_RADIUS,
    age: 0,
    fuseTime,
    launchAngle,
    speed: initialSpeed,
  };
}

export function fireNuclearMissile(turret: TurretSlot, target: Meteor): Projectile | null {
  const proj = fireMissile(turret, target);
  if (!proj) return null;
  proj.damage = NUCLEAR_MISSILE_DAMAGE;
  proj.explosionRadius = NUCLEAR_MISSILE_EXPLOSION_RADIUS;
  return proj;
}

export function updateMissile(proj: Projectile, dt: number): boolean {
  proj.age += dt;

  if (proj.age >= proj.fuseTime) {
    return true;
  }

  proj.speed = getMissileSpeedAtTime(proj.age);
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
