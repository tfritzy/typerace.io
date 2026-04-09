import { type ItemType, ITEM_DISPLAY } from "./itemConfig";
import { MANIFEST } from "./manifest";

interface SpriteRef {
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const SWORDTEMBER_SHEET = "/Swordtember 2024 - Sheet/Swordtember_2024.png";
const AXETOBER_SHEET = "/Axetober Sheet/Axetober 2024.png";

const SPRITE_FRAMES: Record<string, SpriteRef> = {
  "Embercrest Blade": { src: SWORDTEMBER_SHEET, x: 0, y: 0, w: 32, h: 32 },
  "Briarthorn Saber": { src: SWORDTEMBER_SHEET, x: 32, y: 0, w: 32, h: 32 },
  "Ravenplume Edge": { src: SWORDTEMBER_SHEET, x: 64, y: 0, w: 32, h: 32 },
  "Rubyguard Greatsword": { src: SWORDTEMBER_SHEET, x: 96, y: 0, w: 32, h: 32 },
  "Sunfire Scimitar": { src: SWORDTEMBER_SHEET, x: 128, y: 0, w: 32, h: 32 },
  "Cloudveil Longsword": { src: SWORDTEMBER_SHEET, x: 0, y: 32, w: 32, h: 32 },
  "Voidthorn Blade": { src: SWORDTEMBER_SHEET, x: 32, y: 32, w: 32, h: 32 },
  "Gilded Plumeblade": { src: SWORDTEMBER_SHEET, x: 64, y: 32, w: 32, h: 32 },
  "Glacial Crusader": { src: SWORDTEMBER_SHEET, x: 96, y: 32, w: 32, h: 32 },
  "Bloodthorn Dirk": { src: SWORDTEMBER_SHEET, x: 128, y: 32, w: 32, h: 32 },
  "Twinflare Crossblades": { src: SWORDTEMBER_SHEET, x: 0, y: 64, w: 32, h: 32 },
  "Molten Zweihander": { src: SWORDTEMBER_SHEET, x: 32, y: 64, w: 32, h: 32 },
  "Frostfang Claymore": { src: SWORDTEMBER_SHEET, x: 64, y: 64, w: 32, h: 32 },
  "Sporespark Glaive": { src: SWORDTEMBER_SHEET, x: 96, y: 64, w: 32, h: 32 },
  "Azure Crescent": { src: SWORDTEMBER_SHEET, x: 128, y: 64, w: 32, h: 32 },
  "Rosevine Rapier": { src: SWORDTEMBER_SHEET, x: 0, y: 96, w: 32, h: 32 },
  "Crystalbreak Saber": { src: SWORDTEMBER_SHEET, x: 32, y: 96, w: 32, h: 32 },
  "Cinderstone Blade": { src: SWORDTEMBER_SHEET, x: 64, y: 96, w: 32, h: 32 },
  "Emerald Fang": { src: SWORDTEMBER_SHEET, x: 96, y: 96, w: 32, h: 32 },
  "Starfall Stiletto": { src: SWORDTEMBER_SHEET, x: 128, y: 96, w: 32, h: 32 },
  "Crimson Cleaver": { src: SWORDTEMBER_SHEET, x: 0, y: 128, w: 32, h: 32 },
  "Tigerstripe Falchion": { src: SWORDTEMBER_SHEET, x: 32, y: 128, w: 32, h: 32 },
  "Dawnfire Cutlass": { src: SWORDTEMBER_SHEET, x: 64, y: 128, w: 32, h: 32 },
  "Jadecross Broadsword": { src: SWORDTEMBER_SHEET, x: 96, y: 128, w: 32, h: 32 },
  "Chainlink Estoc": { src: SWORDTEMBER_SHEET, x: 128, y: 128, w: 32, h: 32 },
  "Permafrost Greatsword": { src: SWORDTEMBER_SHEET, x: 0, y: 160, w: 32, h: 32 },
  "Mistral Sabre": { src: SWORDTEMBER_SHEET, x: 32, y: 160, w: 32, h: 32 },
  "Tidecaller Blade": { src: SWORDTEMBER_SHEET, x: 64, y: 160, w: 32, h: 32 },
  "Solaris Edge": { src: SWORDTEMBER_SHEET, x: 96, y: 160, w: 32, h: 32 },
  "Infernal Ravager": { src: SWORDTEMBER_SHEET, x: 128, y: 160, w: 32, h: 32 },

  "Steel Battleaxe": { src: AXETOBER_SHEET, x: 0, y: 0, w: 32, h: 32 },
  "Moonlit Hatchet": { src: AXETOBER_SHEET, x: 32, y: 0, w: 32, h: 32 },
  "Obsidian Reaver": { src: AXETOBER_SHEET, x: 64, y: 0, w: 32, h: 32 },
  "Rubyflare Greataxe": { src: AXETOBER_SHEET, x: 96, y: 0, w: 32, h: 32 },
  "Gilded Waraxe": { src: AXETOBER_SHEET, x: 128, y: 0, w: 32, h: 32 },
  "Copperhead Cleaver": { src: AXETOBER_SHEET, x: 160, y: 0, w: 32, h: 32 },
  "Bonecrest Axe": { src: AXETOBER_SHEET, x: 0, y: 32, w: 32, h: 32 },
  "Darkwood Hatchet": { src: AXETOBER_SHEET, x: 32, y: 32, w: 32, h: 32 },
  "Duskforge Halberd": { src: AXETOBER_SHEET, x: 64, y: 32, w: 32, h: 32 },
  "Rosegold Broadaxe": { src: AXETOBER_SHEET, x: 96, y: 32, w: 32, h: 32 },
  "Frostbite Cleaver": { src: AXETOBER_SHEET, x: 128, y: 32, w: 32, h: 32 },
  "Bloodmoon Reaver": { src: AXETOBER_SHEET, x: 160, y: 32, w: 32, h: 32 },
  "Tidebreak Axe": { src: AXETOBER_SHEET, x: 0, y: 64, w: 32, h: 32 },
  "Ironwood Tomahawk": { src: AXETOBER_SHEET, x: 32, y: 64, w: 32, h: 32 },
  "Greystone Broadaxe": { src: AXETOBER_SHEET, x: 64, y: 64, w: 32, h: 32 },
  "Sandstone Hatchet": { src: AXETOBER_SHEET, x: 96, y: 64, w: 32, h: 32 },
  "Crimson Waraxe": { src: AXETOBER_SHEET, x: 128, y: 64, w: 32, h: 32 },
  "Goldscar Halberd": { src: AXETOBER_SHEET, x: 160, y: 64, w: 32, h: 32 },
  "Flamecrest Greataxe": { src: AXETOBER_SHEET, x: 0, y: 96, w: 32, h: 32 },
  "Wrought Iron Chopper": { src: AXETOBER_SHEET, x: 32, y: 96, w: 32, h: 32 },
  "Spectral Cleaver": { src: AXETOBER_SHEET, x: 64, y: 96, w: 32, h: 32 },
  "Bloodrune Axe": { src: AXETOBER_SHEET, x: 96, y: 96, w: 32, h: 32 },
  "Pearlsteel Hatchet": { src: AXETOBER_SHEET, x: 128, y: 96, w: 32, h: 32 },
  "Emberstrike Tomahawk": { src: AXETOBER_SHEET, x: 160, y: 96, w: 32, h: 32 },
  "Nightbloom Reaver": { src: AXETOBER_SHEET, x: 0, y: 128, w: 32, h: 32 },
  "Blackiron Splitter": { src: AXETOBER_SHEET, x: 32, y: 128, w: 32, h: 32 },
  "Verdant Waraxe": { src: AXETOBER_SHEET, x: 64, y: 128, w: 32, h: 32 },
  "Ashen Broadaxe": { src: AXETOBER_SHEET, x: 96, y: 128, w: 32, h: 32 },
  "Prismatic Greataxe": { src: AXETOBER_SHEET, x: 128, y: 128, w: 32, h: 32 },
  "Hellforged Cleaver": { src: AXETOBER_SHEET, x: 160, y: 128, w: 32, h: 32 },
  "Granite Waraxe": { src: AXETOBER_SHEET, x: 0, y: 160, w: 32, h: 32 },
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
    return {
      src: sprite.src,
      backgroundPosition: `-${sprite.x}px -${sprite.y}px`,
      backgroundSize: "auto",
    };
  }

  const manifestPath = MANIFEST_SRC[display];
  if (manifestPath) {
    return { src: manifestPath };
  }

  return { src: "" };
}
