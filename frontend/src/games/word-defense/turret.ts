import { TurretType } from "./types";
import type { Bullet, Meteor, SceneObject, TurretSlot } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  TOTAL_TURRET_SLOTS, INITIAL_TURRET_COUNT,
  GRAVITY_STRENGTH,
  SLOT_SURFACE_INWARD, SLOT_SURFACE_CHECK_RADIUS, SLOT_SURFACE_THRESHOLD,
} from "./constants";
export { fireBullet } from "./aiming";

export function createTurretSlots(): TurretSlot[] {
  const slots: TurretSlot[] = [];

  for (let i = 0; i < TOTAL_TURRET_SLOTS; i++) {
    const angle = (i / TOTAL_TURRET_SLOTS) * Math.PI * 2 - Math.PI / 2;
    const x = EARTH_CX + Math.cos(angle) * EARTH_RADIUS;
    const y = EARTH_CY + Math.sin(angle) * EARTH_RADIUS;
    slots.push({
      baseAngle: angle,
      angle,
      x,
      y,
      filled: false,
      destroyed: false,
      turretType: TurretType.Bullet,
    });
  }

  for (let i = 0; i < INITIAL_TURRET_COUNT; i++) {
    const idx = Math.floor(i * slots.length / INITIAL_TURRET_COUNT);
    slots[idx].filled = true;
  }

  const missileIdx = Math.floor(slots.length / (2 * INITIAL_TURRET_COUNT));
  slots[missileIdx].filled = true;
  slots[missileIdx].turretType = TurretType.Missile;

  const laserIdx = Math.floor(slots.length / 2 + slots.length / (2 * INITIAL_TURRET_COUNT));
  slots[laserIdx].filled = true;
  slots[laserIdx].turretType = TurretType.Laser;

  const railgunIdx = Math.floor(slots.length / 4 + slots.length / (2 * INITIAL_TURRET_COUNT));
  slots[railgunIdx].filled = true;
  slots[railgunIdx].turretType = TurretType.Railgun;

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

export function findAvailableTurrets(
  slots: TurretSlot[],
): TurretSlot[] {
  const result: TurretSlot[] = [];
  for (const slot of slots) {
    if (slot.filled && !slot.destroyed) {
      result.push(slot);
    }
  }
  return result;
}

export function checkProjectileHitsMeteor(projectile: { x: number; y: number }, meteor: Meteor): boolean {
  const dx = projectile.x - meteor.x;
  const dy = projectile.y - meteor.y;
  return dx * dx + dy * dy <= meteor.radius * meteor.radius;
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

    if (checkProjectileHitsMeteor(bullet, bullet.target)) {
      hits.push({ x: bullet.x, y: bullet.y, target: bullet.target });
      bullets.splice(i, 1);
    }
  }

  return hits;
}

export function isSlotGroundIntact(planet: SceneObject, slot: TurretSlot): boolean {
  const center = planet.width / 2;
  const checkX = Math.cos(slot.baseAngle) * (EARTH_RADIUS - SLOT_SURFACE_INWARD) + center;
  const checkY = Math.sin(slot.baseAngle) * (EARTH_RADIUS - SLOT_SURFACE_INWARD) + center;
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
