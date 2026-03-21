import type { Bullet, Meteor, SceneObject, TurretSlot } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  TOTAL_TURRET_SLOTS, INITIAL_TURRET_COUNT,
  BULLET_SPEED, GRAVITY_STRENGTH,
  SLOT_SURFACE_INWARD, SLOT_SURFACE_CHECK_RADIUS, SLOT_SURFACE_THRESHOLD,
} from "./constants";

export function createTurretSlots(): TurretSlot[] {
  const slots: TurretSlot[] = [];
  const filledInterval = TOTAL_TURRET_SLOTS / INITIAL_TURRET_COUNT;

  for (let i = 0; i < TOTAL_TURRET_SLOTS; i++) {
    const angle = (i / TOTAL_TURRET_SLOTS) * Math.PI * 2 - Math.PI / 2;
    const x = EARTH_CX + Math.cos(angle) * EARTH_RADIUS;
    const y = EARTH_CY + Math.sin(angle) * EARTH_RADIUS;
    slots.push({
      baseAngle: angle,
      angle,
      x,
      y,
      filled: i % filledInterval === 0,
      destroyed: false,
    });
  }

  return slots;
}

export function updateTurretPositions(slots: TurretSlot[], rotation: number) {
  for (const slot of slots) {
    const totalAngle = slot.baseAngle + rotation;
    slot.angle = totalAngle;
    slot.x = EARTH_CX + Math.cos(totalAngle) * EARTH_RADIUS;
    slot.y = EARTH_CY + Math.sin(totalAngle) * EARTH_RADIUS;
  }
}

function hasLineOfSight(turret: TurretSlot, targetX: number, targetY: number): boolean {
  const dx = targetX - turret.x;
  const dy = targetY - turret.y;
  const segLenSq = dx * dx + dy * dy;

  const toCenterX = EARTH_CX - turret.x;
  const toCenterY = EARTH_CY - turret.y;

  let t = (toCenterX * dx + toCenterY * dy) / segLenSq;
  t = Math.max(0.05, Math.min(1, t));

  const closestX = turret.x + t * dx;
  const closestY = turret.y + t * dy;

  const distSq = (closestX - EARTH_CX) ** 2 + (closestY - EARTH_CY) ** 2;
  const threshold = EARTH_RADIUS - 5;
  return distSq >= threshold * threshold;
}

export function findTurretsWithLineOfSight(
  slots: TurretSlot[],
  targetX: number,
  targetY: number
): TurretSlot[] {
  const result: TurretSlot[] = [];
  for (const slot of slots) {
    if (slot.filled && !slot.destroyed && hasLineOfSight(slot, targetX, targetY)) {
      result.push(slot);
    }
  }
  return result;
}

function applyGravityStep(
  x: number, y: number, vx: number, vy: number, stepDt: number
): { x: number; y: number; vx: number; vy: number } {
  x += vx * stepDt;
  y += vy * stepDt;
  const gx = EARTH_CX - x;
  const gy = EARTH_CY - y;
  const gd = Math.sqrt(gx * gx + gy * gy);
  if (gd > 1) {
    const accel = GRAVITY_STRENGTH / Math.max(gd, EARTH_RADIUS);
    vx += (gx / gd) * accel * stepDt;
    vy += (gy / gd) * accel * stepDt;
  }
  return { x, y, vx, vy };
}

function simulatePosition(
  x: number, y: number, vx: number, vy: number, totalTime: number
): { x: number; y: number } {
  const steps = Math.max(Math.ceil(totalTime * 60), 1);
  const stepDt = totalTime / steps;
  for (let s = 0; s < steps; s++) {
    ({ x, y, vx, vy } = applyGravityStep(x, y, vx, vy, stepDt));
  }
  return { x, y };
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

  let aimX = meteorPred.x;
  let aimY = meteorPred.y;

  for (let iter = 0; iter < 4; iter++) {
    const adx = aimX - turret.x;
    const ady = aimY - turret.y;
    const aDist = Math.sqrt(adx * adx + ady * ady);
    const bvx = (adx / aDist) * BULLET_SPEED;
    const bvy = (ady / aDist) * BULLET_SPEED;

    const bulletEnd = simulatePosition(turret.x, turret.y, bvx, bvy, t);

    aimX += meteorPred.x - bulletEnd.x;
    aimY += meteorPred.y - bulletEnd.y;
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

export function updateBullets(
  bullets: Bullet[],
  meteors: Meteor[],
  dt: number
): { x: number; y: number; target: Meteor }[] {
  const hits: { x: number; y: number; target: Meteor }[] = [];

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];

    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;

    const bgdx = EARTH_CX - bullet.x;
    const bgdy = EARTH_CY - bullet.y;
    const bgDist = Math.sqrt(bgdx * bgdx + bgdy * bgdy);
    if (bgDist > 1) {
      const bAccel = GRAVITY_STRENGTH / Math.max(bgDist, EARTH_RADIUS);
      bullet.vx += (bgdx / bgDist) * bAccel * dt;
      bullet.vy += (bgdy / bgDist) * bAccel * dt;
    }

    if (
      bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50 ||
      bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50
    ) {
      bullets.splice(i, 1);
      continue;
    }

    if (!meteors.includes(bullet.target)) {
      bullets.splice(i, 1);
      continue;
    }

    const targetCx = bullet.target.x + bullet.target.width / 2;
    const targetCy = bullet.target.y + bullet.target.height / 2;
    const dx = targetCx - bullet.x;
    const dy = targetCy - bullet.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < bullet.target.radius * 0.8) {
      hits.push({ x: bullet.x, y: bullet.y, target: bullet.target });
      bullets.splice(i, 1);
    }
  }

  return hits;
}

export function isSlotGroundIntact(planet: SceneObject, slot: TurretSlot): boolean {
  const checkX = Math.cos(slot.baseAngle) * (EARTH_RADIUS - SLOT_SURFACE_INWARD) + EARTH_RADIUS;
  const checkY = Math.sin(slot.baseAngle) * (EARTH_RADIUS - SLOT_SURFACE_INWARD) + EARTH_RADIUS;
  const r = SLOT_SURFACE_CHECK_RADIUS;
  const r2 = r * r;
  let solidCount = 0;

  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r2) continue;
      const px = Math.floor(checkX + dx);
      const py = Math.floor(checkY + dy);
      if (px >= 0 && px < planet.width && py >= 0 && py < planet.height) {
        if (planet.data[py * planet.width + px] !== 0) {
          solidCount++;
        }
      }
    }
  }

  return solidCount >= SLOT_SURFACE_THRESHOLD;
}
