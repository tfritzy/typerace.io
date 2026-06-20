import { Graphics } from "pixi.js";
import type { EntityState } from "./state";

const HEALTH_BAR_WIDTH = 48;
const HEALTH_BAR_HEIGHT = 6;
const HEALTH_BAR_OFFSET = -34;
const HEALTH_BAR_HALF_WIDTH = HEALTH_BAR_WIDTH / 2;

const _bgFillStyle = { color: 0x000000, alpha: 0.5 };
const _barFillStyle = { color: 0x4ade80 };

function getHealthBarColor(ratio: number): number {
  return ratio > 0.6 ? 0x4ade80 : ratio > 0.3 ? 0xfbbf24 : 0xef4444;
}

export function drawHealthBar(g: Graphics, entity: EntityState): void {
  g.clear();
  g.x = entity.x;
  g.y = entity.y + HEALTH_BAR_OFFSET;

  const ratio = Math.max(0, entity.health / entity.maxHealth);
  if (ratio >= 1) return;

  g.rect(-HEALTH_BAR_HALF_WIDTH, 0, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
  g.fill(_bgFillStyle);

  if (ratio > 0) {
    _barFillStyle.color = getHealthBarColor(ratio);
    g.rect(-HEALTH_BAR_HALF_WIDTH, 0, HEALTH_BAR_WIDTH * ratio, HEALTH_BAR_HEIGHT);
    g.fill(_barFillStyle);
  }
}
