import { Container, Graphics } from "pixi.js";
import type { GameState } from "./state";

export class ProjectileManager {
  readonly layer: Container;

  private displayObjects = new Map<number, Graphics>();
  private activeIds = new Set<number>();

  constructor() {
    this.layer = new Container();
  }

  update(state: GameState): void {
    this.activeIds.clear();

    for (const proj of state.flyingProjectiles) {
      this.activeIds.add(proj.id);
      let g = this.displayObjects.get(proj.id);
      if (!g) {
        g = new Graphics();
        g.circle(0, 0, proj.radius);
        g.fill({ color: proj.color });
        g.circle(0, 0, proj.radius + 1);
        g.stroke({ color: 0xffffff, width: 1, alpha: 0.4 });
        this.layer.addChild(g);
        this.displayObjects.set(proj.id, g);
      }
      g.x = proj.x;
      g.y = proj.y;
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
