import { Graphics } from "pixi.js";
import type { EntityState } from "./state";

const HEALTH_BAR_WIDTH = 28;
const HEALTH_BAR_HEIGHT = 3;
const HEALTH_BAR_OFFSET = -18;
const BOSS_HEALTH_BAR_WIDTH = 82;
const BOSS_HEALTH_BAR_HEIGHT = 8;
const BOSS_HEALTH_BAR_OFFSET = -54;
const BOSS_HEALTH_BAR_TICKS = 6;

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

  g.roundRect(left - 6, -6, BOSS_HEALTH_BAR_WIDTH + 12, BOSS_HEALTH_BAR_HEIGHT + 12, 6);
  g.fill({ color: 0x11111b, alpha: 0.75 });
  g.stroke({ color: 0xf9e2af, alpha: 0.9, width: 2 });

  g.rect(left - 2, -2, BOSS_HEALTH_BAR_WIDTH + 4, BOSS_HEALTH_BAR_HEIGHT + 4);
  g.stroke({ color: 0xfab387, alpha: 0.5, width: 1 });

  g.rect(left, 0, BOSS_HEALTH_BAR_WIDTH, BOSS_HEALTH_BAR_HEIGHT);
  g.fill({ color: 0x000000, alpha: 0.75 });

  if (ratio > 0) {
    g.rect(left, 0, BOSS_HEALTH_BAR_WIDTH * ratio, BOSS_HEALTH_BAR_HEIGHT);
    g.fill({ color: barColor });
  }

  for (let i = 1; i < BOSS_HEALTH_BAR_TICKS; i++) {
    const x = left + (BOSS_HEALTH_BAR_WIDTH / BOSS_HEALTH_BAR_TICKS) * i;
    g.moveTo(x, -3);
    g.lineTo(x, BOSS_HEALTH_BAR_HEIGHT + 3);
    g.stroke({ color: 0xf9e2af, alpha: 0.55, width: 1 });
  }

  g.moveTo(left - 10, BOSS_HEALTH_BAR_HEIGHT / 2);
  g.lineTo(left - 3, -4);
  g.lineTo(left - 3, BOSS_HEALTH_BAR_HEIGHT + 4);
  g.closePath();
  g.fill({ color: 0xf9e2af, alpha: 0.75 });

  g.moveTo(-left + 10, BOSS_HEALTH_BAR_HEIGHT / 2);
  g.lineTo(-left + 3, -4);
  g.lineTo(-left + 3, BOSS_HEALTH_BAR_HEIGHT + 4);
  g.closePath();
  g.fill({ color: 0xf9e2af, alpha: 0.75 });
}
