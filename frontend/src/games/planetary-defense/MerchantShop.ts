import {
  Application,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
  type FederatedPointerEvent,
} from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT_FAMILY } from "./constants";
import { RelicType, RELIC_DISPLAY } from "./relicConfig";
import type { AssetManager } from "./assetManager";
import type { GameState, MerchantItem } from "./state";
import { selectMerchantShip, purchaseMerchantItem } from "./state";
import type { Inventory } from "./Inventory";

const CELL_SIZE = 64;
const CELL_PADDING = 4;
const PANEL_PADDING = 12;
const BORDER_WIDTH = 3;
const ITEM_ROWS = 3;
const ITEM_COLS = 1;

const PANEL_INNER_W = ITEM_COLS * CELL_SIZE;
const PRICE_COL_W = 80;
const PANEL_W =
  PANEL_INNER_W + PRICE_COL_W + PANEL_PADDING * 2 + BORDER_WIDTH * 2;
const PANEL_H =
  ITEM_ROWS * CELL_SIZE + PANEL_PADDING * 2 + BORDER_WIDTH * 2 + 40;

const BG_COLOR = 0x111122;
const BG_ALPHA = 0.95;
const BORDER_COLOR = 0xd4a017;
const CELL_BG_COLOR = 0x15152a;
const CELL_LINE_COLOR = 0x2a2a3e;
const ITEM_BG_COLOR = 0x252545;
const ITEM_BORDER_COLOR = 0x4a4a7e;
const GOLD_COLOR = 0xffd700;
const AFFORDABLE_COLOR = 0x4ade80;
const UNAFFORDABLE_COLOR = 0xef4444;
const VALID_COLOR = 0x4ade80;

const INV_GRID_ORIGIN = 11;

const SHIP_BTN_W = 200;
const SHIP_BTN_H = 80;
const SHIP_BTN_GAP = 120;

const LABEL_STYLE = new TextStyle({
  fontFamily: PIXEL_FONT_FAMILY,
  fontSize: 10,
  fill: 0xcdd6f4,
  letterSpacing: 1,
});

const TITLE_STYLE = new TextStyle({
  fontFamily: PIXEL_FONT_FAMILY,
  fontSize: 11,
  fill: GOLD_COLOR,
  letterSpacing: 1,
});

interface MerchantDragState {
  itemIndex: number;
  relicType: RelicType;
  price: number;
  container: Container;
  offsetX: number;
  offsetY: number;
}

export class MerchantShop {
  readonly container: Container;

  private app: Application;
  private assetManager: AssetManager;
  private state: GameState;
  private inventory: Inventory;

  private selectionContainer: Container;
  private panelContainer: Container;
  private itemContainers: Container[] = [];
  private priceTexts: Text[] = [];
  private panelBackground!: Graphics;
  private highlightGraphics!: Graphics;
  private dragState: MerchantDragState | null = null;

  private unsubMerchantOpened: (() => void) | null = null;
  private unsubMerchantClosed: (() => void) | null = null;

  constructor(
    app: Application,
    assetManager: AssetManager,
    state: GameState,
    inventory: Inventory
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.state = state;
    this.inventory = inventory;
    this.container = new Container();
    this.container.visible = false;

    this.selectionContainer = new Container();
    this.container.addChild(this.selectionContainer);

    this.panelContainer = new Container();
    this.panelContainer.visible = false;
    this.container.addChild(this.panelContainer);

    this.buildShipButtons();
    this.buildPanel();
    this.setupDragEvents();

    this.unsubMerchantOpened = state.onMerchantOpened.subscribe(() => {
      this.show();
    });
    this.unsubMerchantClosed = state.onMerchantClosed.subscribe(() => {
      this.hide();
    });
  }

  private buildShipButtons(): void {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2 - 40;

    const leftBtn = this.createShipButton("LEFT SHIP", -1);
    leftBtn.x = centerX - SHIP_BTN_W - SHIP_BTN_GAP / 2;
    leftBtn.y = centerY - SHIP_BTN_H / 2;
    this.selectionContainer.addChild(leftBtn);

    const rightBtn = this.createShipButton("RIGHT SHIP", 1);
    rightBtn.x = centerX + SHIP_BTN_GAP / 2;
    rightBtn.y = centerY - SHIP_BTN_H / 2;
    this.selectionContainer.addChild(rightBtn);

    const title = new Text({ text: "MERCHANT SHIPS APPROACHING", style: TITLE_STYLE });
    title.anchor.set(0.5, 0);
    title.x = centerX;
    title.y = centerY - SHIP_BTN_H / 2 - 40;
    this.selectionContainer.addChild(title);

    const hint = new Text({
      text: "SELECT A SHIP TO BROWSE WARES",
      style: LABEL_STYLE,
    });
    hint.anchor.set(0.5, 0);
    hint.x = centerX;
    hint.y = centerY + SHIP_BTN_H / 2 + 16;
    this.selectionContainer.addChild(hint);
  }

  private createShipButton(label: string, dir: number): Container {
    const btn = new Container();
    btn.eventMode = "static";
    btn.cursor = "pointer";

    const bg = new Graphics();
    bg.roundRect(0, 0, SHIP_BTN_W, SHIP_BTN_H, 6);
    bg.fill({ color: BG_COLOR, alpha: BG_ALPHA });
    bg.stroke({ color: BORDER_COLOR, width: 2 });
    btn.addChild(bg);

    const arrowChar = dir < 0 ? "<<<" : ">>>";
    const arrow = new Text({ text: arrowChar, style: TITLE_STYLE });
    arrow.anchor.set(0.5);
    arrow.x = SHIP_BTN_W / 2;
    arrow.y = SHIP_BTN_H / 2 - 14;
    btn.addChild(arrow);

    const text = new Text({ text: label, style: LABEL_STYLE });
    text.anchor.set(0.5);
    text.x = SHIP_BTN_W / 2;
    text.y = SHIP_BTN_H / 2 + 12;
    btn.addChild(text);

    btn.on("pointertap", () => {
      const side = dir < 0 ? "left" as const : "right" as const;
      selectMerchantShip(this.state, side);
      this.showPanel();
    });

    return btn;
  }

  private buildPanel(): void {
    this.panelBackground = new Graphics();
    this.panelContainer.addChild(this.panelBackground);

    this.highlightGraphics = new Graphics();
    this.panelContainer.addChild(this.highlightGraphics);

    this.panelContainer.x = (CANVAS_WIDTH - PANEL_W) / 2;
    this.panelContainer.y = (CANVAS_HEIGHT - PANEL_H) / 2 - 80;
  }

  private drawPanel(items: MerchantItem[]): void {
    this.clearPanelItems();

    const g = this.panelBackground;
    g.clear();
    g.roundRect(0, 0, PANEL_W, PANEL_H, 4);
    g.fill({ color: BG_COLOR, alpha: BG_ALPHA });
    g.stroke({ color: BORDER_COLOR, width: BORDER_WIDTH });

    const titleText = new Text({ text: "MERCHANT WARES", style: TITLE_STYLE });
    titleText.anchor.set(0.5, 0);
    titleText.x = PANEL_W / 2;
    titleText.y = PANEL_PADDING;
    this.panelContainer.addChild(titleText);

    const gridStartY = PANEL_PADDING + BORDER_WIDTH + 30;
    const gridStartX = PANEL_PADDING + BORDER_WIDTH;

    for (let i = 0; i < ITEM_ROWS; i++) {
      const y = gridStartY + i * CELL_SIZE;
      g.rect(gridStartX, y, CELL_SIZE, CELL_SIZE);
      g.fill({ color: CELL_BG_COLOR, alpha: 0.5 });
      g.stroke({ color: CELL_LINE_COLOR, width: 1 });
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const y = gridStartY + i * CELL_SIZE;

      const itemContainer = this.createItemVisual(item.relicType, i);
      itemContainer.x = gridStartX;
      itemContainer.y = y;
      this.panelContainer.addChild(itemContainer);
      this.itemContainers.push(itemContainer);

      const priceColor =
        this.state.gold >= item.price ? AFFORDABLE_COLOR : UNAFFORDABLE_COLOR;
      const priceText = new Text({
        text: `${item.price}g`,
        style: new TextStyle({
          fontFamily: PIXEL_FONT_FAMILY,
          fontSize: 10,
          fill: priceColor,
        }),
      });
      priceText.anchor.set(0, 0.5);
      priceText.x = gridStartX + CELL_SIZE + 12;
      priceText.y = y + CELL_SIZE / 2;
      this.panelContainer.addChild(priceText);
      this.priceTexts.push(priceText);
    }
  }

  private createItemVisual(
    relicType: RelicType,
    itemIndex: number
  ): Container {
    const wrapper = new Container();
    wrapper.eventMode = "static";
    wrapper.cursor = "grab";

    const bg = new Graphics();
    bg.roundRect(2, 2, CELL_SIZE - 4, CELL_SIZE - 4, 3);
    bg.fill({ color: ITEM_BG_COLOR, alpha: 0.8 });
    bg.stroke({ color: ITEM_BORDER_COLOR, width: 1 });
    wrapper.addChild(bg);

    const display = RELIC_DISPLAY[relicType];
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
      this.startDrag(itemIndex, relicType, e);
    });

    return wrapper;
  }

  private startDrag(
    itemIndex: number,
    relicType: RelicType,
    e: FederatedPointerEvent
  ): void {
    const ship =
      this.state.merchant.selectedShip === "left"
        ? this.state.merchant.leftShip
        : this.state.merchant.rightShip;
    if (itemIndex >= ship.items.length) return;
    const item = ship.items[itemIndex];
    if (this.state.gold < item.price) return;

    const wrapper = this.itemContainers[itemIndex];
    if (!wrapper) return;

    const localPos = this.panelContainer.toLocal(e.global);
    const offsetX = localPos.x - wrapper.x;
    const offsetY = localPos.y - wrapper.y;

    this.dragState = {
      itemIndex,
      relicType,
      price: item.price,
      container: wrapper,
      offsetX,
      offsetY,
    };

    wrapper.alpha = 0.8;
    wrapper.cursor = "grabbing";
    this.panelContainer.removeChild(wrapper);
    this.panelContainer.addChild(wrapper);
  }

  private setupDragEvents(): void {
    this.app.stage.on("pointermove", this.onPointerMove);
    this.app.stage.on("pointerup", this.onPointerUp);
    this.app.stage.on("pointerupoutside", this.onPointerUp);
  }

  private onPointerMove = (e: FederatedPointerEvent): void => {
    if (!this.dragState) return;
    const localPos = this.panelContainer.toLocal(e.global);
    this.dragState.container.x = localPos.x - this.dragState.offsetX;
    this.dragState.container.y = localPos.y - this.dragState.offsetY;

    this.updateHighlight(e);
  };

  private onPointerUp = (e: FederatedPointerEvent): void => {
    if (!this.dragState) return;

    const invLocal = this.inventory.container.toLocal(e.global);
    const invGridX = Math.floor((invLocal.x - INV_GRID_ORIGIN) / CELL_SIZE);
    const invGridY = Math.floor((invLocal.y - INV_GRID_ORIGIN) / CELL_SIZE);
    const overInventory =
      invGridX >= 0 && invGridX < 10 && invGridY >= 0 && invGridY < 3;

    let success = false;
    if (overInventory) {
      const purchased = purchaseMerchantItem(
        this.state,
        this.dragState.itemIndex
      );
      if (purchased) {
        const dropped = this.inventory.handleExternalDrop(
          this.dragState.relicType,
          e.global.x,
          e.global.y
        );
        if (!dropped) {
          this.state.gold += purchased.price;
          this.state.onGoldChanged.emit();
          const ship =
            this.state.merchant.selectedShip === "left"
              ? this.state.merchant.leftShip
              : this.state.merchant.rightShip;
          ship.items.splice(this.dragState.itemIndex, 0, purchased);
        }
        success = dropped;
      }
    }

    if (success) {
      const ship =
        this.state.merchant.selectedShip === "left"
          ? this.state.merchant.leftShip
          : this.state.merchant.rightShip;
      this.drawPanel(ship.items);
    } else {
      this.resetDragPosition();
    }

    this.dragState = null;
    this.highlightGraphics.clear();
  };

  private resetDragPosition(): void {
    if (!this.dragState) return;
    const gridStartY = PANEL_PADDING + BORDER_WIDTH + 30;
    const gridStartX = PANEL_PADDING + BORDER_WIDTH;
    this.dragState.container.x = gridStartX;
    this.dragState.container.y =
      gridStartY + this.dragState.itemIndex * CELL_SIZE;
    this.dragState.container.alpha = 1;
    this.dragState.container.cursor = "grab";
  }

  private updateHighlight(e: FederatedPointerEvent): void {
    this.highlightGraphics.clear();
    if (!this.dragState) return;

    const invLocal = this.inventory.container.toLocal(e.global);
    const invGridX = Math.floor((invLocal.x - INV_GRID_ORIGIN) / CELL_SIZE);
    const invGridY = Math.floor((invLocal.y - INV_GRID_ORIGIN) / CELL_SIZE);

    if (invGridX >= 0 && invGridX < 10 && invGridY >= 0 && invGridY < 3) {
      const screenPos = this.inventory.container.toGlobal({
        x: INV_GRID_ORIGIN + invGridX * CELL_SIZE,
        y: INV_GRID_ORIGIN + invGridY * CELL_SIZE,
      });
      const panelLocal = this.panelContainer.toLocal(screenPos);
      this.highlightGraphics.rect(
        panelLocal.x + 1,
        panelLocal.y + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      this.highlightGraphics.fill({ color: VALID_COLOR, alpha: 0.3 });
    }
  }

  private showPanel(): void {
    this.selectionContainer.visible = false;
    this.panelContainer.visible = true;
    const ship =
      this.state.merchant.selectedShip === "left"
        ? this.state.merchant.leftShip
        : this.state.merchant.rightShip;
    this.drawPanel(ship.items);
  }

  show(): void {
    this.container.visible = true;
    this.selectionContainer.visible = true;
    this.panelContainer.visible = false;
  }

  hide(): void {
    this.container.visible = false;
    this.clearPanelItems();
    this.dragState = null;
  }

  private clearPanelItems(): void {
    for (const c of this.itemContainers) {
      c.destroy({ children: true });
    }
    this.itemContainers = [];
    for (const t of this.priceTexts) {
      t.destroy();
    }
    this.priceTexts = [];

    const children = [...this.panelContainer.children];
    for (const child of children) {
      if (child !== this.panelBackground && child !== this.highlightGraphics) {
        child.destroy({ children: true });
      }
    }
  }

  destroy(): void {
    this.unsubMerchantOpened?.();
    this.unsubMerchantClosed?.();

    this.app.stage.off("pointermove", this.onPointerMove);
    this.app.stage.off("pointerup", this.onPointerUp);
    this.app.stage.off("pointerupoutside", this.onPointerUp);

    this.clearPanelItems();
    this.panelBackground.destroy();
    this.highlightGraphics.destroy();
    this.selectionContainer.destroy({ children: true });
    this.panelContainer.destroy({ children: true });
    this.container.destroy({ children: true });
  }
}
