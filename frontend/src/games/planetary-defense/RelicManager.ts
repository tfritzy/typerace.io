import { Container, Graphics, Sprite, type Spritesheet } from "pixi.js";
import type { GameState, RelicSlot } from "./state";
import { getRelicPosition } from "./state";
import { getRelicConfig } from "./relicConfig";

const RELIC_SPRITE_SCALE = 2.5;
const CHARGE_DOT_RADIUS = 4;
const CHARGE_DOT_SPACING = 12;
const CHARGE_DOT_OFFSET = 24;

export class RelicManager {
  readonly container: Container;

  private relicSprites = new Map<number, Sprite>();
  private chargeGraphics = new Map<number, Graphics>();
  private itemsSheet: Spritesheet;

  constructor(itemsSheet: Spritesheet) {
    this.container = new Container();
    this.itemsSheet = itemsSheet;
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
      this.drawRelic(i, slot, x, y);
      this.drawCharge(i, slot, x, y);
    }
  }

  private drawRelic(index: number, slot: RelicSlot, x: number, y: number): void {
    let sprite = this.relicSprites.get(index);
    const config = getRelicConfig(slot.relic!.type);
    const frameName = `item-${config.spriteIndex}`;

    if (!sprite) {
      const texture = this.itemsSheet.textures[frameName];
      if (!texture) return;
      sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.scale.set(RELIC_SPRITE_SCALE);
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

    const config = getRelicConfig(slot.relic.type);
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
