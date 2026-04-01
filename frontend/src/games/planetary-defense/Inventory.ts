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
const GRID_ROWS = 5;
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
const TEMP_ITEM_ID = -1;

export interface InventoryItem {
  id: number;
  relicType: RelicType;
  gridX: number;
  gridY: number;
  width: number;
  height: number;
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

const RELIC_SIZES: Partial<
  Record<RelicType, { width: number; height: number }>
> = {
  [RelicType.BloodthornDirk]: { width: 1, height: 1 },
  [RelicType.StarfallStiletto]: { width: 1, height: 1 },
  [RelicType.MoonlitHatchet]: { width: 1, height: 1 },
  [RelicType.RavenplumeEdge]: { width: 1, height: 1 },
  [RelicType.EmberstrikeTomahawk]: { width: 1, height: 1 },
  [RelicType.PearlsteelHatchet]: { width: 1, height: 1 },
  [RelicType.DarkwoodHatchet]: { width: 1, height: 1 },
  [RelicType.SandstoneHatchet]: { width: 1, height: 1 },
  [RelicType.IronwoodTomahawk]: { width: 1, height: 1 },

  [RelicType.EmbercrestBlade]: { width: 1, height: 2 },
  [RelicType.BriarthornSaber]: { width: 1, height: 2 },
  [RelicType.RosevineRapier]: { width: 1, height: 2 },
  [RelicType.CrystalbreakSaber]: { width: 1, height: 2 },
  [RelicType.CinderstoneBlade]: { width: 1, height: 2 },
  [RelicType.EmeraldFang]: { width: 1, height: 2 },
  [RelicType.MistralSabre]: { width: 1, height: 2 },
  [RelicType.SunfireScimitar]: { width: 1, height: 2 },
  [RelicType.AzureCrescent]: { width: 1, height: 2 },
  [RelicType.TigerstripeFalchion]: { width: 1, height: 2 },
  [RelicType.DawnfireCutlass]: { width: 1, height: 2 },
  [RelicType.VoidthornBlade]: { width: 1, height: 2 },

  [RelicType.TwinflareCrossblades]: { width: 2, height: 1 },

  [RelicType.CloudveilLongsword]: { width: 1, height: 3 },
  [RelicType.SolarisEdge]: { width: 1, height: 3 },
  [RelicType.ChainlinkEstoc]: { width: 1, height: 3 },
  [RelicType.TidecallerBlade]: { width: 1, height: 3 },

  [RelicType.SteelBattleaxe]: { width: 2, height: 2 },
  [RelicType.CrimsonCleaver]: { width: 2, height: 2 },
  [RelicType.CrimsonWaraxe]: { width: 2, height: 2 },
  [RelicType.FrostbiteCleaver]: { width: 2, height: 2 },
  [RelicType.GreystoneBroadaxe]: { width: 2, height: 2 },
  [RelicType.GildedWaraxe]: { width: 2, height: 2 },
  [RelicType.RosegoldBroadaxe]: { width: 2, height: 2 },
  [RelicType.SpectralCleaver]: { width: 2, height: 2 },
  [RelicType.WroughtIronChopper]: { width: 2, height: 2 },
  [RelicType.AshenBroadaxe]: { width: 2, height: 2 },
  [RelicType.CopperheadCleaver]: { width: 2, height: 2 },
  [RelicType.ObsidianReaver]: { width: 2, height: 2 },
  [RelicType.BloodmoonReaver]: { width: 2, height: 2 },

  [RelicType.FrostfangClaymore]: { width: 1, height: 4 },
  [RelicType.JadecrossBroadsword]: { width: 1, height: 4 },
  [RelicType.PermafrostGreatsword]: { width: 1, height: 4 },
  [RelicType.RubyguardGreatsword]: { width: 1, height: 4 },

  [RelicType.MoltenZweihander]: { width: 2, height: 3 },
  [RelicType.InfernalRavager]: { width: 2, height: 3 },
  [RelicType.DuskforgeHalberd]: { width: 2, height: 3 },
  [RelicType.SporesparkGlaive]: { width: 2, height: 3 },
  [RelicType.RubyflareGreataxe]: { width: 2, height: 3 },
  [RelicType.FlamecrestGreataxe]: { width: 2, height: 3 },
  [RelicType.PrismaticGreataxe]: { width: 2, height: 3 },
  [RelicType.HellforgedCleaver]: { width: 2, height: 3 },
  [RelicType.GoldscarHalberd]: { width: 2, height: 3 },

  [RelicType.BlackironSplitter]: { width: 2, height: 4 },
  [RelicType.GraniteWaraxe]: { width: 2, height: 4 },
};

function getRelicSize(type: RelicType): { width: number; height: number } {
  return RELIC_SIZES[type] ?? { width: 1, height: 2 };
}

export function getRelicInventorySize(
  type: RelicType
): { width: number; height: number } {
  return getRelicSize(type);
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

    const targetCol = this.getDragTargetCol(item, dragContainer);
    const targetRow = this.getDragTargetRow(item, dragContainer);

    if (this.canPlace(item, targetCol, targetRow)) {
      item.gridX = targetCol;
      item.gridY = targetRow;
    } else {
      item.gridX = originalGridX;
      item.gridY = originalGridY;
    }

    this.markCells(item, true);
    this.snapToGrid(dragContainer, item);
    dragContainer.alpha = 1;
    dragContainer.cursor = "grab";
    this.dragState = null;
    this.highlightGraphics.clear();
  };

  private getDragTargetCol(item: InventoryItem, c: Container): number {
    const centerX = c.x + (item.width * CELL_SIZE) / 2;
    return Math.round(
      (centerX - this.gridOriginX) / CELL_SIZE - item.width / 2
    );
  }

  private getDragTargetRow(item: InventoryItem, c: Container): number {
    const centerY = c.y + (item.height * CELL_SIZE) / 2;
    return Math.round(
      (centerY - this.gridOriginY) / CELL_SIZE - item.height / 2
    );
  }

  private updateHighlight(): void {
    this.highlightGraphics.clear();
    if (!this.dragState) return;

    const item = this.items.find((i) => i.id === this.dragState!.itemId)!;
    const { container: dragContainer } = this.dragState;

    const gridCol = this.getDragTargetCol(item, dragContainer);
    const gridRow = this.getDragTargetRow(item, dragContainer);
    const valid = this.canPlace(item, gridCol, gridRow);
    const color = valid ? VALID_COLOR : INVALID_COLOR;

    for (let dy = 0; dy < item.height; dy++) {
      for (let dx = 0; dx < item.width; dx++) {
        const cellCol = gridCol + dx;
        const cellRow = gridRow + dy;
        if (
          cellCol < 0 ||
          cellCol >= GRID_COLS ||
          cellRow < 0 ||
          cellRow >= GRID_ROWS
        )
          continue;

        const x = this.gridOriginX + cellCol * CELL_SIZE;
        const y = this.gridOriginY + cellRow * CELL_SIZE;
        this.highlightGraphics.rect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        this.highlightGraphics.fill({ color, alpha: 0.3 });
      }
    }
  }

  private canPlace(
    item: InventoryItem,
    gridX: number,
    gridY: number
  ): boolean {
    if (
      gridX < 0 ||
      gridY < 0 ||
      gridX + item.width > GRID_COLS ||
      gridY + item.height > GRID_ROWS
    ) {
      return false;
    }

    for (let dy = 0; dy < item.height; dy++) {
      for (let dx = 0; dx < item.width; dx++) {
        if (this.occupied[gridY + dy][gridX + dx]) return false;
      }
    }

    return true;
  }

  private markCells(item: InventoryItem, value: boolean): void {
    for (let dy = 0; dy < item.height; dy++) {
      for (let dx = 0; dx < item.width; dx++) {
        this.occupied[item.gridY + dy][item.gridX + dx] = value;
      }
    }
  }

  private snapToGrid(c: Container, item: InventoryItem): void {
    c.x = this.gridOriginX + item.gridX * CELL_SIZE;
    c.y = this.gridOriginY + item.gridY * CELL_SIZE;
  }

  addItem(
    relicType: RelicType,
    gridX: number,
    gridY: number
  ): InventoryItem | null {
    const size = getRelicSize(relicType);
    const item: InventoryItem = {
      id: this.nextItemId++,
      relicType,
      gridX,
      gridY,
      width: size.width,
      height: size.height,
    };

    if (!this.canPlace(item, gridX, gridY)) return null;

    this.items.push(item);
    this.markCells(item, true);

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
    this.markCells(item, false);
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

    const w = item.width * CELL_SIZE;
    const h = item.height * CELL_SIZE;

    const bg = new Graphics();
    bg.roundRect(2, 2, w - 4, h - 4, 3);
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

    const spriteSize = Math.min(w, h) - CELL_PADDING * 2;
    sprite.width = spriteSize;
    sprite.height = spriteSize;
    sprite.x = w / 2;
    sprite.y = h / 2;
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

    this.markCells(item, false);

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

    const size = getRelicSize(relicType);
    const tempItem: InventoryItem = {
      id: TEMP_ITEM_ID,
      relicType,
      gridX: gridCol,
      gridY: gridRow,
      width: size.width,
      height: size.height,
    };

    if (!this.canPlace(tempItem, gridCol, gridRow)) return false;

    this.addItem(relicType, gridCol, gridRow);
    this.onExternalDrop.emit({ relicType, gridX: gridCol, gridY: gridRow });
    return true;
  }

  private populateTestData(): void {
    this.addItem(RelicType.StarfallStiletto, 0, 0);
    this.addItem(RelicType.BloodthornDirk, 1, 0);
    this.addItem(RelicType.EmbercrestBlade, 0, 1);
    this.addItem(RelicType.BriarthornSaber, 1, 1);
    this.addItem(RelicType.TwinflareCrossblades, 2, 0);
    this.addItem(RelicType.CloudveilLongsword, 4, 0);
    this.addItem(RelicType.SteelBattleaxe, 5, 0);
    this.addItem(RelicType.MoltenZweihander, 7, 0);
    this.addItem(RelicType.MoonlitHatchet, 9, 0);
    this.addItem(RelicType.FrostfangClaymore, 9, 1);
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
