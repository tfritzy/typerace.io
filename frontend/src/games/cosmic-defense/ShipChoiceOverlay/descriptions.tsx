import type { FriendlyConfig } from "../enemyConfig";
import type { EntityType } from "../types";
import { KEYWORD_COLOR, keyword, num, plain, type TextSegment } from "./textSegments";

function getDmg(c: FriendlyConfig): number {
  return c.projectileDamage > 0 ? c.projectileDamage : c.laserDamage;
}

export type ShipDescriptionFn = (c: FriendlyConfig, next?: FriendlyConfig) => TextSegment[];

export const SHIP_DESCRIPTIONS: Partial<Record<EntityType, ShipDescriptionFn>> = {
  Spur: (c, next) => [
    plain("Fires a heavy round, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage to a single target."),
  ],
  Ember: (c, next) => [
    plain("Fires a light projectile, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage."),
  ],
  Corona: (c, next) => [
    plain("Fires a focused laser, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage."),
  ],
  Pip: (c, next) => [
    plain("Fires twin projectiles, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage each."),
  ],
  Eagle: (c, next) => [
    plain("Fires a laser, applying "),
    ...num(c.plasmaStacks, next?.plasmaStacks),
    plain(" stacks of "),
    keyword("plasma", KEYWORD_COLOR.plasma),
    plain("."),
  ],
  Needle: (c, next) => [
    plain("Fires a piercing laser, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage to every enemy in line."),
  ],
  Flare: (c, next) => [
    plain("Fires an explosive blast, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage and applying "),
    ...num(c.freezeStacks, next?.freezeStacks),
    plain(" stacks of "),
    keyword("freeze", KEYWORD_COLOR.freeze),
    plain(" in an area."),
  ],
  Dart: (c, next) => [
    plain("Fires a plasma blast, applying "),
    ...num(c.plasmaStacks, next?.plasmaStacks),
    plain(" stacks of "),
    keyword("plasma", KEYWORD_COLOR.plasma),
    plain(" to all enemies in an area."),
  ],
  Moth: (c, next) => [
    plain("Fires a steady projectile, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage."),
  ],
  Prism: (c, next) => [
    plain("Fires a piercing ice beam, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage and applying "),
    ...num(c.freezeStacks, next?.freezeStacks),
    plain(" stacks of "),
    keyword("freeze", KEYWORD_COLOR.freeze),
    plain("."),
  ],
  Hawk: (c, next) => [
    plain("Fires a heavy round, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage in an area."),
  ],
  Nova: (c, next) => [
    plain("Fires a bouncing shot that "),
    keyword("chains", KEYWORD_COLOR.chain),
    plain(" to "),
    ...num(c.chainCount, next?.chainCount),
    plain(" enemies, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage each."),
  ],
  Lance: (c, next) => [
    plain("Fires a massive piercing cannon, dealing "),
    ...num(getDmg(c), next ? getDmg(next) : undefined),
    plain(" damage to every enemy in line."),
  ],
};

export function getShipDescription(
  entityType: EntityType,
  c: FriendlyConfig,
  next?: FriendlyConfig
): TextSegment[] {
  const fn = SHIP_DESCRIPTIONS[entityType];
  return fn ? fn(c, next) : [plain("")];
}
