import { type Item, getItemConfig } from "./itemConfig";

export const CELL_SIZE = 64;
export const GRID_PADDING = 8;
export const BORDER_WIDTH = 3;

export interface InventoryItem {
  id: number;
  item: Item | null;
  gridX: number;
  gridY: number;
}

export type InventorySlot =
  | "player"
  | "merchant"
  | `weapon-${number}`;

export class InventoryState {
  readonly slot: InventorySlot;
  readonly cols: number;
  readonly rows: number;
  private items: InventoryItem[] = [];
  private occupied: boolean[][];
  private nextItemId = 1;
  private listeners = new Set<() => void>();
  private addListeners: Array<(item: InventoryItem) => void> = [];
  private removeListeners: Array<(item: InventoryItem) => void> = [];

  constructor(slot: InventorySlot, cols: number, rows: number) {
    this.slot = slot;
    this.cols = cols;
    this.rows = rows;
    this.occupied = Array.from({ length: rows }, () =>
      Array<boolean>(cols).fill(false)
    );
  }

  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  onItemAdded(fn: (item: InventoryItem) => void): () => void {
    this.addListeners.push(fn);
    return () => {
      const idx = this.addListeners.indexOf(fn);
      if (idx >= 0) this.addListeners.splice(idx, 1);
    };
  }

  onItemRemoved(fn: (item: InventoryItem) => void): () => void {
    this.removeListeners.push(fn);
    return () => {
      const idx = this.removeListeners.indexOf(fn);
      if (idx >= 0) this.removeListeners.splice(idx, 1);
    };
  }

  private notify(): void {
    for (const fn of this.listeners) fn();
  }

  private notifyAdded(item: InventoryItem): void {
    for (const fn of this.addListeners) fn(item);
  }

  private notifyRemoved(item: InventoryItem): void {
    for (const fn of this.removeListeners) fn(item);
  }

  getItems(): InventoryItem[] {
    return this.items;
  }

  canPlace(col: number, row: number): boolean {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return false;
    return !this.occupied[row][col];
  }

  addItem(item: Item, gridX: number, gridY: number): InventoryItem | null {
    if (!this.canPlace(gridX, gridY)) return null;

    const slot: InventoryItem = {
      id: this.nextItemId++,
      item,
      gridX,
      gridY,
    };

    this.items.push(slot);
    this.occupied[gridY][gridX] = true;
    this.notifyAdded(slot);
    this.notify();
    return slot;
  }

  addToFirstEmpty(item: Item): InventoryItem | null {
    const config = getItemConfig(item.type);
    if (config.stackable) {
      const existing = this.items.find(
        (s) => s.item && s.item.type === item.type
      );
      if (existing && existing.item) {
        const maxStack = config.maxStack ?? Infinity;
        const spaceLeft = maxStack - existing.item.amount;
        if (spaceLeft >= item.amount) {
          existing.item.amount += item.amount;
          this.notify();
          return existing;
        } else if (spaceLeft > 0) {
          existing.item.amount = maxStack;
          this.notify();
          const overflow: Item = { type: item.type, amount: item.amount - spaceLeft };
          return this.addToFirstEmpty(overflow);
        }
      }
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (!this.occupied[r][c]) {
          return this.addItem(item, c, r);
        }
      }
    }
    return null;
  }

  removeItem(itemId: number): InventoryItem | null {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index < 0) return null;

    const slot = this.items[index];
    this.occupied[slot.gridY][slot.gridX] = false;
    this.items.splice(index, 1);
    this.notifyRemoved(slot);
    this.notify();
    return slot;
  }

  moveItem(itemId: number, newCol: number, newRow: number): boolean {
    const slot = this.items.find((i) => i.id === itemId);
    if (!slot) return false;
    if (!this.canPlace(newCol, newRow)) return false;

    this.occupied[slot.gridY][slot.gridX] = false;
    slot.gridX = newCol;
    slot.gridY = newRow;
    this.occupied[newRow][newCol] = true;
    this.notify();
    return true;
  }

  beginItemDrag(itemId: number): InventoryItem | null {
    const slot = this.items.find((i) => i.id === itemId);
    if (!slot) return null;
    this.occupied[slot.gridY][slot.gridX] = false;
    return slot;
  }

  endItemDrag(itemId: number, col: number, row: number): boolean {
    const slot = this.items.find((i) => i.id === itemId);
    if (!slot) return false;
    if (!this.canPlace(col, row)) return false;

    slot.gridX = col;
    slot.gridY = row;
    this.occupied[row][col] = true;
    this.notify();
    return true;
  }

  cancelItemDrag(itemId: number): void {
    const slot = this.items.find((i) => i.id === itemId);
    if (!slot) return;
    this.occupied[slot.gridY][slot.gridX] = true;
    this.notify();
  }

  getGoldAmount(): number {
    let total = 0;
    for (const slot of this.items) {
      if (slot.item && slot.item.type === "Gold") {
        total += slot.item.amount;
      }
    }
    return total;
  }

  deductGold(amount: number): boolean {
    if (this.getGoldAmount() < amount) return false;
    let remaining = amount;
    for (let i = this.items.length - 1; i >= 0 && remaining > 0; i--) {
      const slot = this.items[i];
      if (!slot.item || slot.item.type !== "Gold") continue;
      if (slot.item.amount <= remaining) {
        remaining -= slot.item.amount;
        this.removeItem(slot.id);
      } else {
        slot.item.amount -= remaining;
        remaining = 0;
        this.notify();
      }
    }
    return true;
  }

  destroy(): void {
    this.listeners.clear();
    this.addListeners.length = 0;
    this.removeListeners.length = 0;
    this.items.length = 0;
  }
}
