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

const GRID_COLS = 10;
const GRID_ROWS = 3;
const CELL_SIZE = 64;
const CELL_PADDING = 4;
const GRID_PADDING = 8;
const BORDER_WIDTH = 3;

const GRID_INNER_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_INNER_HEIGHT = GRID_ROWS * CELL_SIZE;
const GRID_TOTAL_WIDTH = GRID_INNER_WIDTH + GRID_PADDING * 2 + BORDER_WIDTH * 2;
const GRID_TOTAL_HEIGHT =
  GRID_INNER_HEIGHT + GRID_PADDING * 2 + BORDER_WIDTH * 2;

const INVENTORY_X = (CANVAS_WIDTH - GRID_TOTAL_WIDTH) / 2;
const INVENTORY_Y = CANVAS_HEIGHT - GRID_TOTAL_HEIGHT - 20;

const BG_COLOR = 0x111122;
const BG_ALPHA = 0.92;
const BORDER_COLOR = 0x8b7355;
const CELL_LINE_COLOR = 0x2a2a3e;
const CELL_BG_COLOR = 0x15152a;
const ITEM_BG_COLOR = 0x252545;
const ITEM_BORDER_COLOR = 0x4a4a7e;
const VALID_COLOR = 0x4ade80;
const INVALID_COLOR = 0xef4444;

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

export class Inventory {
  readonly container: Container;

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
  private nextItemId = 1;

  readonly onItemAdded = createEvent<InventoryItem>();
  readonly onItemRemoved = createEvent<InventoryItem>();
  readonly onExternalDrop =
    createEvent<{ relicType: RelicType; gridX: number; gridY: number }>();

  constructor(app: Application, assetManager: AssetManager) {
    this.app = app;
    this.assetManager = assetManager;
    this.container = new Container();
    this.container.x = INVENTORY_X;
    this.container.y = INVENTORY_Y;

    this.gridOriginX = GRID_PADDING + BORDER_WIDTH;
    this.gridOriginY = GRID_PADDING + BORDER_WIDTH;

    this.occupied = Array.from({ length: GRID_ROWS }, () =>
      Array<boolean>(GRID_COLS).fill(false)
    );

    this.gridBackground = new Graphics();
    this.container.addChild(this.gridBackground);

    this.highlightGraphics = new Graphics();
    this.container.addChild(this.highlightGraphics);

    this.drawGrid();
    this.setupDragEvents();
    this.populateTestData();
  }

  private drawGrid(): void {
    const g = this.gridBackground;
    g.clear();

    g.roundRect(0, 0, GRID_TOTAL_WIDTH, GRID_TOTAL_HEIGHT, 4);
    g.fill({ color: BG_COLOR, alpha: BG_ALPHA });
    g.stroke({ color: BORDER_COLOR, width: BORDER_WIDTH });

    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const x = this.gridOriginX + c * CELL_SIZE;
        const y = this.gridOriginY + r * CELL_SIZE;
        g.rect(x, y, CELL_SIZE, CELL_SIZE);
        g.fill({ color: CELL_BG_COLOR, alpha: 0.5 });
        g.stroke({ color: CELL_LINE_COLOR, width: 1 });
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

    const localPos = this.container.toLocal(e.global);
    this.dragState.container.x = localPos.x - this.dragState.offsetX;
    this.dragState.container.y = localPos.y - this.dragState.offsetY;

    this.updateHighlight();
  };

  private onPointerUp = (): void => {
    if (!this.dragState) return;

    const item = this.items.find((i) => i.id === this.dragState!.itemId)!;
    const { container: dragContainer, originalGridX, originalGridY } =
      this.dragState;

    const targetCol = this.getDragTargetCol(dragContainer);
    const targetRow = this.getDragTargetRow(dragContainer);

    if (this.canPlace(targetCol, targetRow, item.id)) {
      item.gridX = targetCol;
      item.gridY = targetRow;
    } else {
      item.gridX = originalGridX;
      item.gridY = originalGridY;
    }

    this.occupied[item.gridY][item.gridX] = true;
    this.snapToGrid(dragContainer, item);
    dragContainer.alpha = 1;
    dragContainer.cursor = "grab";
    this.dragState = null;
    this.highlightGraphics.clear();
  };

  private getDragTargetCol(c: Container): number {
    const centerX = c.x + CELL_SIZE / 2;
    return Math.round((centerX - this.gridOriginX) / CELL_SIZE - 0.5);
  }

  private getDragTargetRow(c: Container): number {
    const centerY = c.y + CELL_SIZE / 2;
    return Math.round((centerY - this.gridOriginY) / CELL_SIZE - 0.5);
  }

  private updateHighlight(): void {
    this.highlightGraphics.clear();
    if (!this.dragState) return;

    const item = this.items.find((i) => i.id === this.dragState!.itemId)!;
    const { container: dragContainer } = this.dragState;

    const gridCol = this.getDragTargetCol(dragContainer);
    const gridRow = this.getDragTargetRow(dragContainer);
    const valid = this.canPlace(gridCol, gridRow, item.id);
    const color = valid ? VALID_COLOR : INVALID_COLOR;

    if (gridCol >= 0 && gridCol < GRID_COLS && gridRow >= 0 && gridRow < GRID_ROWS) {
      const x = this.gridOriginX + gridCol * CELL_SIZE;
      const y = this.gridOriginY + gridRow * CELL_SIZE;
      this.highlightGraphics.rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      this.highlightGraphics.fill({ color, alpha: 0.3 });
    }
  }

  private canPlace(gridX: number, gridY: number, excludeItemId?: number): boolean {
    if (gridX < 0 || gridY < 0 || gridX >= GRID_COLS || gridY >= GRID_ROWS) {
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

    const localPos = this.container.toLocal(e.global);
    const offsetX = localPos.x - c.x;
    const offsetY = localPos.y - c.y;

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
    this.container.removeChild(c);
    this.container.addChild(c);
  }

  handleExternalDrop(
    relicType: RelicType,
    screenX: number,
    screenY: number
  ): boolean {
    const localPos = this.container.toLocal({ x: screenX, y: screenY });
    const gridCol = Math.floor(
      (localPos.x - this.gridOriginX) / CELL_SIZE
    );
    const gridRow = Math.floor(
      (localPos.y - this.gridOriginY) / CELL_SIZE
    );

    if (!this.canPlace(gridCol, gridRow)) return false;

    this.addItem(relicType, gridCol, gridRow);
    this.onExternalDrop.emit({ relicType, gridX: gridCol, gridY: gridRow });
    return true;
  }

  private populateTestData(): void {
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
