import { Container, NineSliceSprite, type Texture } from "pixi.js";

const DEFAULT_SCALE = 4;
const DEFAULT_LEFT = 5;
const DEFAULT_TOP = 5;
const DEFAULT_RIGHT = 5;
const DEFAULT_BOTTOM = 5;

export interface NineSlicePanelOptions {
  texture: Texture;
  width: number;
  height: number;
  scale?: number;
  leftWidth?: number;
  topHeight?: number;
  rightWidth?: number;
  bottomHeight?: number;
}

export class NineSlicePanel {
  readonly container: Container;
  private sprite: NineSliceSprite;
  private panelScale: number;

  constructor(options: NineSlicePanelOptions) {
    this.panelScale = options.scale ?? DEFAULT_SCALE;

    const left = options.leftWidth ?? DEFAULT_LEFT;
    const top = options.topHeight ?? DEFAULT_TOP;
    const right = options.rightWidth ?? DEFAULT_RIGHT;
    const bottom = options.bottomHeight ?? DEFAULT_BOTTOM;

    options.texture.source.scaleMode = "nearest";

    this.sprite = new NineSliceSprite({
      texture: options.texture,
      leftWidth: left,
      topHeight: top,
      rightWidth: right,
      bottomHeight: bottom,
    });

    this.sprite.width = options.width / this.panelScale;
    this.sprite.height = options.height / this.panelScale;

    this.container = new Container();
    this.container.addChild(this.sprite);
    this.container.scale.set(this.panelScale);
  }

  resize(width: number, height: number): void {
    this.sprite.width = width / this.panelScale;
    this.sprite.height = height / this.panelScale;
  }

  get width(): number {
    return this.sprite.width * this.panelScale;
  }

  get height(): number {
    return this.sprite.height * this.panelScale;
  }

  get borderThickness(): number {
    return DEFAULT_LEFT * this.panelScale;
  }

  destroy(): void {
    this.container.destroy();
  }
}
