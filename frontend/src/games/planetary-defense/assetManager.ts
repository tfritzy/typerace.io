import { Assets, type AssetsManifest, type Spritesheet, type Texture } from "pixi.js";

export interface LoadedAssets {
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
  readonly assets: LoadedAssets;

  private constructor(assets: LoadedAssets) {
    this.assets = assets;
  }

  static async load(
    manifest: AssetsManifest,
    bundleName: string,
    engineAliases: string[],
    asteroidAliases: string[],
    colorPresetAliases: string[]
  ): Promise<AssetManager> {
    const bundle = manifest.bundles[0];
    Assets.addBundle(bundle.name, bundle.assets);
    const raw = await Assets.loadBundle(bundleName);

    const assets: LoadedAssets = {
      background: raw["background"] as Texture,
      planets: raw["planets"] as Spritesheet,
      planetsRing: raw["planets-ring"] as Spritesheet,
      starsParticle: raw["stars-particle"] as Spritesheet,
      spaceships: raw["spaceships"] as Spritesheet,
      spaceshipsColormap: raw["spaceships-colormap"] as Spritesheet,
      engines: Object.fromEntries(
        engineAliases.map((a) => [a, raw[a] as Spritesheet])
      ),
      asteroids: Object.fromEntries(
        asteroidAliases.map((a) => [a, raw[a] as Spritesheet])
      ),
      colorPresets: Object.fromEntries(
        colorPresetAliases.map((a) => [a, raw[a] as Texture])
      ),
    };

    const mgr = new AssetManager(assets);
    mgr.applyNearestNeighbor();
    return mgr;
  }

  private applyNearestNeighbor(): void {
    setTextureNearest(this.assets.background);

    setNearestNeighbor(this.assets.planets);
    setNearestNeighbor(this.assets.planetsRing);
    setNearestNeighbor(this.assets.starsParticle);
    setNearestNeighbor(this.assets.spaceships);
    setNearestNeighbor(this.assets.spaceshipsColormap);

    for (const sheet of Object.values(this.assets.engines)) {
      setNearestNeighbor(sheet);
    }
    for (const sheet of Object.values(this.assets.asteroids)) {
      setNearestNeighbor(sheet);
    }
    for (const tex of Object.values(this.assets.colorPresets)) {
      setTextureNearest(tex);
    }
  }
}
