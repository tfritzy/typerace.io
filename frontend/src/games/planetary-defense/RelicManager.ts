import { Container, Graphics } from "pixi.js";
import type { GameState } from "./state";
import { getRelicPosition } from "./state";
import { RELIC_CONFIGS } from "./relicConfig";

const CHARGE_DOT_RADIUS = 4;
const CHARGE_DOT_SPACING = 12;
const CHARGE_DOT_OFFSET = 42;

export class RelicManager {
  readonly container: Container;

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
        this.removeChargeGraphic(i);
        continue;
      }

      const { x, y } = getRelicPosition(slot);
      this.drawCharge(i, slot, x, y);
    }
  }

  private drawCharge(
    index: number,
    slot: { relic: { type: number; charge: number } | null },
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

  private removeChargeGraphic(index: number): void {
    const cg = this.chargeGraphics.get(index);
    if (cg) {
      cg.destroy();
      this.chargeGraphics.delete(index);
    }
  }

  destroy(): void {
    for (const g of this.chargeGraphics.values()) g.destroy();
    this.chargeGraphics.clear();
    this.container.destroy();
  }
}
