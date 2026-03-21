import type { Bullet, Meteor, SceneObject, TurretSlot } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  TOTAL_TURRET_SLOTS, INITIAL_TURRET_COUNT,
  BULLET_SPEED,
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

export function fireBullet(turret: TurretSlot, target: Meteor): Bullet {
  const targetCx = target.x + target.width / 2;
  const targetCy = target.y + target.height / 2;

  const dx = targetCx - turret.x;
  const dy = targetCy - turret.y;
  const a = BULLET_SPEED * BULLET_SPEED - (target.vx * target.vx + target.vy * target.vy);
  const b = -2 * (dx * target.vx + dy * target.vy);
  const c = -(dx * dx + dy * dy);

  let t = 0;
  const discriminant = b * b - 4 * a * c;
  if (discriminant >= 0 && Math.abs(a) > 0.001) {
    const sqrtD = Math.sqrt(discriminant);
    const t1 = (-b - sqrtD) / (2 * a);
    const t2 = (-b + sqrtD) / (2 * a);
    t = t1 > 0 ? t1 : t2 > 0 ? t2 : 0;
  }

  const predX = targetCx + target.vx * t;
  const predY = targetCy + target.vy * t;

  const pdx = predX - turret.x;
  const pdy = predY - turret.y;
  const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

  return {
    x: turret.x,
    y: turret.y,
    vx: (pdx / pdist) * BULLET_SPEED,
    vy: (pdy / pdist) * BULLET_SPEED,
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
  const checkX = Math.cos(slot.baseAngle) * (EARTH_RADIUS - SLOT_SURFACE_INWARD) + planet.width / 2;
  const checkY = Math.sin(slot.baseAngle) * (EARTH_RADIUS - SLOT_SURFACE_INWARD) + planet.height / 2;
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
