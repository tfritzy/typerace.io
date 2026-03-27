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

interface RawAssets {
  background: Texture;
  planets: Spritesheet;
  planetsRing: Spritesheet;
  starsParticle: Spritesheet;
  spaceships: Spritesheet;
  spaceshipsColormap: Spritesheet;
  engines: Record<string, Spritesheet>;
  asteroids: Record<string, Spritesheet>;
  colorPresets: Record<string, Texture>;
}

function setNearestNeighbor(sheet: Spritesheet): void {
  sheet.textureSource.style.scaleMode = "nearest";
}

function setTextureNearest(tex: Texture): void {
  tex.source.style.scaleMode = "nearest";
}

export class AssetManager {
  private raw: RawAssets;

  private constructor(raw: RawAssets) {
    this.raw = raw;
  }

  get background(): Texture {
    return this.raw.background;
  }

  get planets(): Spritesheet {
    return this.raw.planets;
  }

  get starsParticle(): Spritesheet {
    return this.raw.starsParticle;
  }

  getShipTexture(shipType: ShipType, colorPreset: ColorPreset): Texture {
    const shipFrame = `ship-${shipType}`;
    const cmFrame = `cm-${shipType}`;
    const presetAlias = COLOR_PRESET_ALIASES[colorPreset];
    return applyPaletteSwap(
      this.raw.spaceships.textures[shipFrame],
      this.raw.spaceshipsColormap.textures[cmFrame],
      this.raw.colorPresets[presetAlias]
    );
  }

  getEngineFrames(engineType: EngineType): Texture[] {
    const alias = ENGINE_ALIASES[engineType];
    const sheet = this.raw.engines[alias];
    return sheet.animations[alias];
  }

  getMeteorTexture(meteorType: MeteorType, variant: number): Texture {
    const alias = METEOR_ALIASES[meteorType];
    const sheet = this.raw.asteroids[alias];
    const textures = Object.values(sheet.textures);
    return textures[variant % textures.length];
  }

  static async load(manifest: AssetsManifest): Promise<AssetManager> {
    const bundle = manifest.bundles[0];
    Assets.addBundle(bundle.name, bundle.assets);
    const loaded = await Assets.loadBundle(bundle.name);

    const engineAliasValues = Object.values(ENGINE_ALIASES);
    const meteorAliasValues = Object.values(METEOR_ALIASES);
    const presetAliasValues = Object.values(COLOR_PRESET_ALIASES);

    const raw: RawAssets = {
      background: loaded["background"] as Texture,
      planets: loaded["planets"] as Spritesheet,
      planetsRing: loaded["planets-ring"] as Spritesheet,
      starsParticle: loaded["stars-particle"] as Spritesheet,
      spaceships: loaded["spaceships"] as Spritesheet,
      spaceshipsColormap: loaded["spaceships-colormap"] as Spritesheet,
      engines: Object.fromEntries(
        engineAliasValues.map((a) => [a, loaded[a] as Spritesheet])
      ),
      asteroids: Object.fromEntries(
        meteorAliasValues.map((a) => [a, loaded[a] as Spritesheet])
      ),
      colorPresets: Object.fromEntries(
        presetAliasValues.map((a) => [a, loaded[a] as Texture])
      ),
    };

    const mgr = new AssetManager(raw);
    mgr.applyNearestNeighbor();
    return mgr;
  }

  private applyNearestNeighbor(): void {
    setTextureNearest(this.raw.background);

    setNearestNeighbor(this.raw.planets);
    setNearestNeighbor(this.raw.planetsRing);
    setNearestNeighbor(this.raw.starsParticle);
    setNearestNeighbor(this.raw.spaceships);
    setNearestNeighbor(this.raw.spaceshipsColormap);

    for (const sheet of Object.values(this.raw.engines)) {
      setNearestNeighbor(sheet);
    }
    for (const sheet of Object.values(this.raw.asteroids)) {
      setNearestNeighbor(sheet);
    }
    for (const tex of Object.values(this.raw.colorPresets)) {
      setTextureNearest(tex);
    }
  }
}
