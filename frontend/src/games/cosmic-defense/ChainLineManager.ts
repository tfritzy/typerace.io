import { Container, Graphics } from "pixi.js";
import type { GameState } from "./state";

const CHAIN_LINE_DURATION = 0.5;
const CHAIN_LINE_COLOR = 0x44aaff;
const CHAIN_LINE_ALPHA = 0.35;
const CHAIN_LINE_WIDTH = 2;

export class ChainLineManager {
  readonly layer: Container;

  private displayObjects = new Map<number, Graphics>();
  private activeIds = new Set<number>();

  constructor() {
    this.layer = new Container();
  }

  update(state: GameState): void {
    this.activeIds.clear();

    for (const line of state.chainLines) {
      this.activeIds.add(line.id);
      let g = this.displayObjects.get(line.id);
      if (!g) {
        g = new Graphics();
        this.layer.addChild(g);
        this.displayObjects.set(line.id, g);
      }

      const age = state.time.time - line.time;
      const alpha = CHAIN_LINE_ALPHA * Math.max(0, 1 - age / CHAIN_LINE_DURATION);

      g.clear();
      g.moveTo(line.x1, line.y1);
      g.lineTo(line.x2, line.y2);
      g.stroke({ width: CHAIN_LINE_WIDTH, color: CHAIN_LINE_COLOR, alpha });
    }

    for (const [id, g] of this.displayObjects) {
      if (!this.activeIds.has(id)) {
        g.destroy();
        this.displayObjects.delete(id);
      }
    }
  }

  destroy(): void {
    for (const g of this.displayObjects.values()) g.destroy();
    this.displayObjects.clear();
    this.layer.destroy();
  }
}
