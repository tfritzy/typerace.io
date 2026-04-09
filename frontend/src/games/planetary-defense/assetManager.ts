import { Assets, type AssetsManifest, type Spritesheet, type Texture } from "pixi.js";
import {
  EngineType, ColorPreset,
  type EntityType, getShipEntityIndex,
} from "./types";
import { applyPaletteSwap } from "./ships";

const ENGINE_ALIASES: Record<EngineType, string> = {
  [EngineType.Engine1Big]: "engine-1-big",
  [EngineType.Engine1Small]: "engine-1-small",
  [EngineType.Engine2Big]: "engine-2-big",
  [EngineType.Engine2Small]: "engine-2-small",
  [EngineType.Engine3Big]: "engine-3-big",
  [EngineType.Engine3Small]: "engine-3-small",
  [EngineType.Engine4Big]: "engine-4-big",
  [EngineType.Engine4Small]: "engine-4-small",
};

const METEOR_ALIASES: Partial<Record<EntityType, string>> = {
  MeteorLargeBrown: "asteroids-big-brown",
  MeteorLargeWhite: "asteroids-big-white",
  MeteorSmallBrown: "asteroids-small-brown",
  MeteorSmallWhite: "asteroids-small-white",
};

const COLOR_PRESET_ALIASES: Record<ColorPreset, string> = {
  [ColorPreset.Preset1]: "color-preset-1",
  [ColorPreset.Preset2]: "color-preset-2",
  [ColorPreset.Preset3]: "color-preset-3",
  [ColorPreset.Preset4]: "color-preset-4",
};

function setNearestNeighbor(sheet: Spritesheet): void {
  sheet.textureSource.style.scaleMode = "nearest";
}

function setTextureNearest(tex: Texture): void {
  tex.source.style.scaleMode = "nearest";
}

export class AssetManager {
  private background_: Texture;
  private planets_: Spritesheet;
  private planetsRing_: Spritesheet;
  private starsParticle_: Spritesheet;
  private spaceships_: Spritesheet;
  private spaceshipsColormap_: Spritesheet;
  private spaceshipsShield_: Spritesheet;
  private engines_: Record<string, Spritesheet>;
  private asteroids_: Record<string, Spritesheet>;
  private colorPresets_: Record<string, Texture>;
  private itemTextures_: Record<string, Texture>;

  constructor(loaded: Record<string, unknown>) {
    const engineAliasValues = Object.values(ENGINE_ALIASES);
    const meteorAliasValues = Object.values(METEOR_ALIASES);
    const presetAliasValues = Object.values(COLOR_PRESET_ALIASES);

    this.background_ = loaded["background"] as Texture;
    this.planets_ = loaded["planets"] as Spritesheet;
    this.planetsRing_ = loaded["planets-ring"] as Spritesheet;
    this.starsParticle_ = loaded["stars-particle"] as Spritesheet;
    this.spaceships_ = loaded["spaceships"] as Spritesheet;
    this.spaceshipsColormap_ = loaded["spaceships-colormap"] as Spritesheet;
    this.spaceshipsShield_ = loaded["spaceships-shield"] as Spritesheet;
    this.engines_ = Object.fromEntries(
      engineAliasValues.map((a) => [a, loaded[a] as Spritesheet])
    );
    this.asteroids_ = Object.fromEntries(
      meteorAliasValues.map((a) => [a, loaded[a] as Spritesheet])
    );
    this.colorPresets_ = Object.fromEntries(
      presetAliasValues.map((a) => [a, loaded[a] as Texture])
    );

    const swordtember = loaded["swordtember"] as Spritesheet;
    const axetober = loaded["axetober"] as Spritesheet;

    this.itemTextures_ = {
      "Embercrest Blade": swordtember.textures["Embercrest Blade"],
      "Briarthorn Saber": swordtember.textures["Briarthorn Saber"],
      "Ravenplume Edge": swordtember.textures["Ravenplume Edge"],
      "Rubyguard Greatsword": swordtember.textures["Rubyguard Greatsword"],
      "Sunfire Scimitar": swordtember.textures["Sunfire Scimitar"],
      "Cloudveil Longsword": swordtember.textures["Cloudveil Longsword"],
      "Voidthorn Blade": swordtember.textures["Voidthorn Blade"],
      "Gilded Plumeblade": swordtember.textures["Gilded Plumeblade"],
      "Glacial Crusader": swordtember.textures["Glacial Crusader"],
      "Bloodthorn Dirk": swordtember.textures["Bloodthorn Dirk"],
      "Twinflare Crossblades": swordtember.textures["Twinflare Crossblades"],
      "Molten Zweihander": swordtember.textures["Molten Zweihander"],
      "Frostfang Claymore": swordtember.textures["Frostfang Claymore"],
      "Sporespark Glaive": swordtember.textures["Sporespark Glaive"],
      "Azure Crescent": swordtember.textures["Azure Crescent"],
      "Rosevine Rapier": swordtember.textures["Rosevine Rapier"],
      "Crystalbreak Saber": swordtember.textures["Crystalbreak Saber"],
      "Cinderstone Blade": swordtember.textures["Cinderstone Blade"],
      "Emerald Fang": swordtember.textures["Emerald Fang"],
      "Starfall Stiletto": swordtember.textures["Starfall Stiletto"],
      "Crimson Cleaver": swordtember.textures["Crimson Cleaver"],
      "Tigerstripe Falchion": swordtember.textures["Tigerstripe Falchion"],
      "Dawnfire Cutlass": swordtember.textures["Dawnfire Cutlass"],
      "Jadecross Broadsword": swordtember.textures["Jadecross Broadsword"],
      "Chainlink Estoc": swordtember.textures["Chainlink Estoc"],
      "Permafrost Greatsword": swordtember.textures["Permafrost Greatsword"],
      "Mistral Sabre": swordtember.textures["Mistral Sabre"],
      "Tidecaller Blade": swordtember.textures["Tidecaller Blade"],
      "Solaris Edge": swordtember.textures["Solaris Edge"],
      "Infernal Ravager": swordtember.textures["Infernal Ravager"],
      "Steel Battleaxe": axetober.textures["Steel Battleaxe"],
      "Moonlit Hatchet": axetober.textures["Moonlit Hatchet"],
      "Obsidian Reaver": axetober.textures["Obsidian Reaver"],
      "Rubyflare Greataxe": axetober.textures["Rubyflare Greataxe"],
      "Gilded Waraxe": axetober.textures["Gilded Waraxe"],
      "Copperhead Cleaver": axetober.textures["Copperhead Cleaver"],
      "Bonecrest Axe": axetober.textures["Bonecrest Axe"],
      "Darkwood Hatchet": axetober.textures["Darkwood Hatchet"],
      "Duskforge Halberd": axetober.textures["Duskforge Halberd"],
      "Rosegold Broadaxe": axetober.textures["Rosegold Broadaxe"],
      "Frostbite Cleaver": axetober.textures["Frostbite Cleaver"],
      "Bloodmoon Reaver": axetober.textures["Bloodmoon Reaver"],
      "Tidebreak Axe": axetober.textures["Tidebreak Axe"],
      "Ironwood Tomahawk": axetober.textures["Ironwood Tomahawk"],
      "Greystone Broadaxe": axetober.textures["Greystone Broadaxe"],
      "Sandstone Hatchet": axetober.textures["Sandstone Hatchet"],
      "Crimson Waraxe": axetober.textures["Crimson Waraxe"],
      "Goldscar Halberd": axetober.textures["Goldscar Halberd"],
      "Flamecrest Greataxe": axetober.textures["Flamecrest Greataxe"],
      "Wrought Iron Chopper": axetober.textures["Wrought Iron Chopper"],
      "Spectral Cleaver": axetober.textures["Spectral Cleaver"],
      "Bloodrune Axe": axetober.textures["Bloodrune Axe"],
      "Pearlsteel Hatchet": axetober.textures["Pearlsteel Hatchet"],
      "Emberstrike Tomahawk": axetober.textures["Emberstrike Tomahawk"],
      "Nightbloom Reaver": axetober.textures["Nightbloom Reaver"],
      "Blackiron Splitter": axetober.textures["Blackiron Splitter"],
      "Verdant Waraxe": axetober.textures["Verdant Waraxe"],
      "Ashen Broadaxe": axetober.textures["Ashen Broadaxe"],
      "Prismatic Greataxe": axetober.textures["Prismatic Greataxe"],
      "Hellforged Cleaver": axetober.textures["Hellforged Cleaver"],
      "Granite Waraxe": axetober.textures["Granite Waraxe"],
      "topaz-0": loaded["topaz-0"] as Texture,
      "topaz-1": loaded["topaz-1"] as Texture,
      "topaz-2": loaded["topaz-2"] as Texture,
      "topaz-3": loaded["topaz-3"] as Texture,
      "ruby-0": loaded["ruby-0"] as Texture,
      "ruby-1": loaded["ruby-1"] as Texture,
      "ruby-2": loaded["ruby-2"] as Texture,
      "ruby-3": loaded["ruby-3"] as Texture,
      "emerald-0": loaded["emerald-0"] as Texture,
      "emerald-1": loaded["emerald-1"] as Texture,
      "emerald-2": loaded["emerald-2"] as Texture,
      "emerald-3": loaded["emerald-3"] as Texture,
      "sapphire-0": loaded["sapphire-0"] as Texture,
      "sapphire-1": loaded["sapphire-1"] as Texture,
      "sapphire-2": loaded["sapphire-2"] as Texture,
      "sapphire-3": loaded["sapphire-3"] as Texture,
      "amethyst-0": loaded["amethyst-0"] as Texture,
      "amethyst-1": loaded["amethyst-1"] as Texture,
      "amethyst-2": loaded["amethyst-2"] as Texture,
      "amethyst-3": loaded["amethyst-3"] as Texture,
      "diamond-0": loaded["diamond-0"] as Texture,
      "diamond-1": loaded["diamond-1"] as Texture,
      "diamond-2": loaded["diamond-2"] as Texture,
      "diamond-3": loaded["diamond-3"] as Texture,
      "coin-1": loaded["coin-1"] as Texture,
    };

    this.applyNearestNeighbor();
  }

  get background(): Texture {
    return this.background_;
  }

  get planets(): Spritesheet {
    return this.planets_;
  }

  get starsParticle(): Spritesheet {
    return this.starsParticle_;
  }

  getShipTexture(entityType: EntityType, colorPreset: ColorPreset): Texture {
    const frameIndex = getShipEntityIndex(entityType);
    const shipFrame = `ship-${frameIndex}`;
    const cmFrame = `cm-${frameIndex}`;
    const presetAlias = COLOR_PRESET_ALIASES[colorPreset];
    return applyPaletteSwap(
      this.spaceships_.textures[shipFrame],
      this.spaceshipsColormap_.textures[cmFrame],
      this.colorPresets_[presetAlias]
    );
  }

  getShieldTexture(entityType: EntityType): Texture {
    const frameIndex = getShipEntityIndex(entityType);
    return this.spaceshipsShield_.textures[`shield-${frameIndex}`];
  }

  getEngineFrames(engineType: EngineType): Texture[] {
    const alias = ENGINE_ALIASES[engineType];
    const sheet = this.engines_[alias];
    return sheet.animations[alias];
  }

  getMeteorTexture(entityType: EntityType, variant: number): Texture {
    const alias = METEOR_ALIASES[entityType]!;
    const sheet = this.asteroids_[alias];
    const textures = Object.values(sheet.textures);
    return textures[variant % textures.length];
  }

  getItemTexture(alias: string): Texture {
    return this.itemTextures_[alias];
  }

  static async load(manifest: AssetsManifest): Promise<AssetManager> {
    const bundle = manifest.bundles[0];
    Assets.addBundle(bundle.name, bundle.assets);
    const loaded = await Assets.loadBundle(bundle.name);
    return new AssetManager(loaded);
  }

  private applyNearestNeighbor(): void {
    setTextureNearest(this.background_);

    setNearestNeighbor(this.planets_);
    setNearestNeighbor(this.planetsRing_);
    setNearestNeighbor(this.starsParticle_);
    setNearestNeighbor(this.spaceships_);
    setNearestNeighbor(this.spaceshipsColormap_);
    setNearestNeighbor(this.spaceshipsShield_);

    for (const sheet of Object.values(this.engines_)) {
      setNearestNeighbor(sheet);
    }
    for (const sheet of Object.values(this.asteroids_)) {
      setNearestNeighbor(sheet);
    }
    for (const tex of Object.values(this.colorPresets_)) {
      setTextureNearest(tex);
    }
    for (const tex of Object.values(this.itemTextures_)) {
      setTextureNearest(tex);
    }
  }
}
