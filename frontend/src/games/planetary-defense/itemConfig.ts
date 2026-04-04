import { RelicType, RELIC_DISPLAY } from "./relicConfig";

export enum GemType {
  ChippedTopaz = "ChippedTopaz",
  FlawedTopaz = "FlawedTopaz",
  Topaz = "Topaz",
  FlawlessTopaz = "FlawlessTopaz",
  PerfectTopaz = "PerfectTopaz",
  ChippedRuby = "ChippedRuby",
  FlawedRuby = "FlawedRuby",
  Ruby = "Ruby",
  FlawlessRuby = "FlawlessRuby",
  PerfectRuby = "PerfectRuby",
  ChippedEmerald = "ChippedEmerald",
  FlawedEmerald = "FlawedEmerald",
  Emerald = "Emerald",
  FlawlessEmerald = "FlawlessEmerald",
  PerfectEmerald = "PerfectEmerald",
}

export type ItemType = RelicType | GemType | "Gold";

export interface ItemConfig {
  stackable: boolean;
}

export interface Item {
  type: ItemType;
  amount: number;
}

const RELIC_VALUES = new Set<ItemType>(
  Object.values(RelicType).filter((v) => typeof v === "number") as RelicType[]
);

const GEM_VALUES = new Set<ItemType>(Object.values(GemType));

export function isRelic(type: ItemType): type is RelicType {
  return RELIC_VALUES.has(type);
}

export function isGem(type: ItemType): type is GemType {
  return GEM_VALUES.has(type);
}

export interface ItemDisplay {
  spriteSheet: "swordtember" | "axetober";
  frameName: string;
}

const GEM_PLACEHOLDER_SPRITES: Record<GemType, ItemDisplay> = {
  [GemType.ChippedTopaz]: { spriteSheet: "swordtember", frameName: "Sunfire Scimitar" },
  [GemType.FlawedTopaz]: { spriteSheet: "swordtember", frameName: "Sunfire Scimitar" },
  [GemType.Topaz]: { spriteSheet: "swordtember", frameName: "Sunfire Scimitar" },
  [GemType.FlawlessTopaz]: { spriteSheet: "swordtember", frameName: "Sunfire Scimitar" },
  [GemType.PerfectTopaz]: { spriteSheet: "swordtember", frameName: "Sunfire Scimitar" },
  [GemType.ChippedRuby]: { spriteSheet: "swordtember", frameName: "Infernal Ravager" },
  [GemType.FlawedRuby]: { spriteSheet: "swordtember", frameName: "Infernal Ravager" },
  [GemType.Ruby]: { spriteSheet: "swordtember", frameName: "Infernal Ravager" },
  [GemType.FlawlessRuby]: { spriteSheet: "swordtember", frameName: "Infernal Ravager" },
  [GemType.PerfectRuby]: { spriteSheet: "swordtember", frameName: "Infernal Ravager" },
  [GemType.ChippedEmerald]: { spriteSheet: "swordtember", frameName: "Emerald Fang" },
  [GemType.FlawedEmerald]: { spriteSheet: "swordtember", frameName: "Emerald Fang" },
  [GemType.Emerald]: { spriteSheet: "swordtember", frameName: "Emerald Fang" },
  [GemType.FlawlessEmerald]: { spriteSheet: "swordtember", frameName: "Emerald Fang" },
  [GemType.PerfectEmerald]: { spriteSheet: "swordtember", frameName: "Emerald Fang" },
};

const GOLD_DISPLAY: ItemDisplay = { spriteSheet: "axetober", frameName: "Gilded Waraxe" };

function buildItemDisplay(): Map<ItemType, ItemDisplay> {
  const display = new Map<ItemType, ItemDisplay>();

  for (const key of RELIC_VALUES) {
    const rd = RELIC_DISPLAY[key as RelicType];
    display.set(key, { spriteSheet: rd.spriteSheet, frameName: rd.frameName });
  }

  for (const gem of Object.values(GemType)) {
    display.set(gem, GEM_PLACEHOLDER_SPRITES[gem]);
  }

  display.set("Gold", GOLD_DISPLAY);

  return display;
}

export const ITEM_DISPLAY: Map<ItemType, ItemDisplay> = buildItemDisplay();

export function getItemDisplay(type: ItemType): ItemDisplay {
  return ITEM_DISPLAY.get(type) ?? GOLD_DISPLAY;
}

function buildItemConfigs(): Map<ItemType, ItemConfig> {
  const configs = new Map<ItemType, ItemConfig>();

  for (const key of RELIC_VALUES) {
    configs.set(key, { stackable: false });
  }

  for (const gem of Object.values(GemType)) {
    configs.set(gem, { stackable: false });
  }

  configs.set("Gold", { stackable: true });

  return configs;
}

export const ITEM_CONFIGS: Map<ItemType, ItemConfig> = buildItemConfigs();

export function getItemConfig(type: ItemType): ItemConfig {
  return ITEM_CONFIGS.get(type) ?? { stackable: false };
}
