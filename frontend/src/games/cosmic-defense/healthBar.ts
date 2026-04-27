import { Graphics } from "pixi.js";
import type { EntityState } from "./state";

const HEALTH_BAR_WIDTH = 28;
const HEALTH_BAR_HEIGHT = 3;
const HEALTH_BAR_OFFSET = -18;
const BOSS_HEALTH_BAR_WIDTH = 100;
const BOSS_HEALTH_BAR_HEIGHT = 10;
const BOSS_HEALTH_BAR_OFFSET = -60;
const BOSS_HEALTH_BAR_TICKS = 4;
const BOSS_HEALTH_BAR_BORDER_RADIUS = 4;
const BOSS_HEALTH_BAR_INNER_RADIUS = 3;
const BOSS_HEALTH_BAR_GLOW_PAD = 1;
const BOSS_HEALTH_BAR_SHINE_INSET = 1;
const BOSS_HEALTH_BAR_SHINE_RADIUS = 2;
const BOSS_HEALTH_BAR_TICK_INSET = 1;

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
  if (entity.isBoss) {
    drawBossHealthBar(g, ratio);
  } else {
    drawStandardHealthBar(g, ratio);
  }
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

function drawBossHealthBar(g: Graphics, ratio: number): void {
  g.y += BOSS_HEALTH_BAR_OFFSET;
  const barColor = getHealthBarColor(ratio);
  const left = -BOSS_HEALTH_BAR_WIDTH / 2;

  g.roundRect(left - BOSS_HEALTH_BAR_GLOW_PAD, -BOSS_HEALTH_BAR_GLOW_PAD, BOSS_HEALTH_BAR_WIDTH + BOSS_HEALTH_BAR_GLOW_PAD * 2, BOSS_HEALTH_BAR_HEIGHT + BOSS_HEALTH_BAR_GLOW_PAD * 2, BOSS_HEALTH_BAR_BORDER_RADIUS);
  g.fill({ color: barColor, alpha: 0.18 });
  g.stroke({ color: barColor, alpha: 0.6, width: 1 });

  g.roundRect(left, 0, BOSS_HEALTH_BAR_WIDTH, BOSS_HEALTH_BAR_HEIGHT, BOSS_HEALTH_BAR_INNER_RADIUS);
  g.fill({ color: 0x000000, alpha: 0.7 });

  if (ratio > 0) {
    g.roundRect(left, 0, BOSS_HEALTH_BAR_WIDTH * ratio, BOSS_HEALTH_BAR_HEIGHT, BOSS_HEALTH_BAR_INNER_RADIUS);
    g.fill({ color: barColor });
  }

  if (ratio > 0 && ratio < 1) {
    const fillWidth = BOSS_HEALTH_BAR_WIDTH * ratio;
    const shineHeight = Math.floor(BOSS_HEALTH_BAR_HEIGHT / 2) - BOSS_HEALTH_BAR_SHINE_INSET;
    g.roundRect(left + BOSS_HEALTH_BAR_SHINE_INSET, BOSS_HEALTH_BAR_SHINE_INSET, fillWidth - BOSS_HEALTH_BAR_SHINE_INSET * 2, shineHeight, BOSS_HEALTH_BAR_SHINE_RADIUS);
    g.fill({ color: 0xffffff, alpha: 0.12 });
  }

  for (let i = 1; i < BOSS_HEALTH_BAR_TICKS; i++) {
    const x = left + (BOSS_HEALTH_BAR_WIDTH / BOSS_HEALTH_BAR_TICKS) * i;
    g.moveTo(x, BOSS_HEALTH_BAR_TICK_INSET);
    g.lineTo(x, BOSS_HEALTH_BAR_HEIGHT - BOSS_HEALTH_BAR_TICK_INSET);
    g.stroke({ color: 0x000000, alpha: 0.45, width: 1.5 });
  }
}
