import { RelicType, RELIC_DISPLAY, type RelicDisplayInfo } from "./relicConfig";

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
  spriteSheet: "swordtember" | "axetober";
  frameName: string;
}

export interface Item {
  type: ItemType;
  amount: number;
}

const GEM_PLACEHOLDER_SPRITES: Record<GemType, RelicDisplayInfo> = {
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

const GOLD_SPRITE: RelicDisplayInfo = { spriteSheet: "axetober", frameName: "Gilded Waraxe" };

function buildItemConfigs(): Record<ItemType, ItemConfig> {
  const configs = {} as Record<ItemType, ItemConfig>;

  for (const key of Object.values(RelicType).filter((v) => typeof v === "number") as RelicType[]) {
    const display = RELIC_DISPLAY[key];
    configs[key] = {
      stackable: false,
      spriteSheet: display.spriteSheet,
      frameName: display.frameName,
    };
  }

  for (const gem of Object.values(GemType)) {
    const display = GEM_PLACEHOLDER_SPRITES[gem];
    configs[gem] = {
      stackable: false,
      spriteSheet: display.spriteSheet,
      frameName: display.frameName,
    };
  }

  configs["Gold"] = {
    stackable: true,
    spriteSheet: GOLD_SPRITE.spriteSheet,
    frameName: GOLD_SPRITE.frameName,
  };

  return configs;
}

export const ITEM_CONFIGS: Record<ItemType, ItemConfig> = buildItemConfigs();

export function getItemConfig(type: ItemType): ItemConfig {
  return ITEM_CONFIGS[type];
}

export function isRelic(type: ItemType): type is RelicType {
  return typeof type === "number";
}

export function isGem(type: ItemType): type is GemType {
  return typeof type === "string" && type !== "Gold";
}
