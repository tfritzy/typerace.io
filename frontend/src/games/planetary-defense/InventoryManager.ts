import {
  Application,
  Container,
  Graphics,
  Sprite,
  type FederatedPointerEvent,
} from "pixi.js";
import { Inventory, ItemType, CELL_SIZE } from "./Inventory";
import type { InventoryItem } from "./Inventory";
import { RELIC_DISPLAY, RelicType } from "./relicConfig";
import { GEM_COLORS, GOLD_COLOR } from "./dropConfig";
import type { GemType } from "./dropConfig";
import type { AssetManager } from "./assetManager";

const ITEM_BG_COLOR = 0x252545;
const ITEM_BORDER_COLOR = 0x4a4a7e;
const CELL_PADDING = 4;

interface DragState {
  source: Inventory;
  itemId: number;
  item: InventoryItem;
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
    item: InventoryItem,
    e: FederatedPointerEvent
  ): void {
    if (this.dragState) return;

    const itemGlobal = source.getItemGlobalPosition(item);
    source.beginItemDrag(item.id);

    const ghost = this.createGhost(item);
    ghost.x = itemGlobal.x;
    ghost.y = itemGlobal.y;
    this.app.stage.addChild(ghost);

    this.dragState = {
      source,
      itemId: item.id,
      item,
      originalCol: item.gridX,
      originalRow: item.gridY,
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

    const { source, itemId, item, ghost } =
      this.dragState;

    for (let i = this.inventories.length - 1; i >= 0; i--) {
      const inv = this.inventories[i];
      const { col, row } = inv.globalToGrid(e.global.x, e.global.y);

      if (!inv.canPlace(col, row)) continue;

      if (inv === source) {
        source.endItemDrag(itemId, col, row);
      } else {
        source.removeItem(itemId);
        inv.addItem(item.type, item.subType, col, row, item.amount);
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

  private createGhost(item: InventoryItem): Container {
    const wrapper = new Container();
    wrapper.alpha = 0.8;

    const bg = new Graphics();
    bg.roundRect(2, 2, CELL_SIZE - 4, CELL_SIZE - 4, 3);
    bg.fill({ color: ITEM_BG_COLOR, alpha: 0.8 });
    bg.stroke({ color: ITEM_BORDER_COLOR, width: 1 });
    wrapper.addChild(bg);

    if (item.type === ItemType.Relic) {
      const display = RELIC_DISPLAY[item.subType as RelicType];
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
    } else if (item.type === ItemType.Gold) {
      const s = 20;
      const gfx = new Graphics();
      gfx.rect(CELL_SIZE / 2 - s / 2, CELL_SIZE / 2 - s / 2, s, s);
      gfx.fill({ color: GOLD_COLOR });
      wrapper.addChild(gfx);
    } else if (item.type === ItemType.Gem) {
      const gemColor = GEM_COLORS[item.subType as GemType];
      const s = 20;
      const gfx = new Graphics();
      gfx.rect(CELL_SIZE / 2 - s / 2, CELL_SIZE / 2 - s / 2, s, s);
      gfx.fill({ color: gemColor });
      wrapper.addChild(gfx);
    }

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
