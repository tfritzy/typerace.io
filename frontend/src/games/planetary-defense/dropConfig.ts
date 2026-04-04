import { GemType } from "./itemConfig";

export const DROP_LABEL_COLOR = "#b0b0b0";
export const DROP_SIZE = 8;
export const DROP_SPEED = 80;

export function calculateGoldDrop(power: number): number {
  return Math.ceil(power / 10);
}

const TOPAZ_TIERS: GemType[] = [
  GemType.ChippedTopaz,
  GemType.FlawedTopaz,
  GemType.Topaz,
  GemType.FlawlessTopaz,
  GemType.PerfectTopaz,
];
const RUBY_TIERS: GemType[] = [
  GemType.ChippedRuby,
  GemType.FlawedRuby,
  GemType.Ruby,
  GemType.FlawlessRuby,
  GemType.PerfectRuby,
];
const EMERALD_TIERS: GemType[] = [
  GemType.ChippedEmerald,
  GemType.FlawedEmerald,
  GemType.Emerald,
  GemType.FlawlessEmerald,
  GemType.PerfectEmerald,
];
const GEM_FAMILIES = [TOPAZ_TIERS, RUBY_TIERS, EMERALD_TIERS];

export function rollGemDrop(power: number): GemType | null {
  const gemChance = Math.min(0.5, 0.05 + power / 10000);
  if (Math.random() >= gemChance) return null;

  const family = GEM_FAMILIES[Math.floor(Math.random() * GEM_FAMILIES.length)];

  let quality: number;
  if (power >= 10000) quality = 4;
  else if (power >= 1000) quality = 3;
  else if (power >= 200) quality = 2;
  else if (power >= 50) quality = 1;
  else quality = 0;

  return family[quality];
}
