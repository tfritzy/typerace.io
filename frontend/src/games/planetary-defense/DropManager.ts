import { Container, Sprite } from "pixi.js";
import type { GameState, DropState } from "./state";
import { DROP_LABEL_COLOR, DROP_SIZE } from "./dropConfig";
import type { LabelData } from "./EnemyManager";
import { getItemDisplay } from "./itemConfig";
import type { AssetManager } from "./assetManager";

export class DropManager {
  readonly layer: Container;

  labels: LabelData[] = [];

  private displayObjects = new Map<number, Sprite>();
  private activeIds = new Set<number>();
  private assetManager: AssetManager;

  constructor(assetManager: AssetManager) {
    this.layer = new Container();
    this.assetManager = assetManager;
  }

  update(state: GameState): void {
    this.activeIds.clear();
    this.labels.length = 0;

    for (const drop of state.drops) {
      this.activeIds.add(drop.id);
      let display = this.displayObjects.get(drop.id);
      if (!display) {
        display = this.createDropVisual(drop);
        this.layer.addChild(display);
        this.displayObjects.set(drop.id, display);
      }
      display.x = drop.x;
      display.y = drop.y;

      this.labels.push({
        id: drop.id,
        word: drop.word,
        typedCount: drop.typedCount,
        x: drop.x,
        y: drop.y - 16,
        color: DROP_LABEL_COLOR,
      });
    }

    for (const [id, display] of this.displayObjects) {
      if (!this.activeIds.has(id)) {
        display.destroy();
        this.displayObjects.delete(id);
      }
    }
  }

  private createDropVisual(drop: DropState): Sprite {
    const display = getItemDisplay(drop.item.type);
    let texture;
    if ("textureAlias" in display) {
      texture = this.assetManager.getItemTexture(display.textureAlias);
    } else {
      texture = this.assetManager.getRelicTexture(display.spriteSheet, display.frameName);
    }
    texture.source.scaleMode = "nearest";
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    const scale = DROP_SIZE / Math.max(texture.width, texture.height);
    sprite.scale.set(scale);
    return sprite;
  }

  destroy(): void {
    for (const d of this.displayObjects.values()) d.destroy();
    this.displayObjects.clear();
    this.labels.length = 0;
    this.layer.destroy();
  }
}
