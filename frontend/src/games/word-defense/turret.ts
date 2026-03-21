import type { Bullet, Meteor, TurretSlot } from "./types";
import {
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  TOTAL_TURRET_SLOTS, INITIAL_TURRET_COUNT,
  TURRET_BARREL_LENGTH, TURRET_BARREL_WIDTH, TURRET_BASE_RADIUS,
  BULLET_SPEED, BULLET_RENDER_RADIUS,
} from "./constants";

export function createTurretSlots(): TurretSlot[] {
  const slots: TurretSlot[] = [];
  const filledInterval = TOTAL_TURRET_SLOTS / INITIAL_TURRET_COUNT;

  for (let i = 0; i < TOTAL_TURRET_SLOTS; i++) {
    const angle = (i / TOTAL_TURRET_SLOTS) * Math.PI * 2 - Math.PI / 2;
    const x = EARTH_CX + Math.cos(angle) * EARTH_RADIUS;
    const y = EARTH_CY + Math.sin(angle) * EARTH_RADIUS;
    slots.push({
      angle,
      x,
      y,
      filled: i % filledInterval === 0,
    });
  }

  return slots;
}

export function findNearestFilledTurret(
  slots: TurretSlot[],
  targetX: number,
  targetY: number
): TurretSlot | null {
  let nearest: TurretSlot | null = null;
  let nearestDist = Infinity;

  for (const slot of slots) {
    if (!slot.filled) continue;
    const dx = slot.x - targetX;
    const dy = slot.y - targetY;
    const dist = dx * dx + dy * dy;
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = slot;
    }
  }

  return nearest;
}

export function fireBullet(turret: TurretSlot, target: Meteor): Bullet {
  return {
    x: turret.x,
    y: turret.y,
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
    } else {
      bullet.x += (dx / dist) * BULLET_SPEED * dt;
      bullet.y += (dy / dist) * BULLET_SPEED * dt;
    }
  }

  return hits;
}

export function renderTurrets(ctx: CanvasRenderingContext2D, slots: TurretSlot[]) {
  for (const slot of slots) {
    if (slot.filled) {
      ctx.save();
      ctx.translate(slot.x, slot.y);
      ctx.rotate(slot.angle);

      ctx.fillStyle = "#6b7280";
      ctx.fillRect(0, -TURRET_BARREL_WIDTH / 2, TURRET_BARREL_LENGTH, TURRET_BARREL_WIDTH);

      ctx.beginPath();
      ctx.arc(0, 0, TURRET_BASE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = "#9ca3af";
      ctx.fill();

      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(slot.x, slot.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.fill();
    }
  }
}

export function renderBullets(ctx: CanvasRenderingContext2D, bullets: Bullet[]) {
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
  ctx.shadowBlur = 6;

  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, BULLET_RENDER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowBlur = 0;
}
