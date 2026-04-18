import { Container, Graphics } from "pixi.js";
import type { GameState } from "./state";

const BEAM_DURATION = 0.15;

export class LaserBeamManager {
  readonly layer: Container;

  private displayObjects = new Map<number, Graphics>();
  private activeIds = new Set<number>();

  constructor() {
    this.layer = new Container();
  }

  update(state: GameState): void {
    this.activeIds.clear();

    for (const beam of state.laserBeams) {
      this.activeIds.add(beam.id);
      let g = this.displayObjects.get(beam.id);
      if (!g) {
        g = new Graphics();
        this.layer.addChild(g);
        this.displayObjects.set(beam.id, g);
      }

      const age = state.time.time - beam.time;
      const alpha = Math.max(0, 1 - age / BEAM_DURATION);

      g.clear();
      g.moveTo(beam.x1, beam.y1);
      g.lineTo(beam.x2, beam.y2);
      g.stroke({ width: 2, color: 0x89b4fa, alpha });
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
