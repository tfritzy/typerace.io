import { Container, Graphics } from "pixi.js";
import type { GameState, TowerSlot } from "./state";
import { getTowerPosition } from "./state";
import { TOWER_CONFIGS } from "./towerConfig";

const TOWER_SIZE = 28;
const CHARGE_DOT_RADIUS = 4;
const CHARGE_DOT_SPACING = 12;
const CHARGE_DOT_OFFSET = TOWER_SIZE / 2 + 10;

export class TowerManager {
  readonly container: Container;

  private towerGraphics = new Map<number, Graphics>();
  private chargeGraphics = new Map<number, Graphics>();

  constructor() {
    this.container = new Container();
  }

  update(state: GameState): void {
    this.syncTowers(state);
  }

  private syncTowers(state: GameState): void {
    for (let i = 0; i < state.towerSlots.length; i++) {
      const slot = state.towerSlots[i];
      if (!slot.tower) {
        this.removeTowerGraphic(i);
        continue;
      }

      const { x, y } = getTowerPosition(slot);

      this.drawTower(i, x, y);
      this.drawCharge(i, slot, x, y);
    }
  }

  private drawTower(index: number, x: number, y: number): void {
    let g = this.towerGraphics.get(index);
    if (!g) {
      g = new Graphics();
      this.container.addChild(g);
      this.towerGraphics.set(index, g);
    }

    g.clear();
    g.rect(
      x - TOWER_SIZE / 2,
      y - TOWER_SIZE / 2,
      TOWER_SIZE,
      TOWER_SIZE
    );
    g.fill({ color: 0x888888 });
    g.stroke({ color: 0xaaaaaa, width: 2 });
  }

  private drawCharge(
    index: number,
    slot: TowerSlot,
    towerX: number,
    towerY: number
  ): void {
    if (!slot.tower) return;

    let g = this.chargeGraphics.get(index);
    if (!g) {
      g = new Graphics();
      this.container.addChild(g);
      this.chargeGraphics.set(index, g);
    }

    g.clear();

    const config = TOWER_CONFIGS[slot.tower.type];
    const count = config.charsToFire;

    const totalWidth = (count - 1) * CHARGE_DOT_SPACING;
    const startOffset = -totalWidth / 2;

    for (let d = 0; d < count; d++) {
      const along = startOffset + d * CHARGE_DOT_SPACING;
      const cx = towerX + along;
      const cy = towerY + CHARGE_DOT_OFFSET;

      if (d < slot.tower.charge) {
        g.circle(cx, cy, CHARGE_DOT_RADIUS);
        g.fill({ color: 0x4ade80 });
      } else {
        g.circle(cx, cy, CHARGE_DOT_RADIUS);
        g.fill({ color: 0x333333 });
        g.stroke({ color: 0x555555, width: 1 });
      }
    }
  }

  private removeTowerGraphic(index: number): void {
    const tg = this.towerGraphics.get(index);
    if (tg) {
      tg.destroy();
      this.towerGraphics.delete(index);
    }
    const cg = this.chargeGraphics.get(index);
    if (cg) {
      cg.destroy();
      this.chargeGraphics.delete(index);
    }
  }

  destroy(): void {
    for (const g of this.towerGraphics.values()) g.destroy();
    for (const g of this.chargeGraphics.values()) g.destroy();
    this.towerGraphics.clear();
    this.chargeGraphics.clear();
    this.container.destroy();
  }
}
