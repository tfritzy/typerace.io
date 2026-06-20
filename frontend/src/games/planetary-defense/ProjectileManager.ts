import { Container, Graphics } from "pixi.js";
import type { GameState } from "./state";

const PROJECTILE_RADIUS = 3;

export class ProjectileManager {
  readonly container: Container;

  private projectileGraphics = new Map<number, Graphics>();

  constructor() {
    this.container = new Container();
  }

  update(state: GameState): void {
    const activeIds = new Set<number>();

    for (const p of state.projectiles) {
      activeIds.add(p.id);
      let g = this.projectileGraphics.get(p.id);
      if (!g) {
        g = new Graphics();
        g.circle(0, 0, PROJECTILE_RADIUS);
        g.fill({ color: 0xfbbf24 });
        this.container.addChild(g);
        this.projectileGraphics.set(p.id, g);
      }
      g.x = p.x;
      g.y = p.y;
    }

    for (const [id, g] of this.projectileGraphics) {
      if (!activeIds.has(id)) {
        g.destroy();
        this.projectileGraphics.delete(id);
      }
    }
  }

  destroy(): void {
    for (const g of this.projectileGraphics.values()) g.destroy();
    this.projectileGraphics.clear();
    this.container.destroy();
  }
}
