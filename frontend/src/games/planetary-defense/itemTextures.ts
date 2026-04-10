import { type ItemType, ITEM_DISPLAY } from "./itemConfig";
import { MANIFEST } from "./manifest";

interface SheetDef {
  src: string;
  cols: number;
  rows: number;
}

const SWORDTEMBER: SheetDef = {
  src: "/Swordtember 2024 - Sheet/Swordtember_2024.png",
  cols: 5,
  rows: 6,
};

const AXETOBER: SheetDef = {
  src: "/Axetober Sheet/Axetober 2024.png",
  cols: 6,
  rows: 6,
};

interface SpriteRef {
  sheet: SheetDef;
  col: number;
  row: number;
}

const SPRITE_FRAMES: Record<string, SpriteRef> = {
  "Embercrest Blade": { sheet: SWORDTEMBER, col: 0, row: 0 },
  "Briarthorn Saber": { sheet: SWORDTEMBER, col: 1, row: 0 },
  "Ravenplume Edge": { sheet: SWORDTEMBER, col: 2, row: 0 },
  "Rubyguard Greatsword": { sheet: SWORDTEMBER, col: 3, row: 0 },
  "Sunfire Scimitar": { sheet: SWORDTEMBER, col: 4, row: 0 },
  "Cloudveil Longsword": { sheet: SWORDTEMBER, col: 0, row: 1 },
  "Voidthorn Blade": { sheet: SWORDTEMBER, col: 1, row: 1 },
  "Gilded Plumeblade": { sheet: SWORDTEMBER, col: 2, row: 1 },
  "Glacial Crusader": { sheet: SWORDTEMBER, col: 3, row: 1 },
  "Bloodthorn Dirk": { sheet: SWORDTEMBER, col: 4, row: 1 },
  "Twinflare Crossblades": { sheet: SWORDTEMBER, col: 0, row: 2 },
  "Molten Zweihander": { sheet: SWORDTEMBER, col: 1, row: 2 },
  "Frostfang Claymore": { sheet: SWORDTEMBER, col: 2, row: 2 },
  "Sporespark Glaive": { sheet: SWORDTEMBER, col: 3, row: 2 },
  "Azure Crescent": { sheet: SWORDTEMBER, col: 4, row: 2 },
  "Rosevine Rapier": { sheet: SWORDTEMBER, col: 0, row: 3 },
  "Crystalbreak Saber": { sheet: SWORDTEMBER, col: 1, row: 3 },
  "Cinderstone Blade": { sheet: SWORDTEMBER, col: 2, row: 3 },
  "Emerald Fang": { sheet: SWORDTEMBER, col: 3, row: 3 },
  "Starfall Stiletto": { sheet: SWORDTEMBER, col: 4, row: 3 },
  "Crimson Cleaver": { sheet: SWORDTEMBER, col: 0, row: 4 },
  "Tigerstripe Falchion": { sheet: SWORDTEMBER, col: 1, row: 4 },
  "Dawnfire Cutlass": { sheet: SWORDTEMBER, col: 2, row: 4 },
  "Jadecross Broadsword": { sheet: SWORDTEMBER, col: 3, row: 4 },
  "Chainlink Estoc": { sheet: SWORDTEMBER, col: 4, row: 4 },
  "Permafrost Greatsword": { sheet: SWORDTEMBER, col: 0, row: 5 },
  "Mistral Sabre": { sheet: SWORDTEMBER, col: 1, row: 5 },
  "Tidecaller Blade": { sheet: SWORDTEMBER, col: 2, row: 5 },
  "Solaris Edge": { sheet: SWORDTEMBER, col: 3, row: 5 },
  "Infernal Ravager": { sheet: SWORDTEMBER, col: 4, row: 5 },

  "Steel Battleaxe": { sheet: AXETOBER, col: 0, row: 0 },
  "Moonlit Hatchet": { sheet: AXETOBER, col: 1, row: 0 },
  "Obsidian Reaver": { sheet: AXETOBER, col: 2, row: 0 },
  "Rubyflare Greataxe": { sheet: AXETOBER, col: 3, row: 0 },
  "Gilded Waraxe": { sheet: AXETOBER, col: 4, row: 0 },
  "Copperhead Cleaver": { sheet: AXETOBER, col: 5, row: 0 },
  "Bonecrest Axe": { sheet: AXETOBER, col: 0, row: 1 },
  "Darkwood Hatchet": { sheet: AXETOBER, col: 1, row: 1 },
  "Duskforge Halberd": { sheet: AXETOBER, col: 2, row: 1 },
  "Rosegold Broadaxe": { sheet: AXETOBER, col: 3, row: 1 },
  "Frostbite Cleaver": { sheet: AXETOBER, col: 4, row: 1 },
  "Bloodmoon Reaver": { sheet: AXETOBER, col: 5, row: 1 },
  "Tidebreak Axe": { sheet: AXETOBER, col: 0, row: 2 },
  "Ironwood Tomahawk": { sheet: AXETOBER, col: 1, row: 2 },
  "Greystone Broadaxe": { sheet: AXETOBER, col: 2, row: 2 },
  "Sandstone Hatchet": { sheet: AXETOBER, col: 3, row: 2 },
  "Crimson Waraxe": { sheet: AXETOBER, col: 4, row: 2 },
  "Goldscar Halberd": { sheet: AXETOBER, col: 5, row: 2 },
  "Flamecrest Greataxe": { sheet: AXETOBER, col: 0, row: 3 },
  "Wrought Iron Chopper": { sheet: AXETOBER, col: 1, row: 3 },
  "Spectral Cleaver": { sheet: AXETOBER, col: 2, row: 3 },
  "Bloodrune Axe": { sheet: AXETOBER, col: 3, row: 3 },
  "Pearlsteel Hatchet": { sheet: AXETOBER, col: 4, row: 3 },
  "Emberstrike Tomahawk": { sheet: AXETOBER, col: 5, row: 3 },
  "Nightbloom Reaver": { sheet: AXETOBER, col: 0, row: 4 },
  "Blackiron Splitter": { sheet: AXETOBER, col: 1, row: 4 },
  "Verdant Waraxe": { sheet: AXETOBER, col: 2, row: 4 },
  "Ashen Broadaxe": { sheet: AXETOBER, col: 3, row: 4 },
  "Prismatic Greataxe": { sheet: AXETOBER, col: 4, row: 4 },
  "Hellforged Cleaver": { sheet: AXETOBER, col: 5, row: 4 },
  "Granite Waraxe": { sheet: AXETOBER, col: 0, row: 5 },
};

const MANIFEST_SRC: Record<string, string> = {};
for (const bundle of MANIFEST.bundles) {
  if (!Array.isArray(bundle.assets)) continue;
  for (const entry of bundle.assets) {
    const alias = typeof entry.alias === "string" ? entry.alias : undefined;
    const src = typeof entry.src === "string" ? entry.src : undefined;
    if (alias && src) {
      MANIFEST_SRC[alias] = src;
    }
  }
}

export interface ItemTextureInfo {
  src: string;
  backgroundPosition?: string;
  backgroundSize?: string;
}

export function getItemTextureInfo(itemType: ItemType): ItemTextureInfo {
  const display = ITEM_DISPLAY[itemType];

  const sprite = SPRITE_FRAMES[display];
  if (sprite) {
    const { sheet, col, row } = sprite;
    const posX = sheet.cols > 1 ? (col / (sheet.cols - 1)) * 100 : 0;
    const posY = sheet.rows > 1 ? (row / (sheet.rows - 1)) * 100 : 0;
    return {
      src: sheet.src,
      backgroundPosition: `${posX}% ${posY}%`,
      backgroundSize: `${sheet.cols * 100}% ${sheet.rows * 100}%`,
    };
  }

  const manifestPath = MANIFEST_SRC[display];
  if (manifestPath) {
    return { src: manifestPath };
  }

  return { src: "" };
}
