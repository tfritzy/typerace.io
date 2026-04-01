import { Container, Graphics } from "pixi.js";
import type { GameState, RelicSlot } from "./state";
import { getRelicPosition } from "./state";
import { RELIC_CONFIGS } from "./relicConfig";

const RELIC_SIZE = 28;
const CHARGE_DOT_RADIUS = 4;
const CHARGE_DOT_SPACING = 12;
const CHARGE_DOT_OFFSET = RELIC_SIZE / 2 + 10;

export class RelicManager {
  readonly container: Container;

  private relicGraphics = new Map<number, Graphics>();
  private chargeGraphics = new Map<number, Graphics>();

  constructor() {
    this.container = new Container();
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

      this.drawRelic(i, x, y);
      this.drawCharge(i, slot, x, y);
    }
  }

  private drawRelic(index: number, x: number, y: number): void {
    let g = this.relicGraphics.get(index);
    if (!g) {
      g = new Graphics();
      this.container.addChild(g);
      this.relicGraphics.set(index, g);
    }

    g.clear();
    g.rect(
      x - RELIC_SIZE / 2,
      y - RELIC_SIZE / 2,
      RELIC_SIZE,
      RELIC_SIZE
    );
    g.fill({ color: 0x888888 });
    g.stroke({ color: 0xaaaaaa, width: 2 });
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
    const tg = this.relicGraphics.get(index);
    if (tg) {
      tg.destroy();
      this.relicGraphics.delete(index);
    }
    const cg = this.chargeGraphics.get(index);
    if (cg) {
      cg.destroy();
      this.chargeGraphics.delete(index);
    }
  }

  destroy(): void {
    for (const g of this.relicGraphics.values()) g.destroy();
    for (const g of this.chargeGraphics.values()) g.destroy();
    this.relicGraphics.clear();
    this.chargeGraphics.clear();
    this.container.destroy();
  }
}
