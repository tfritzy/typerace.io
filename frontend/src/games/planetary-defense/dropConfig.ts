export enum DropCategory {
  Gold,
  Gem,
}

export enum GemType {
  Topaz,
  Ruby,
  Emerald,
}

export enum GemQuality {
  Chipped,
  Flawed,
  Normal,
  Flawless,
  Perfect,
}

export const GEM_COLORS: Record<GemType, number> = {
  [GemType.Topaz]: 0xf59e0b,
  [GemType.Ruby]: 0xef4444,
  [GemType.Emerald]: 0x10b981,
};

export const GEM_LABEL_COLORS: Record<GemType, string> = {
  [GemType.Topaz]: "#f59e0b",
  [GemType.Ruby]: "#ef4444",
  [GemType.Emerald]: "#10b981",
};

export const GEM_QUALITY_LABEL_COLORS: Record<GemQuality, string> = {
  [GemQuality.Chipped]: "#9ca3af",
  [GemQuality.Flawed]: "#d1d5db",
  [GemQuality.Normal]: "#ffffff",
  [GemQuality.Flawless]: "#60a5fa",
  [GemQuality.Perfect]: "#c084fc",
};

export const GEM_NAMES: Record<GemType, string> = {
  [GemType.Topaz]: "Topaz",
  [GemType.Ruby]: "Ruby",
  [GemType.Emerald]: "Emerald",
};

export const QUALITY_NAMES: Record<GemQuality, string> = {
  [GemQuality.Chipped]: "Chipped",
  [GemQuality.Flawed]: "Flawed",
  [GemQuality.Normal]: "",
  [GemQuality.Flawless]: "Flawless",
  [GemQuality.Perfect]: "Perfect",
};

export const GOLD_COLOR = 0xfbbf24;
export const GOLD_LABEL_COLOR = "#fbbf24";

export const DROP_SPEED = 80;
export const DROP_FRICTION = 1.5;

export function calculateGoldDrop(power: number): number {
  return Math.ceil(power / 10);
}

export function rollGemDrop(power: number): { gemType: GemType; gemQuality: GemQuality } | null {
  const gemChance = Math.min(0.5, 0.05 + power / 10000);
  if (Math.random() >= gemChance) return null;

  const gemType = [GemType.Topaz, GemType.Ruby, GemType.Emerald][
    Math.floor(Math.random() * 3)
  ];

  let gemQuality: GemQuality;
  if (power >= 10000) gemQuality = GemQuality.Perfect;
  else if (power >= 1000) gemQuality = GemQuality.Flawless;
  else if (power >= 200) gemQuality = GemQuality.Normal;
  else if (power >= 50) gemQuality = GemQuality.Flawed;
  else gemQuality = GemQuality.Chipped;

  return { gemType, gemQuality };
}
