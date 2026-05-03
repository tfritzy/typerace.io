import { Container, Graphics } from "pixi.js";
import type { GameState } from "./state";

const SQUARE_SIZE = 4;
const PROJECTILE_COLOR = 0xffd700;

export class ProjectileManager {
  readonly layer: Container;
  private displayObjects = new Map<number, Graphics>();
  private activeIds = new Set<number>();

  constructor() {
    this.layer = new Container();
  }

  update(state: GameState): void {
    this.activeIds.clear();

    for (const proj of state.projectiles) {
      this.activeIds.add(proj.id);
      let g = this.displayObjects.get(proj.id);
      if (!g) {
        g = new Graphics();
        g.rect(-SQUARE_SIZE / 2, -SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
        g.fill({ color: PROJECTILE_COLOR });
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
