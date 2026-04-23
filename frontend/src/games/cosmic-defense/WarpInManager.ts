import { AnimatedSprite, ColorMatrixFilter, Container, type ColorMatrix } from "pixi.js";
import type { AssetManager } from "./assetManager";

const WARP_IN_SCALE = 2;
const WARP_IN_ANIMATION_SPEED = 0.25;

const BLUE_TINT_MATRIX: ColorMatrix = [
  0, 0, 1, 0, 0,
  0, 1, 0, 0, 0,
  1, 0, 0, 0, 0,
  0, 0, 0, 1, 0,
];

export class WarpInManager {
  readonly layer: Container;
  private assets: AssetManager;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  playAt(x: number, y: number): void {
    const textures = this.assets.getWarpInTextures();
    const sprite = new AnimatedSprite(textures);
    sprite.anchor.set(0.5);
    sprite.scale.set(WARP_IN_SCALE);
    sprite.x = x;
    sprite.y = y;
    sprite.animationSpeed = WARP_IN_ANIMATION_SPEED;
    sprite.loop = false;
    const filter = new ColorMatrixFilter();
    filter.matrix = BLUE_TINT_MATRIX;
    sprite.filters = [filter];
    sprite.onComplete = () => {
      sprite.destroy();
    };
    this.layer.addChild(sprite);
    sprite.play();
  }

  destroy(): void {
    this.layer.destroy();
  }
}
