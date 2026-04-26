import { Graphics } from "pixi.js";
import type { EntityState } from "./state";

const HEALTH_BAR_WIDTH = 28;
const HEALTH_BAR_HEIGHT = 3;
const HEALTH_BAR_OFFSET = -18;
const BOSS_HEALTH_BAR_WIDTH = 82;
const BOSS_HEALTH_BAR_HEIGHT = 8;
const BOSS_HEALTH_BAR_OFFSET = -54;

function shouldDisplayHealthBar(entity: EntityState, ratio: number): boolean {
  return entity.isBoss || ratio < 1;
}

export function drawHealthBar(
  g: Graphics,
  entity: EntityState
): void {
  g.clear();
  g.x = entity.x;
  g.y = entity.y + (entity.isBoss ? BOSS_HEALTH_BAR_OFFSET : HEALTH_BAR_OFFSET);

  const ratio = Math.max(0, entity.health / entity.maxHealth);
  if (!shouldDisplayHealthBar(entity, ratio)) return;

  const barColor = ratio > 0.6 ? 0x4ade80 : ratio > 0.3 ? 0xfbbf24 : 0xef4444;
  const width = entity.isBoss ? BOSS_HEALTH_BAR_WIDTH : HEALTH_BAR_WIDTH;
  const height = entity.isBoss ? BOSS_HEALTH_BAR_HEIGHT : HEALTH_BAR_HEIGHT;

  if (entity.isBoss) {
    g.roundRect(-width / 2 - 3, -3, width + 6, height + 6, 5);
    g.fill({ color: 0xf9e2af, alpha: 0.2 });
    g.stroke({ color: 0xf9e2af, alpha: 0.8, width: 1 });
  }

  g.rect(-width / 2, 0, width, height);
  g.fill({ color: 0x000000, alpha: 0.5 });

  if (ratio > 0) {
    g.rect(-width / 2, 0, width * ratio, height);
    g.fill({ color: barColor });
  }
}
