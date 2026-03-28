import { Assets, type AssetsManifest, type Spritesheet, type Texture } from "pixi.js";
import { EngineType, ColorPreset, MeteorType, ShipType } from "./types";
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

const METEOR_ALIASES: Record<MeteorType, string> = {
  [MeteorType.LargeBrown]: "asteroids-big-brown",
  [MeteorType.LargeWhite]: "asteroids-big-white",
  [MeteorType.SmallBrown]: "asteroids-small-brown",
  [MeteorType.SmallWhite]: "asteroids-small-white",
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

  getShipTexture(shipType: ShipType, colorPreset: ColorPreset): Texture {
    const shipFrame = `ship-${shipType}`;
    const cmFrame = `cm-${shipType}`;
    const presetAlias = COLOR_PRESET_ALIASES[colorPreset];
    return applyPaletteSwap(
      this.spaceships_.textures[shipFrame],
      this.spaceshipsColormap_.textures[cmFrame],
      this.colorPresets_[presetAlias]
    );
  }

  getShieldTexture(shipType: ShipType): Texture {
    return this.spaceshipsShield_.textures[`shield-${shipType}`];
  }

  getEngineFrames(engineType: EngineType): Texture[] {
    const alias = ENGINE_ALIASES[engineType];
    const sheet = this.engines_[alias];
    return sheet.animations[alias];
  }

  getMeteorTexture(meteorType: MeteorType, variant: number): Texture {
    const alias = METEOR_ALIASES[meteorType];
    const sheet = this.asteroids_[alias];
    const textures = Object.values(sheet.textures);
    return textures[variant % textures.length];
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
  }
}
