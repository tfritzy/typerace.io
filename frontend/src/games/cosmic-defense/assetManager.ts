import { Assets, type Application, type AssetsManifest, Sprite, type Spritesheet, type Texture } from "pixi.js";
import { ColorPreset, type EntityType, type ProjectileType, getShipEntityIndex } from "./types";
import { applyPaletteSwap } from "../planetary-defense/ships";

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
  private plasmaExplosionSheet_: Spritesheet;
  private shipDeathExplosionSheet_: Spritesheet;
  private iceExplosionSheet_: Spritesheet;
  private hawkExplosionSheet_: Spritesheet;

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
    this.plasmaExplosionSheet_ = loaded["plasma-explosion"] as Spritesheet;
    this.shipDeathExplosionSheet_ = loaded["ship-death-explosion"] as Spritesheet;
    this.iceExplosionSheet_ = loaded["ice-explosion"] as Spritesheet;
    this.hawkExplosionSheet_ = loaded["hawk-explosion"] as Spritesheet;

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

  getPlasmaExplosionTextures(): Texture[] {
    const textures: Texture[] = [];
    for (let i = 0; i < 14; i++) {
      textures.push(this.plasmaExplosionSheet_.textures[`exp-7-${i}`]);
    }
    return textures;
  }

  getShipDeathExplosionTextures(): Texture[] {
    const textures: Texture[] = [];
    for (let i = 0; i < 10; i++) {
      textures.push(this.shipDeathExplosionSheet_.textures[`ship-death-${i}`]);
    }
    return textures;
  }

  getIceExplosionTextures(): Texture[] {
    const textures: Texture[] = [];
    for (let i = 0; i < 12; i++) {
      textures.push(this.iceExplosionSheet_.textures[`ice-exp-${i}`]);
    }
    return textures;
  }

  getHawkExplosionTextures(): Texture[] {
    const textures: Texture[] = [];
    for (let i = 0; i < 9; i++) {
      textures.push(this.hawkExplosionSheet_.textures[`hawk-exp-${i}`]);
    }
    return textures;
  }

  static async load(manifest: AssetsManifest): Promise<AssetManager> {
    const bundle = manifest.bundles[0];
    Assets.addBundle(bundle.name, bundle.assets);
    const loaded = await Assets.loadBundle(bundle.name);
    return new AssetManager(loaded);
  }

  async generateShipPreviews(app: Application, entityTypes: EntityType[]): Promise<Map<EntityType, string>> {
    const previews = new Map<EntityType, string>();
    for (const et of entityTypes) {
      const tex = this.getShipTexture(et, ColorPreset.Preset1);
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5);
      sprite.scale.set(3);
      const img = await app.renderer.extract.image({
        target: sprite,
        format: "png",
        resolution: 2,
      });
      previews.set(et, img.src);
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
    setNearestNeighbor(this.plasmaExplosionSheet_);
    setNearestNeighbor(this.shipDeathExplosionSheet_);
    setNearestNeighbor(this.iceExplosionSheet_);
    setNearestNeighbor(this.hawkExplosionSheet_);
  }
}
