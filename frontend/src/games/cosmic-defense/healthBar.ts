import { Graphics } from "pixi.js";
import type { EntityState } from "./state";

const HEALTH_BAR_WIDTH = 28;
const HEALTH_BAR_HEIGHT = 3;
const HEALTH_BAR_OFFSET = -18;

function getHealthBarColor(ratio: number): number {
  return ratio > 0.6 ? 0x4ade80 : ratio > 0.3 ? 0xfbbf24 : 0xef4444;
}

export function drawHealthBar(
  g: Graphics,
  entity: EntityState
): void {
  g.clear();
  g.x = entity.x;
  g.y = entity.y;

  const ratio = Math.max(0, entity.health / entity.maxHealth);
  drawStandardHealthBar(g, ratio);
}

function drawStandardHealthBar(g: Graphics, ratio: number): void {
  g.y += HEALTH_BAR_OFFSET;
  if (ratio >= 1) return;

  const barColor = getHealthBarColor(ratio);

  g.rect(-HEALTH_BAR_WIDTH / 2, 0, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
  g.fill({ color: 0x000000, alpha: 0.5 });

  if (ratio > 0) {
    g.rect(-HEALTH_BAR_WIDTH / 2, 0, HEALTH_BAR_WIDTH * ratio, HEALTH_BAR_HEIGHT);
    g.fill({ color: barColor });
  }
}
