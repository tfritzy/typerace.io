import { Graphics } from "pixi.js";
import type { EntityState } from "./state";

const HEALTH_BAR_WIDTH = 40;
const HEALTH_BAR_HEIGHT = 4;
const HEALTH_BAR_OFFSET = -30;

export function drawHealthBar(
  g: Graphics,
  entity: EntityState
): void {
  g.clear();
  g.x = entity.x;
  g.y = entity.y + HEALTH_BAR_OFFSET;

  const ratio = Math.max(0, entity.health / entity.maxHealth);
  if (ratio >= 1) return;

  const barColor = ratio > 0.6 ? 0x4ade80 : ratio > 0.3 ? 0xfbbf24 : 0xef4444;

  g.rect(-HEALTH_BAR_WIDTH / 2, 0, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
  g.fill({ color: 0x000000, alpha: 0.5 });

  if (ratio > 0) {
    g.rect(-HEALTH_BAR_WIDTH / 2, 0, HEALTH_BAR_WIDTH * ratio, HEALTH_BAR_HEIGHT);
    g.fill({ color: barColor });
  }
}
