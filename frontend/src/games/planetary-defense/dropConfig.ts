export enum DropCategory {
  Gold,
  Gem,
}

export enum GemType {
  ChippedTopaz,
  FlawedTopaz,
  Topaz,
  FlawlessTopaz,
  PerfectTopaz,
  ChippedRuby,
  FlawedRuby,
  Ruby,
  FlawlessRuby,
  PerfectRuby,
  ChippedEmerald,
  FlawedEmerald,
  Emerald,
  FlawlessEmerald,
  PerfectEmerald,
}

export const GEM_COLORS: Record<GemType, number> = {
  [GemType.ChippedTopaz]: 0xf59e0b,
  [GemType.FlawedTopaz]: 0xf59e0b,
  [GemType.Topaz]: 0xf59e0b,
  [GemType.FlawlessTopaz]: 0xf59e0b,
  [GemType.PerfectTopaz]: 0xf59e0b,
  [GemType.ChippedRuby]: 0xef4444,
  [GemType.FlawedRuby]: 0xef4444,
  [GemType.Ruby]: 0xef4444,
  [GemType.FlawlessRuby]: 0xef4444,
  [GemType.PerfectRuby]: 0xef4444,
  [GemType.ChippedEmerald]: 0x10b981,
  [GemType.FlawedEmerald]: 0x10b981,
  [GemType.Emerald]: 0x10b981,
  [GemType.FlawlessEmerald]: 0x10b981,
  [GemType.PerfectEmerald]: 0x10b981,
};

export const GEM_NAMES: Record<GemType, string> = {
  [GemType.ChippedTopaz]: "Chipped Topaz",
  [GemType.FlawedTopaz]: "Flawed Topaz",
  [GemType.Topaz]: "Topaz",
  [GemType.FlawlessTopaz]: "Flawless Topaz",
  [GemType.PerfectTopaz]: "Perfect Topaz",
  [GemType.ChippedRuby]: "Chipped Ruby",
  [GemType.FlawedRuby]: "Flawed Ruby",
  [GemType.Ruby]: "Ruby",
  [GemType.FlawlessRuby]: "Flawless Ruby",
  [GemType.PerfectRuby]: "Perfect Ruby",
  [GemType.ChippedEmerald]: "Chipped Emerald",
  [GemType.FlawedEmerald]: "Flawed Emerald",
  [GemType.Emerald]: "Emerald",
  [GemType.FlawlessEmerald]: "Flawless Emerald",
  [GemType.PerfectEmerald]: "Perfect Emerald",
};

export const GOLD_COLOR = 0xfbbf24;
export const DROP_LABEL_COLOR = "#b0b0b0";

export const DROP_SIZE = 8;
export const DROP_SPEED = 80;
export const DROP_FRICTION = 1.5;

export function calculateGoldDrop(power: number): number {
  return Math.ceil(power / 10);
}

export function rollGemDrop(power: number): GemType | null {
  const gemChance = Math.min(0.5, 0.05 + power / 10000);
  if (Math.random() >= gemChance) return null;

  const bases = [0, 5, 10];
  const base = bases[Math.floor(Math.random() * 3)];

  let quality: number;
  if (power >= 10000) quality = 4;
  else if (power >= 1000) quality = 3;
  else if (power >= 200) quality = 2;
  else if (power >= 50) quality = 1;
  else quality = 0;

  return (base + quality) as GemType;
}
