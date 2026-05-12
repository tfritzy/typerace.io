import { Graphics } from "pixi.js";
import type { EntityState } from "./state";

const HEALTH_BAR_WIDTH = 28;
const HEALTH_BAR_HEIGHT = 3;
const HEALTH_BAR_OFFSET = -18;
const ENEMY_HEALTH_BAR_WIDTH = 48;
const ENEMY_HEALTH_BAR_HEIGHT = 6;
const ENEMY_HEALTH_BAR_OFFSET = -34;

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
  drawStandardHealthBar(g, ratio, HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT, HEALTH_BAR_OFFSET);
}

export function drawEnemyHealthBar(g: Graphics, entity: EntityState): void {
  g.clear();
  g.x = entity.x;
  g.y = entity.y;

  const ratio = Math.max(0, entity.health / entity.maxHealth);
  drawStandardHealthBar(g, ratio, ENEMY_HEALTH_BAR_WIDTH, ENEMY_HEALTH_BAR_HEIGHT, ENEMY_HEALTH_BAR_OFFSET);
}

function drawStandardHealthBar(
  g: Graphics,
  ratio: number,
  width: number,
  height: number,
  offset: number
): void {
  g.y += offset;
  if (ratio >= 1) return;

  const barColor = getHealthBarColor(ratio);

  g.rect(-width / 2, 0, width, height);
  g.fill({ color: 0x000000, alpha: 0.5 });

  if (ratio > 0) {
    g.rect(-width / 2, 0, width * ratio, height);
    g.fill({ color: barColor });
  }
}
