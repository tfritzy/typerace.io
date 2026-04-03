import type { Inventory } from "./Inventory";

export class InventoryManager {
  private inventories: Inventory[] = [];
  private unsubscribers: (() => void)[] = [];

  register(inventory: Inventory): void {
    this.inventories.push(inventory);

    this.unsubscribers.push(
      inventory.onDragMove.subscribe(({ globalX, globalY }) => {
        for (const other of this.inventories) {
          if (other === inventory) continue;
          other.showDropHighlight(globalX, globalY);
        }
      })
    );

    this.unsubscribers.push(
      inventory.onDragEnd.subscribe(() => {
        for (const inv of this.inventories) {
          inv.clearHighlight();
        }
      })
    );

    this.unsubscribers.push(
      inventory.onDropFailed.subscribe((event) => {
        for (const other of this.inventories) {
          if (other === inventory) continue;
          if (other.handleExternalDrop(event.relicType, event.globalX, event.globalY)) {
            event.handled = true;
            break;
          }
        }
      })
    );
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) unsub();
    this.unsubscribers = [];
    this.inventories = [];
  }
}
