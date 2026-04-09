import { type Item, type ItemType, getItemConfig, createItem } from "./itemConfig";

export type ItemFilter = (itemType: ItemType) => boolean;

export class InventoryState {
  readonly cols: number;
  readonly rows: number;
  readonly acceptsItem: ItemFilter;
  private grid: (Item | null)[][];
  private listeners = new Set<() => void>();
  private addListeners: Array<(item: Item) => void> = [];
  private removeListeners: Array<(item: Item) => void> = [];

  constructor(cols: number, rows: number, acceptsItem?: ItemFilter) {
    this.cols = cols;
    this.rows = rows;
    this.acceptsItem = acceptsItem ?? (() => true);
    this.grid = Array.from({ length: rows }, () =>
      Array<Item | null>(cols).fill(null)
    );
  }

  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  onItemAdded(fn: (item: Item) => void): () => void {
    this.addListeners.push(fn);
    return () => {
      const idx = this.addListeners.indexOf(fn);
      if (idx >= 0) this.addListeners.splice(idx, 1);
    };
  }

  onItemRemoved(fn: (item: Item) => void): () => void {
    this.removeListeners.push(fn);
    return () => {
      const idx = this.removeListeners.indexOf(fn);
      if (idx >= 0) this.removeListeners.splice(idx, 1);
    };
  }

  private notify(): void {
    for (const fn of this.listeners) fn();
  }

  private notifyAdded(item: Item): void {
    for (const fn of this.addListeners) fn(item);
  }

  private notifyRemoved(item: Item): void {
    for (const fn of this.removeListeners) fn(item);
  }

  getItem(col: number, row: number): Item | null {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return null;
    return this.grid[row][col];
  }

  canPlace(col: number, row: number): boolean {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return false;
    return this.grid[row][col] === null;
  }

  addItem(item: Item, col: number, row: number): boolean {
    if (!this.canPlace(col, row)) return false;
    if (!this.acceptsItem(item.type)) return false;
    this.grid[row][col] = item;
    this.notifyAdded(item);
    this.notify();
    return true;
  }

  addToFirstEmpty(item: Item): boolean {
    if (!this.acceptsItem(item.type)) return false;
    const config = getItemConfig(item.type);
    if (config.stackable) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const existing = this.grid[r][c];
          if (existing && existing.type === item.type) {
            const maxStack = config.maxStack ?? Infinity;
            const spaceLeft = maxStack - existing.amount;
            if (spaceLeft >= item.amount) {
              existing.amount += item.amount;
              this.notify();
              return true;
            } else if (spaceLeft > 0) {
              existing.amount = maxStack;
              this.notify();
              return this.addToFirstEmpty(
                createItem(item.type, item.amount - spaceLeft, item.price)
              );
            }
          }
        }
      }
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === null) {
          return this.addItem(item, c, r);
        }
      }
    }
    return false;
  }

  removeAt(col: number, row: number): Item | null {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) return null;
    const item = this.grid[row][col];
    if (!item) return null;
    this.grid[row][col] = null;
    this.notifyRemoved(item);
    this.notify();
    return item;
  }

  getGoldAmount(): number {
    let total = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const item = this.grid[r][c];
        if (item && item.type === "Gold") {
          total += item.amount;
        }
      }
    }
    return total;
  }

  deductGold(amount: number): boolean {
    if (this.getGoldAmount() < amount) return false;
    let remaining = amount;
    for (let r = this.rows - 1; r >= 0 && remaining > 0; r--) {
      for (let c = this.cols - 1; c >= 0 && remaining > 0; c--) {
        const item = this.grid[r][c];
        if (!item || item.type !== "Gold") continue;
        if (item.amount <= remaining) {
          remaining -= item.amount;
          this.removeAt(c, r);
        } else {
          item.amount -= remaining;
          remaining = 0;
          this.notify();
        }
      }
    }
    return true;
  }

  destroy(): void {
    this.listeners.clear();
    this.addListeners.length = 0;
    this.removeListeners.length = 0;
  }
}
