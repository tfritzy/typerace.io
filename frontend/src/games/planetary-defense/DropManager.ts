import { Container, Graphics } from "pixi.js";
import type { GameState, DropState } from "./state";
import { DropCategory, GEM_COLORS, GOLD_COLOR, GOLD_LABEL_COLOR, GEM_LABEL_COLORS } from "./dropConfig";
import type { LabelData } from "./EnemyManager";

const GOLD_SIZE = 8;
const GEM_SIZE = 10;

export class DropManager {
  readonly layer: Container;

  labels: LabelData[] = [];

  private displayObjects = new Map<number, Graphics>();
  private activeIds = new Set<number>();

  constructor() {
    this.layer = new Container();
  }

  getLabelColor(drop: DropState): string {
    if (drop.category === DropCategory.Gold) return GOLD_LABEL_COLOR;
    if (drop.gemType !== undefined) return GEM_LABEL_COLORS[drop.gemType];
    return "#ffffff";
  }

  update(state: GameState): void {
    this.activeIds.clear();
    this.labels.length = 0;

    for (const drop of state.drops) {
      this.activeIds.add(drop.id);
      let display = this.displayObjects.get(drop.id);
      if (!display) {
        display = this.createDropVisual(drop);
        this.layer.addChild(display);
        this.displayObjects.set(drop.id, display);
      }
      display.x = drop.x;
      display.y = drop.y;

      this.labels.push({
        id: drop.id,
        word: drop.word,
        typedCount: drop.typedCount,
        x: drop.x,
        y: drop.y - 16,
        color: this.getLabelColor(drop),
      });
    }

    for (const [id, display] of this.displayObjects) {
      if (!this.activeIds.has(id)) {
        display.destroy();
        this.displayObjects.delete(id);
      }
    }
  }

  private createDropVisual(drop: DropState): Graphics {
    const g = new Graphics();

    if (drop.category === DropCategory.Gold) {
      g.circle(0, 0, GOLD_SIZE);
      g.fill({ color: GOLD_COLOR });
      g.stroke({ color: 0xd4a017, width: 2 });
    } else {
      const color = drop.gemType !== undefined ? GEM_COLORS[drop.gemType] : 0xffffff;
      g.moveTo(0, -GEM_SIZE);
      g.lineTo(GEM_SIZE * 0.7, -GEM_SIZE * 0.3);
      g.lineTo(GEM_SIZE * 0.5, GEM_SIZE * 0.6);
      g.lineTo(-GEM_SIZE * 0.5, GEM_SIZE * 0.6);
      g.lineTo(-GEM_SIZE * 0.7, -GEM_SIZE * 0.3);
      g.closePath();
      g.fill({ color });
      g.stroke({ color: 0xffffff, width: 1 });
    }

    return g;
  }

  destroy(): void {
    for (const d of this.displayObjects.values()) d.destroy();
    this.displayObjects.clear();
    this.labels.length = 0;
    this.layer.destroy();
  }
}
