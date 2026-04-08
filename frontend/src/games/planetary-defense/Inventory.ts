import {
  Container,
  Graphics,
  Sprite,
  Text,
  type FederatedPointerEvent,
} from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT_FAMILY } from "./constants";
import { type Item, getItemConfig, getItemDisplay } from "./itemConfig";
import { RelicType } from "./relicConfig";
import type { AssetManager } from "./assetManager";

const DEFAULT_COLS = 10;
const DEFAULT_ROWS = 2;
export const CELL_SIZE = 64;
const CELL_PADDING = 4;
export const GRID_PADDING = 8;
export const BORDER_WIDTH = 3;

const BG_COLOR = 0x111122;
const BG_ALPHA = 0.92;
const BORDER_COLOR = 0x8b7355;
const CELL_LINE_COLOR = 0x2a2a3e;
const CELL_BG_COLOR = 0x15152a;
export const ITEM_BG_COLOR = 0x252545;
export const ITEM_BORDER_COLOR = 0x4a4a7e;
const VALID_COLOR = 0x4ade80;
const INVALID_COLOR = 0xef4444;

export interface InventoryConfig {
  cols?: number;
  rows?: number;
  x?: number;
  y?: number;
}

export interface InventoryItem {
  id: number;
  item: Item | null;
  gridX: number;
  gridY: number;
}

function createEvent<T>() {
  const listeners: Array<(data: T) => void> = [];
  return {
    subscribe: (fn: (data: T) => void) => {
      listeners.push(fn);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },
    emit: (data: T) => listeners.forEach((fn) => fn(data)),
  };
}

export function buildItemCell(item: Item, assetManager: AssetManager): Container {
  const wrapper = new Container();

  const bg = new Graphics();
  bg.roundRect(2, 2, CELL_SIZE - 4, CELL_SIZE - 4, 3);
  bg.fill({ color: ITEM_BG_COLOR, alpha: 0.8 });
  bg.stroke({ color: ITEM_BORDER_COLOR, width: 1 });
  wrapper.addChild(bg);

  const cx = CELL_SIZE / 2;
  const cy = CELL_SIZE / 2;

  const config = getItemConfig(item.type);
  const texture = assetManager.getItemTexture(getItemDisplay(item.type));
  texture.source.scaleMode = "nearest";
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);

  const spriteSize = CELL_SIZE - CELL_PADDING * 2;
  sprite.width = spriteSize;
  sprite.height = spriteSize;
  sprite.x = cx;
  sprite.y = cy;
  wrapper.addChild(sprite);

  if (config.stackable && item.amount > 1) {
    const label = new Text({
      text: `${item.amount}`,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 10,
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 2 },
      },
    });
    label.anchor.set(1, 1);
    label.x = CELL_SIZE - 6;
    label.y = CELL_SIZE - 4;
    wrapper.addChild(label);
  }

  if (item.price != null) {
    const priceBg = new Graphics();
    priceBg.roundRect(0, 0, CELL_SIZE - 4, 16, 3);
    priceBg.fill({ color: 0x000000, alpha: 0.8 });

    const priceLabel = new Text({
      text: `${item.price}g`,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 8,
        fill: 0xffd700,
      },
    });
    priceLabel.x = 4;
    priceLabel.y = 2;

    const priceContainer = new Container();
    priceContainer.addChild(priceBg);
    priceContainer.addChild(priceLabel);
    priceContainer.x = 2;
    priceContainer.y = CELL_SIZE - 18;
    wrapper.addChild(priceContainer);
  }

  return wrapper;
}

export class Inventory {
  readonly container: Container;

  private cols: number;
  private rows: number;
  private gridOriginX: number;
  private gridOriginY: number;
  private occupied: boolean[][];
  private items: InventoryItem[] = [];
  private itemContainers = new Map<number, Container>();
  private gridBackground: Graphics;
  private highlightGraphics: Graphics;
  private assetManager: AssetManager;
  private nextItemId = 1;

  readonly onItemAdded = createEvent<InventoryItem>();
  readonly onItemRemoved = createEvent<InventoryItem>();
  readonly onDragStart = createEvent<{
    inventory: Inventory;
    item: InventoryItem;
    event: FederatedPointerEvent;
  }>();
  readonly onItemHover = createEvent<{
    inventory: Inventory;
    item: InventoryItem;
    event: FederatedPointerEvent;
  }>();
  readonly onItemHoverEnd = createEvent<{ inventory: Inventory }>();

  constructor(assetManager: AssetManager, config?: InventoryConfig) {
    this.assetManager = assetManager;
    this.container = new Container();

    this.cols = config?.cols ?? DEFAULT_COLS;
    this.rows = config?.rows ?? DEFAULT_ROWS;

    const gridInnerWidth = this.cols * CELL_SIZE;
    const gridInnerHeight = this.rows * CELL_SIZE;
    const totalWidth = gridInnerWidth + GRID_PADDING * 2 + BORDER_WIDTH * 2;
    const totalHeight = gridInnerHeight + GRID_PADDING * 2 + BORDER_WIDTH * 2;

    const defaultX = (CANVAS_WIDTH - totalWidth) / 2;
    const defaultY = CANVAS_HEIGHT - totalHeight - 20;

    this.container.x = config?.x ?? defaultX;
    this.container.y = config?.y ?? defaultY;

    this.gridOriginX = GRID_PADDING + BORDER_WIDTH;
    this.gridOriginY = GRID_PADDING + BORDER_WIDTH;

    this.occupied = Array.from({ length: this.rows }, () =>
      Array<boolean>(this.cols).fill(false)
    );

    this.gridBackground = new Graphics();
    this.container.addChild(this.gridBackground);

    this.highlightGraphics = new Graphics();
    this.container.addChild(this.highlightGraphics);

    this.drawGrid(totalWidth, totalHeight);
  }

  private drawGrid(totalWidth: number, totalHeight: number): void {
    const g = this.gridBackground;
    g.clear();

    g.roundRect(0, 0, totalWidth, totalHeight, 4);
    g.fill({ color: BG_COLOR, alpha: BG_ALPHA });
    g.stroke({ color: BORDER_COLOR, width: BORDER_WIDTH });

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.gridOriginX + c * CELL_SIZE;
        const y = this.gridOriginY + r * CELL_SIZE;
        g.rect(x, y, CELL_SIZE, CELL_SIZE);
        g.fill({ color: CELL_BG_COLOR, alpha: 0.5 });
        g.stroke({ color: CELL_LINE_COLOR, width: 1 });
      }
    }
  }

  globalToGrid(globalX: number, globalY: number): { col: number; row: number } {
    const localPos = this.container.toLocal({ x: globalX, y: globalY });
    const col = Math.floor((localPos.x - this.gridOriginX) / CELL_SIZE);
    const row = Math.floor((localPos.y - this.gridOriginY) / CELL_SIZE);
    return { col, row };
  }

  canPlace(col: number, row: number): boolean {
    if (col < 0 || row < 0 || col >= this.cols || row >= this.rows) {
      return false;
    }

    return !this.occupied[row][col];
  }

  getItemGlobalPosition(slot: InventoryItem): { x: number; y: number } {
    return this.container.toGlobal({
      x: this.gridOriginX + slot.gridX * CELL_SIZE,
      y: this.gridOriginY + slot.gridY * CELL_SIZE,
    });
  }

  showHighlight(globalX: number, globalY: number): void {
    this.highlightGraphics.clear();
    const { col, row } = this.globalToGrid(globalX, globalY);

    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;

    const valid = this.canPlace(col, row);
    const color = valid ? VALID_COLOR : INVALID_COLOR;
    const x = this.gridOriginX + col * CELL_SIZE;
    const y = this.gridOriginY + row * CELL_SIZE;
    this.highlightGraphics.rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    this.highlightGraphics.fill({ color, alpha: 0.3 });
  }

  clearHighlight(): void {
    this.highlightGraphics.clear();
  }

  beginItemDrag(itemId: number): InventoryItem | null {
    const slot = this.items.find((i) => i.id === itemId);
    if (!slot) return null;

    this.occupied[slot.gridY][slot.gridX] = false;
    const c = this.itemContainers.get(itemId);
    if (c) c.visible = false;

    return slot;
  }

  endItemDrag(itemId: number, col: number, row: number): boolean {
    const slot = this.items.find((i) => i.id === itemId);
    if (!slot) return false;

    if (!this.canPlace(col, row)) return false;

    slot.gridX = col;
    slot.gridY = row;
    this.occupied[row][col] = true;

    const c = this.itemContainers.get(itemId);
    if (c) {
      c.visible = true;
      this.snapToGrid(c, slot);
    }

    return true;
  }

  cancelItemDrag(itemId: number): void {
    const slot = this.items.find((i) => i.id === itemId);
    if (!slot) return;

    this.occupied[slot.gridY][slot.gridX] = true;
    const c = this.itemContainers.get(itemId);
    if (c) c.visible = true;
  }

  private snapToGrid(c: Container, slot: InventoryItem): void {
    c.x = this.gridOriginX + slot.gridX * CELL_SIZE;
    c.y = this.gridOriginY + slot.gridY * CELL_SIZE;
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

    const itemContainer = this.createItemVisual(slot);
    this.itemContainers.set(slot.id, itemContainer);
    this.container.addChild(itemContainer);
    this.snapToGrid(itemContainer, slot);

    this.onItemAdded.emit(slot);
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
          this.refreshItemVisual(existing);
          return existing;
        } else if (spaceLeft > 0) {
          existing.item.amount = maxStack;
          this.refreshItemVisual(existing);
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

  private refreshItemVisual(slot: InventoryItem): void {
    const existing = this.itemContainers.get(slot.id);
    if (existing) {
      existing.destroy();
      this.itemContainers.delete(slot.id);
    }
    const newContainer = this.createItemVisual(slot);
    this.itemContainers.set(slot.id, newContainer);
    this.container.addChild(newContainer);
    this.snapToGrid(newContainer, slot);
  }

  removeItem(itemId: number): InventoryItem | null {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index < 0) return null;

    const slot = this.items[index];
    this.occupied[slot.gridY][slot.gridX] = false;
    this.items.splice(index, 1);

    const c = this.itemContainers.get(itemId);
    if (c) {
      c.destroy();
      this.itemContainers.delete(itemId);
    }

    this.onItemRemoved.emit(slot);
    return slot;
  }

  getItems(): InventoryItem[] {
    return this.items;
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
        this.refreshItemVisual(slot);
      }
    }
    return true;
  }

  private createItemVisual(slot: InventoryItem): Container {
    if (!slot.item) return new Container();

    const wrapper = buildItemCell(slot.item, this.assetManager);
    wrapper.eventMode = "static";
    wrapper.cursor = "grab";

    wrapper.on("pointerdown", (e: FederatedPointerEvent) => {
      this.onDragStart.emit({ inventory: this, item: slot, event: e });
    });

    wrapper.on("pointerover", (e: FederatedPointerEvent) => {
      this.onItemHover.emit({ inventory: this, item: slot, event: e });
    });

    wrapper.on("pointerout", () => {
      this.onItemHoverEnd.emit({ inventory: this });
    });

    return wrapper;
  }

  populateTestData(): void {
    this.addItem({ type: RelicType.StarfallStiletto, amount: 1 }, 0, 0);
    this.addItem({ type: RelicType.BloodthornDirk, amount: 1 }, 1, 0);
    this.addItem({ type: RelicType.EmbercrestBlade, amount: 1 }, 2, 0);
    this.addItem({ type: RelicType.BriarthornSaber, amount: 1 }, 3, 0);
    this.addItem({ type: RelicType.TwinflareCrossblades, amount: 1 }, 4, 0);
    this.addItem({ type: RelicType.CloudveilLongsword, amount: 1 }, 5, 0);
    this.addItem({ type: RelicType.SteelBattleaxe, amount: 1 }, 6, 0);
    this.addItem({ type: RelicType.MoltenZweihander, amount: 1 }, 7, 0);
    this.addItem({ type: RelicType.MoonlitHatchet, amount: 1 }, 8, 0);
    this.addItem({ type: RelicType.FrostfangClaymore, amount: 1 }, 9, 0);
  }

  destroy(): void {
    for (const c of this.itemContainers.values()) c.destroy();
    this.itemContainers.clear();
    this.gridBackground.destroy();
    this.highlightGraphics.destroy();
    this.container.destroy();
  }
}
