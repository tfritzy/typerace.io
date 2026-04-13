import { Container, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { PLANET_X, PLANET_Y } from "./state";
import type { ShipBlueprint } from "./shipCatalog";

const COL_SPACING = 130;
const ROW_SPACING = 110;
const HALF_COL = COL_SPACING / 2;
const PLANET_EXCLUSION = 170;
const MAX_X = CANVAS_WIDTH / 2;
const POINT_RADIUS = 12;
const POINT_COLOR = 0x788cc8;
const POINT_ALPHA = 0.35;
const POINT_HOVER_ALPHA = 0.7;
const MARGIN = 70;

export interface PlacementSlot {
  index: number;
  x: number;
  y: number;
  occupant: ShipBlueprint | null;
}

export class PlacementPoints {
  readonly layer: Container;
  private slots: PlacementSlot[] = [];
  private pointGraphics: Map<number, Graphics> = new Map();
  private onSlotClicked: ((slot: PlacementSlot) => void) | null = null;

  constructor() {
    this.layer = new Container();
    this.layer.visible = false;
    this.generateSlots();
  }

  private generateSlots(): void {
    let index = 0;
    let row = 0;
    let y = MARGIN;

    while (y < CANVAS_HEIGHT - MARGIN) {
      const isOddRow = row % 2 === 1;
      const offsetX = isOddRow ? HALF_COL : 0;
      let x = MARGIN + offsetX;

      while (x <= MAX_X) {
        const dx = x - PLANET_X;
        const dy = y - PLANET_Y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > PLANET_EXCLUSION) {
          this.slots.push({ index, x, y, occupant: null });
          index++;
        }

        x += COL_SPACING;
      }

      row++;
      y += ROW_SPACING;
    }
  }

  show(): void {
    this.layer.visible = true;
    this.rebuildGraphics();
  }

  hide(): void {
    this.layer.visible = false;
    this.clearGraphics();
  }

  private clearGraphics(): void {
    for (const g of this.pointGraphics.values()) {
      g.destroy();
    }
    this.pointGraphics.clear();
  }

  private rebuildGraphics(): void {
    this.clearGraphics();

    for (const slot of this.slots) {
      if (slot.occupant) continue;

      const g = new Graphics();
      g.circle(0, 0, POINT_RADIUS);
      g.fill({ color: POINT_COLOR, alpha: POINT_ALPHA });
      g.x = slot.x;
      g.y = slot.y;
      g.eventMode = "static";
      g.cursor = "pointer";
      g.hitArea = { contains: (px: number, py: number) => px * px + py * py <= POINT_RADIUS * POINT_RADIUS * 4 };

      g.on("pointerenter", () => {
        g.clear();
        g.circle(0, 0, POINT_RADIUS);
        g.fill({ color: POINT_COLOR, alpha: POINT_HOVER_ALPHA });
      });
      g.on("pointerleave", () => {
        g.clear();
        g.circle(0, 0, POINT_RADIUS);
        g.fill({ color: POINT_COLOR, alpha: POINT_ALPHA });
      });
      g.on("pointerdown", () => {
        this.onSlotClicked?.(slot);
      });

      this.layer.addChild(g);
      this.pointGraphics.set(slot.index, g);
    }
  }

  placeShip(slotIndex: number, blueprint: ShipBlueprint): void {
    const slot = this.slots.find((s) => s.index === slotIndex);
    if (!slot) return;
    slot.occupant = blueprint;

    const g = this.pointGraphics.get(slotIndex);
    if (g) {
      g.destroy();
      this.pointGraphics.delete(slotIndex);
    }
  }

  getSlot(index: number): PlacementSlot | undefined {
    return this.slots.find((s) => s.index === index);
  }

  onPointClicked(cb: (slot: PlacementSlot) => void): void {
    this.onSlotClicked = cb;
  }

  destroy(): void {
    this.clearGraphics();
    this.layer.destroy();
  }
}
