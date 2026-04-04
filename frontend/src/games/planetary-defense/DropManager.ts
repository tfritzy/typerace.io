import { Container, Graphics } from "pixi.js";
import type { GameState, DropState } from "./state";
import { ItemType, isGem, GEM_COLORS, GOLD_COLOR, DROP_LABEL_COLOR, DROP_SIZE } from "./dropConfig";
import type { LabelData } from "./EnemyManager";

export class DropManager {
  readonly layer: Container;

  labels: LabelData[] = [];

  private displayObjects = new Map<number, Graphics>();
  private activeIds = new Set<number>();

  constructor() {
    this.layer = new Container();
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
        color: DROP_LABEL_COLOR,
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

    let color: number;
    if (drop.itemType === ItemType.Gold) {
      color = GOLD_COLOR;
    } else if (isGem(drop.itemType)) {
      color = GEM_COLORS[drop.itemType] ?? 0xffffff;
    } else {
      color = 0xffffff;
    }

    g.rect(-DROP_SIZE / 2, -DROP_SIZE / 2, DROP_SIZE, DROP_SIZE);
    g.fill({ color });

    return g;
  }

  destroy(): void {
    for (const d of this.displayObjects.values()) d.destroy();
    this.displayObjects.clear();
    this.labels.length = 0;
    this.layer.destroy();
  }
}
