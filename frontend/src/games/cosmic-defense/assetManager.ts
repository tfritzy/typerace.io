import { Assets, type Application, type AssetsManifest, Sprite, type Spritesheet, type Texture } from "pixi.js";
import { ColorPreset, type EntityType, type ProjectileType, getShipEntityIndex } from "./types";
import { applyPaletteSwap } from "../planetary-defense/ships";
import { SHIP_BLUEPRINTS } from "./shipCatalog";

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
  private spaceships_: Spritesheet;
  private spaceshipsColormap_: Spritesheet;
  private spaceshipsShield_: Spritesheet;
  private colorPresets_: Record<string, Texture>;
  private projectileSheets_: Spritesheet[];
  private explosionSheets_: Spritesheet[];

  constructor(loaded: Record<string, unknown>) {
    const presetAliasValues = Object.values(COLOR_PRESET_ALIASES);

    this.background_ = loaded["background"] as Texture;
    this.planets_ = loaded["planets"] as Spritesheet;
    this.spaceships_ = loaded["spaceships"] as Spritesheet;
    this.spaceshipsColormap_ = loaded["spaceships-colormap"] as Spritesheet;
    this.spaceshipsShield_ = loaded["spaceships-shield"] as Spritesheet;
    this.colorPresets_ = Object.fromEntries(
      presetAliasValues.map((a) => [a, loaded[a] as Texture])
    );
    this.projectileSheets_ = [];
    for (let i = 1; i <= 6; i++) {
      this.projectileSheets_.push(loaded[`projectile-${i}`] as Spritesheet);
    }
    this.explosionSheets_ = [];
    for (let i = 1; i <= 6; i++) {
      this.explosionSheets_.push(loaded[`explosion-${i}`] as Spritesheet);
    }

    this.applyNearestNeighbor();
  }

  get background(): Texture {
    return this.background_;
  }

  get planets(): Spritesheet {
    return this.planets_;
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

  getProjectileTextures(projectileType: ProjectileType): Texture[] {
    const sheet = this.projectileSheets_[projectileType - 1];
    const textures: Texture[] = [];
    for (let i = 0; i < 5; i++) {
      textures.push(sheet.textures[`proj-${projectileType}-${i}`]);
    }
    return textures;
  }

  getExplosionTextures(projectileType: ProjectileType): Texture[] {
    const sheet = this.explosionSheets_[projectileType - 1];
    const textures: Texture[] = [];
    for (let i = 0; i < 3; i++) {
      textures.push(sheet.textures[`exp-${projectileType}-${i}`]);
    }
    return textures;
  }

  static async load(manifest: AssetsManifest): Promise<AssetManager> {
    const bundle = manifest.bundles[0];
    Assets.addBundle(bundle.name, bundle.assets);
    const loaded = await Assets.loadBundle(bundle.name);
    return new AssetManager(loaded);
  }

  async generateShipPreviews(app: Application): Promise<Map<EntityType, string>> {
    const previews = new Map<EntityType, string>();
    for (const bp of SHIP_BLUEPRINTS) {
      const tex = this.getShipTexture(bp.entityType, bp.colorPreset);
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5);
      sprite.scale.set(3);
      const img = await app.renderer.extract.image({
        target: sprite,
        format: "png",
        resolution: 2,
      });
      previews.set(bp.entityType, img.src);
      sprite.destroy();
    }
    return previews;
  }

  private applyNearestNeighbor(): void {
    setTextureNearest(this.background_);
    setNearestNeighbor(this.planets_);
    setNearestNeighbor(this.spaceships_);
    setNearestNeighbor(this.spaceshipsColormap_);
    setNearestNeighbor(this.spaceshipsShield_);
    for (const tex of Object.values(this.colorPresets_)) {
      setTextureNearest(tex);
    }
    for (const sheet of this.projectileSheets_) {
      setNearestNeighbor(sheet);
    }
    for (const sheet of this.explosionSheets_) {
      setNearestNeighbor(sheet);
    }
  }
}
