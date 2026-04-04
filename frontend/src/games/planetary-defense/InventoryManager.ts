import {
  Application,
  Container,
  type FederatedPointerEvent,
} from "pixi.js";
import { Inventory, CELL_SIZE, buildItemCell } from "./Inventory";
import type { InventoryItem } from "./Inventory";
import type { AssetManager } from "./assetManager";

interface DragState {
  source: Inventory;
  itemId: number;
  slot: InventoryItem;
  originalCol: number;
  originalRow: number;
  ghost: Container;
  offsetX: number;
  offsetY: number;
}

export class InventoryManager {
  private app: Application;
  private assetManager: AssetManager;
  private inventories: Inventory[] = [];
  private unsubscribers: (() => void)[] = [];
  private dragState: DragState | null = null;

  constructor(app: Application, assetManager: AssetManager) {
    this.app = app;
    this.assetManager = assetManager;

    app.stage.eventMode = "static";
    app.stage.hitArea = app.screen;
    app.stage.on("pointermove", this.onPointerMove);
    app.stage.on("pointerup", this.onPointerUp);
    app.stage.on("pointerupoutside", this.onPointerUp);
  }

  register(inventory: Inventory): void {
    this.inventories.push(inventory);

    this.unsubscribers.push(
      inventory.onDragStart.subscribe(({ inventory: source, item, event }) => {
        this.startDrag(source, item, event);
      })
    );
  }

  private startDrag(
    source: Inventory,
    slot: InventoryItem,
    e: FederatedPointerEvent
  ): void {
    if (this.dragState) return;
    if (!slot.item) return;

    const itemGlobal = source.getItemGlobalPosition(slot);
    source.beginItemDrag(slot.id);

    const ghost = this.createGhost(slot);
    ghost.x = itemGlobal.x;
    ghost.y = itemGlobal.y;
    this.app.stage.addChild(ghost);

    this.dragState = {
      source,
      itemId: slot.id,
      slot,
      originalCol: slot.gridX,
      originalRow: slot.gridY,
      ghost,
      offsetX: e.global.x - itemGlobal.x,
      offsetY: e.global.y - itemGlobal.y,
    };
  }

  private onPointerMove = (e: FederatedPointerEvent): void => {
    if (!this.dragState) return;

    const { ghost, offsetX, offsetY } = this.dragState;
    ghost.x = e.global.x - offsetX;
    ghost.y = e.global.y - offsetY;

    for (const inv of this.inventories) {
      inv.showHighlight(e.global.x, e.global.y);
    }
  };

  private onPointerUp = (e: FederatedPointerEvent): void => {
    if (!this.dragState) return;

    const { source, itemId, slot, ghost } = this.dragState;

    for (let i = this.inventories.length - 1; i >= 0; i--) {
      const inv = this.inventories[i];
      const { col, row } = inv.globalToGrid(e.global.x, e.global.y);

      if (!inv.canPlace(col, row)) continue;

      if (inv === source) {
        source.endItemDrag(itemId, col, row);
      } else if (slot.item) {
        source.removeItem(itemId);
        inv.addItem(slot.item, col, row);
      }

      this.finishDrag(ghost);
      return;
    }

    source.cancelItemDrag(itemId);
    this.finishDrag(ghost);
  };

  private finishDrag(ghost: Container): void {
    ghost.destroy();
    this.dragState = null;

    for (const inv of this.inventories) {
      inv.clearHighlight();
    }
  }

  private createGhost(slot: InventoryItem): Container {
    if (!slot.item) return new Container();
    const wrapper = buildItemCell(slot.item, this.assetManager);
    wrapper.alpha = 0.8;
    return wrapper;
  }

  destroy(): void {
    this.app.stage.off("pointermove", this.onPointerMove);
    this.app.stage.off("pointerup", this.onPointerUp);
    this.app.stage.off("pointerupoutside", this.onPointerUp);

    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    this.inventories = [];

    if (this.dragState) {
      this.dragState.ghost.destroy();
      this.dragState = null;
    }
  }
}
