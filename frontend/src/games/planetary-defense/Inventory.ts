import {
  Application,
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
const CELL_SIZE = 64;
const CELL_PADDING = 4;
const DEFAULT_GRID_PADDING = 8;
const DEFAULT_BORDER_WIDTH = 3;

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
  drawBorder?: boolean;
}

export interface InventoryItem {
  id: number;
  relicType: RelicType;
  gridX: number;
  gridY: number;
}

interface DragState {
  itemId: number;
  container: Container;
  offsetX: number;
  offsetY: number;
  originalGridX: number;
  originalGridY: number;
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

const allInventories: Inventory[] = [];

export class Inventory {
  readonly container: Container;

  private cols: number;
  private rows: number;
  private gridPadding: number;
  private borderWidth: number;
  private gridOriginX: number;
  private gridOriginY: number;
  private occupied: boolean[][];
  private items: InventoryItem[] = [];
  private itemContainers = new Map<number, Container>();
  private gridBackground: Graphics;
  private highlightGraphics: Graphics;
  private dragState: DragState | null = null;
  private assetManager: AssetManager;
  private app: Application;
  private dragOverlay: Container;
  private nextItemId = 1;

  readonly onItemAdded = createEvent<InventoryItem>();
  readonly onItemRemoved = createEvent<InventoryItem>();
  readonly onExternalDrop =
    createEvent<{ relicType: RelicType; gridX: number; gridY: number }>();

  constructor(
    app: Application,
    assetManager: AssetManager,
    dragOverlay: Container,
    config?: InventoryConfig
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.dragOverlay = dragOverlay;
    this.container = new Container();

    this.cols = config?.cols ?? DEFAULT_COLS;
    this.rows = config?.rows ?? DEFAULT_ROWS;
    const drawBorder = config?.drawBorder ?? true;

    this.gridPadding = drawBorder ? DEFAULT_GRID_PADDING : 0;
    this.borderWidth = drawBorder ? DEFAULT_BORDER_WIDTH : 0;

    const gridInnerWidth = this.cols * CELL_SIZE;
    const gridInnerHeight = this.rows * CELL_SIZE;
    const totalWidth = gridInnerWidth + this.gridPadding * 2 + this.borderWidth * 2;
    const totalHeight = gridInnerHeight + this.gridPadding * 2 + this.borderWidth * 2;

    const defaultX = (CANVAS_WIDTH - totalWidth) / 2;
    const defaultY = CANVAS_HEIGHT - totalHeight - 20;

    this.container.x = config?.x ?? defaultX;
    this.container.y = config?.y ?? defaultY;

    this.gridOriginX = this.gridPadding + this.borderWidth;
    this.gridOriginY = this.gridPadding + this.borderWidth;

    this.occupied = Array.from({ length: this.rows }, () =>
      Array<boolean>(this.cols).fill(false)
    );

    this.gridBackground = new Graphics();
    this.container.addChild(this.gridBackground);

    this.highlightGraphics = new Graphics();
    this.container.addChild(this.highlightGraphics);

    this.drawGrid(drawBorder, totalWidth, totalHeight);
    this.setupDragEvents();

    allInventories.push(this);
  }

  private drawGrid(drawBorder: boolean, totalWidth: number, totalHeight: number): void {
    const g = this.gridBackground;
    g.clear();

    if (drawBorder) {
      g.roundRect(0, 0, totalWidth, totalHeight, 4);
      g.fill({ color: BG_COLOR, alpha: BG_ALPHA });
      g.stroke({ color: BORDER_COLOR, width: this.borderWidth });
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.gridOriginX + c * CELL_SIZE;
        const y = this.gridOriginY + r * CELL_SIZE;
        g.roundRect(x, y, CELL_SIZE, CELL_SIZE, drawBorder ? 0 : 6);
        g.fill({ color: CELL_BG_COLOR, alpha: drawBorder ? 0.5 : 0.85 });
        g.stroke({ color: drawBorder ? CELL_LINE_COLOR : 0x3a3a5e, width: drawBorder ? 1 : 1.5 });
      }
    }
  }

  private setupDragEvents(): void {
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on("pointermove", this.onPointerMove);
    this.app.stage.on("pointerup", this.onPointerUp);
    this.app.stage.on("pointerupoutside", this.onPointerUp);
  }

  private onPointerMove = (e: FederatedPointerEvent): void => {
    if (!this.dragState) return;

    const pos = this.dragOverlay.toLocal(e.global);
    this.dragState.container.x = pos.x - this.dragState.offsetX;
    this.dragState.container.y = pos.y - this.dragState.offsetY;

    this.updateHighlight();
  };

  private getDragCenterGlobal(): { x: number; y: number } {
    const c = this.dragState!.container;
    return this.dragOverlay.toGlobal({
      x: c.x + CELL_SIZE / 2,
      y: c.y + CELL_SIZE / 2,
    });
  }

  private onPointerUp = (): void => {
    if (!this.dragState) return;

    const item = this.items.find((i) => i.id === this.dragState!.itemId)!;
    const { container: dragContainer, originalGridX, originalGridY } =
      this.dragState;

    const centerGlobal = this.getDragCenterGlobal();
    const { col: targetCol, row: targetRow } = this.globalToGrid(centerGlobal.x, centerGlobal.y);

    if (this.canPlace(targetCol, targetRow, item.id)) {
      item.gridX = targetCol;
      item.gridY = targetRow;
      this.finalizeDrop(item, dragContainer);
      this.clearAllHighlights();
      return;
    }

    for (const other of allInventories) {
      if (other === this) continue;
      if (other.handleExternalDrop(item.relicType, centerGlobal.x, centerGlobal.y)) {
        this.removeDraggedItem(item, dragContainer);
        this.clearAllHighlights();
        return;
      }
    }

    item.gridX = originalGridX;
    item.gridY = originalGridY;
    this.finalizeDrop(item, dragContainer);
    this.clearAllHighlights();
  };

  private finalizeDrop(item: InventoryItem, dragContainer: Container): void {
    this.occupied[item.gridY][item.gridX] = true;
    this.dragOverlay.removeChild(dragContainer);
    this.container.addChild(dragContainer);
    this.snapToGrid(dragContainer, item);
    dragContainer.alpha = 1;
    dragContainer.cursor = "grab";
    this.dragState = null;
    this.highlightGraphics.clear();
  }

  private removeDraggedItem(item: InventoryItem, dragContainer: Container): void {
    const idx = this.items.indexOf(item);
    if (idx >= 0) this.items.splice(idx, 1);
    this.dragOverlay.removeChild(dragContainer);
    dragContainer.destroy();
    this.itemContainers.delete(item.id);
    this.onItemRemoved.emit(item);
    this.dragState = null;
    this.highlightGraphics.clear();
  }

  private clearAllHighlights(): void {
    for (const inv of allInventories) {
      inv.highlightGraphics.clear();
    }
  }

  private globalToGrid(globalX: number, globalY: number): { col: number; row: number } {
    const localPos = this.container.toLocal({ x: globalX, y: globalY });
    const col = Math.floor((localPos.x - this.gridOriginX) / CELL_SIZE);
    const row = Math.floor((localPos.y - this.gridOriginY) / CELL_SIZE);
    return { col, row };
  }

  private updateHighlight(): void {
    this.highlightGraphics.clear();
    if (!this.dragState) return;

    const item = this.items.find((i) => i.id === this.dragState!.itemId)!;
    const centerGlobal = this.getDragCenterGlobal();
    const { col: gridCol, row: gridRow } = this.globalToGrid(centerGlobal.x, centerGlobal.y);
    const valid = this.canPlace(gridCol, gridRow, item.id);
    const color = valid ? VALID_COLOR : INVALID_COLOR;

    if (gridCol >= 0 && gridCol < this.cols && gridRow >= 0 && gridRow < this.rows) {
      const x = this.gridOriginX + gridCol * CELL_SIZE;
      const y = this.gridOriginY + gridRow * CELL_SIZE;
      this.highlightGraphics.rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      this.highlightGraphics.fill({ color, alpha: 0.3 });
    }

    for (const other of allInventories) {
      if (other === this) continue;
      other.showDropHighlight(centerGlobal.x, centerGlobal.y);
    }
  }

  showDropHighlight(globalX: number, globalY: number): void {
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

  private canPlace(gridX: number, gridY: number, excludeItemId?: number): boolean {
    if (gridX < 0 || gridY < 0 || gridX >= this.cols || gridY >= this.rows) {
      return false;
    }

    if (this.occupied[gridY][gridX]) {
      if (excludeItemId !== undefined) {
        const occupant = this.items.find(
          (i) => i.gridX === gridX && i.gridY === gridY && i.id !== excludeItemId
        );
        return !occupant;
      }
      return false;
    }

    return true;
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

    const itemId = item.id;
    wrapper.on("pointerdown", (e: FederatedPointerEvent) => {
      this.startDrag(itemId, e);
    });

    return wrapper;
  }

  private startDrag(itemId: number, e: FederatedPointerEvent): void {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return;

    const c = this.itemContainers.get(itemId);
    if (!c) return;

    this.occupied[item.gridY][item.gridX] = false;

    const globalPos = this.container.toGlobal({ x: c.x, y: c.y });
    const overlayPos = this.dragOverlay.toLocal(globalPos);

    this.container.removeChild(c);
    this.dragOverlay.addChild(c);
    c.x = overlayPos.x;
    c.y = overlayPos.y;

    const pointerOverlay = this.dragOverlay.toLocal(e.global);
    const offsetX = pointerOverlay.x - c.x;
    const offsetY = pointerOverlay.y - c.y;

    this.dragState = {
      itemId,
      container: c,
      offsetX,
      offsetY,
      originalGridX: item.gridX,
      originalGridY: item.gridY,
    };

    c.alpha = 0.8;
    c.cursor = "grabbing";
  }

  handleExternalDrop(
    relicType: RelicType,
    globalX: number,
    globalY: number
  ): boolean {
    const { col: gridCol, row: gridRow } = this.globalToGrid(globalX, globalY);

    if (!this.canPlace(gridCol, gridRow)) return false;

    this.addItem(relicType, gridCol, gridRow);
    this.onExternalDrop.emit({ relicType, gridX: gridCol, gridY: gridRow });
    return true;
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
    const idx = allInventories.indexOf(this);
    if (idx >= 0) allInventories.splice(idx, 1);

    this.app.stage.off("pointermove", this.onPointerMove);
    this.app.stage.off("pointerup", this.onPointerUp);
    this.app.stage.off("pointerupoutside", this.onPointerUp);

    for (const c of this.itemContainers.values()) c.destroy();
    this.itemContainers.clear();
    this.gridBackground.destroy();
    this.highlightGraphics.destroy();
    this.container.destroy();
  }
}
