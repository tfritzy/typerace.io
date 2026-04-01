import { Container, Graphics, Sprite } from "pixi.js";
import type { GameState, RelicSlot } from "./state";
import { getRelicPosition } from "./state";
import { RELIC_CONFIGS, RELIC_DISPLAY } from "./relicConfig";
import type { AssetManager } from "./assetManager";

const RELIC_SIZE = 28;
const CHARGE_DOT_RADIUS = 4;
const CHARGE_DOT_SPACING = 12;
const CHARGE_DOT_OFFSET = RELIC_SIZE / 2 + 10;

export class RelicManager {
  readonly container: Container;

  private relicSprites = new Map<number, Sprite>();
  private chargeGraphics = new Map<number, Graphics>();
  private assetManager: AssetManager;

  constructor(assetManager: AssetManager) {
    this.container = new Container();
    this.assetManager = assetManager;
  }

  update(state: GameState): void {
    this.syncRelics(state);
  }

  private syncRelics(state: GameState): void {
    for (let i = 0; i < state.relicSlots.length; i++) {
      const slot = state.relicSlots[i];
      if (!slot.relic) {
        this.removeRelicGraphic(i);
        continue;
      }

      const { x, y } = getRelicPosition(slot);

      this.drawRelic(i, x, y, slot);
      this.drawCharge(i, slot, x, y);
    }
  }

  private drawRelic(index: number, x: number, y: number, slot: RelicSlot): void {
    let sprite = this.relicSprites.get(index);
    if (!sprite) {
      const display = RELIC_DISPLAY[slot.relic!.type];
      const texture = this.assetManager.getRelicTexture(display.spriteSheet, display.frameName);
      sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.width = RELIC_SIZE;
      sprite.height = RELIC_SIZE;
      this.container.addChild(sprite);
      this.relicSprites.set(index, sprite);
    }

    sprite.x = x;
    sprite.y = y;
  }

  private drawCharge(
    index: number,
    slot: RelicSlot,
    relicX: number,
    relicY: number
  ): void {
    if (!slot.relic) return;

    let g = this.chargeGraphics.get(index);
    if (!g) {
      g = new Graphics();
      this.container.addChild(g);
      this.chargeGraphics.set(index, g);
    }

    g.clear();

    const config = RELIC_CONFIGS[slot.relic.type];
    const count = config.charsToFire;

    const totalWidth = (count - 1) * CHARGE_DOT_SPACING;
    const startOffset = -totalWidth / 2;

    for (let d = 0; d < count; d++) {
      const along = startOffset + d * CHARGE_DOT_SPACING;
      const cx = relicX + along;
      const cy = relicY + CHARGE_DOT_OFFSET;

      if (d < slot.relic.charge) {
        g.circle(cx, cy, CHARGE_DOT_RADIUS);
        g.fill({ color: 0x4ade80 });
      } else {
        g.circle(cx, cy, CHARGE_DOT_RADIUS);
        g.fill({ color: 0x333333 });
        g.stroke({ color: 0x555555, width: 1 });
      }
    }
  }

  private removeRelicGraphic(index: number): void {
    const sprite = this.relicSprites.get(index);
    if (sprite) {
      sprite.destroy();
      this.relicSprites.delete(index);
    }
    const cg = this.chargeGraphics.get(index);
    if (cg) {
      cg.destroy();
      this.chargeGraphics.delete(index);
    }
  }

  destroy(): void {
    for (const s of this.relicSprites.values()) s.destroy();
    for (const g of this.chargeGraphics.values()) g.destroy();
    this.relicSprites.clear();
    this.chargeGraphics.clear();
    this.container.destroy();
  }
}
