import {
  Container,
  Graphics,
  Sprite,
  type FederatedPointerEvent,
} from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { RelicType, RELIC_DISPLAY } from "./relicConfig";
import type { AssetManager } from "./assetManager";

const DEFAULT_COLS = 10;
const DEFAULT_ROWS = 5;
export const CELL_SIZE = 64;
const CELL_PADDING = 4;
export const GRID_PADDING = 8;
export const BORDER_WIDTH = 3;

const BG_COLOR = 0x111122;
const BG_ALPHA = 0.92;
const BORDER_COLOR = 0x8b7355;
const CELL_LINE_COLOR = 0x2a2a3e;
const CELL_BG_COLOR = 0x15152a;
const ITEM_BG_COLOR = 0x252545;
const ITEM_BORDER_COLOR = 0x4a4a7e;
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
  relicType: RelicType;
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

  getItemGlobalPosition(item: InventoryItem): { x: number; y: number } {
    return this.container.toGlobal({
      x: this.gridOriginX + item.gridX * CELL_SIZE,
      y: this.gridOriginY + item.gridY * CELL_SIZE,
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
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return null;

    this.occupied[item.gridY][item.gridX] = false;
    const c = this.itemContainers.get(itemId);
    if (c) c.visible = false;

    return item;
  }

  endItemDrag(itemId: number, col: number, row: number): boolean {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return false;

    if (!this.canPlace(col, row)) return false;

    item.gridX = col;
    item.gridY = row;
    this.occupied[row][col] = true;

    const c = this.itemContainers.get(itemId);
    if (c) {
      c.visible = true;
      this.snapToGrid(c, item);
    }

    return true;
  }

  cancelItemDrag(itemId: number): void {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return;

    this.occupied[item.gridY][item.gridX] = true;
    const c = this.itemContainers.get(itemId);
    if (c) c.visible = true;
  }

  private snapToGrid(c: Container, item: InventoryItem): void {
    c.x = this.gridOriginX + item.gridX * CELL_SIZE;
    c.y = this.gridOriginY + item.gridY * CELL_SIZE;
  }

  addItem(relicType: RelicType, gridX: number, gridY: number): InventoryItem | null {
    if (!this.canPlace(gridX, gridY)) return null;

    const item: InventoryItem = {
      id: this.nextItemId++,
      relicType,
      gridX,
      gridY,
    };

    this.items.push(item);
    this.occupied[gridY][gridX] = true;

    const itemContainer = this.createItemVisual(item);
    this.itemContainers.set(item.id, itemContainer);
    this.container.addChild(itemContainer);
    this.snapToGrid(itemContainer, item);

    this.onItemAdded.emit(item);
    return item;
  }

  removeItem(itemId: number): InventoryItem | null {
    const index = this.items.findIndex((i) => i.id === itemId);
    if (index < 0) return null;

    const item = this.items[index];
    this.occupied[item.gridY][item.gridX] = false;
    this.items.splice(index, 1);

    const c = this.itemContainers.get(itemId);
    if (c) {
      c.destroy();
      this.itemContainers.delete(itemId);
    }

    this.onItemRemoved.emit(item);
    return item;
  }

  getItems(): InventoryItem[] {
    return this.items;
  }

  private createItemVisual(item: InventoryItem): Container {
    const wrapper = new Container();
    wrapper.eventMode = "static";
    wrapper.cursor = "grab";

    const bg = new Graphics();
    bg.roundRect(2, 2, CELL_SIZE - 4, CELL_SIZE - 4, 3);
    bg.fill({ color: ITEM_BG_COLOR, alpha: 0.8 });
    bg.stroke({ color: ITEM_BORDER_COLOR, width: 1 });
    wrapper.addChild(bg);

    const display = RELIC_DISPLAY[item.relicType];
    const texture = this.assetManager.getRelicTexture(
      display.spriteSheet,
      display.frameName
    );
    texture.source.scaleMode = "nearest";
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);

    const spriteSize = CELL_SIZE - CELL_PADDING * 2;
    sprite.width = spriteSize;
    sprite.height = spriteSize;
    sprite.x = CELL_SIZE / 2;
    sprite.y = CELL_SIZE / 2;
    wrapper.addChild(sprite);

    wrapper.on("pointerdown", (e: FederatedPointerEvent) => {
      this.onDragStart.emit({ inventory: this, item, event: e });
    });

    return wrapper;
  }

  populateTestData(): void {
    this.addItem(RelicType.StarfallStiletto, 0, 0);
    this.addItem(RelicType.BloodthornDirk, 1, 0);
    this.addItem(RelicType.EmbercrestBlade, 2, 0);
    this.addItem(RelicType.BriarthornSaber, 3, 0);
    this.addItem(RelicType.TwinflareCrossblades, 4, 0);
    this.addItem(RelicType.CloudveilLongsword, 5, 0);
    this.addItem(RelicType.SteelBattleaxe, 6, 0);
    this.addItem(RelicType.MoltenZweihander, 7, 0);
    this.addItem(RelicType.MoonlitHatchet, 8, 0);
    this.addItem(RelicType.FrostfangClaymore, 9, 0);
  }

  destroy(): void {
    for (const c of this.itemContainers.values()) c.destroy();
    this.itemContainers.clear();
    this.gridBackground.destroy();
    this.highlightGraphics.destroy();
    this.container.destroy();
  }
}
