import { Container, Graphics, Text } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, MerchantShipState } from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import type { EntityState } from "./state";
import {
  Inventory,
  CELL_SIZE,
  GRID_PADDING,
  BORDER_WIDTH,
} from "./Inventory";
import type { InventoryManager } from "./InventoryManager";
import { PIXEL_FONT_FAMILY } from "./constants";

const CLICK_RADIUS = 50;
const PANEL_WIDTH = CELL_SIZE * 3 + GRID_PADDING * 2 + BORDER_WIDTH * 2;

export class MerchantManager {
  readonly layer: Container;

  private assets: AssetManager;
  private shipDisplays = new Map<number, Container>();
  private shopPanel: Container | null = null;
  private shopInventory: Inventory | null = null;
  private priceLabels = new Map<number, Container>();
  private inventoryManager: InventoryManager | null = null;
  private playerInventory: Inventory | null = null;
  private goldLabel: Text | null = null;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
    this.layer.eventMode = "static";
  }

  setInventoryManager(manager: InventoryManager): void {
    this.inventoryManager = manager;
  }

  setPlayerInventory(inventory: Inventory): void {
    this.playerInventory = inventory;
  }

  init(state: GameState): void {
    for (const merchant of state.merchants) {
      this.createMerchantDisplay(merchant);
    }
  }

  private createMerchantDisplay(merchant: MerchantShipState): void {
    const fakeEntity: EntityState = {
      id: merchant.id,
      entityType: merchant.entityType,
      x: merchant.x,
      y: merchant.y,
      vx: 1,
      vy: 0,
      rotation: 0,
      rotationSpeed: 0,
      word: "",
      typedCount: 0,
      health: 1,
      power: 0,
      bleedStacks: 0,
      bleedTimer: 0,
      plasmaStacks: 0,
      slowStacks: 0,
      freezeStacks: 0,
      colorPreset: merchant.colorPreset,
      hasShield: false,
    };

    const display = createShipContainer(this.assets, fakeEntity, true);
    display.eventMode = "static";
    display.cursor = "pointer";
    display.hitArea = { contains: (x: number, y: number) => x * x + y * y < CLICK_RADIUS * CLICK_RADIUS };

    display.on("pointerdown", () => {
      this.toggleShop(merchant);
    });

    const label = new Text({
      text: "Merchant",
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 10,
        fill: 0x66ff88,
        stroke: { color: 0x000000, width: 3 },
      },
    });
    label.anchor.set(0.5, 1);
    label.y = -30;
    display.addChild(label);

    this.layer.addChild(display);
    this.shipDisplays.set(merchant.id, display);
  }

  private toggleShop(merchant: MerchantShipState): void {
    const state = this.getCurrentState();
    if (!state) return;

    if (state.activeMerchantId === merchant.id) {
      this.closeShop(state);
      return;
    }

    this.closeShop(state);
    this.openShop(state, merchant);
  }

  private getCurrentState(): GameState | null {
    return this._state;
  }

  private _state: GameState | null = null;

  update(state: GameState): void {
    this._state = state;

    if (this.goldLabel) {
      this.goldLabel.text = `Gold: ${state.gold}`;
    }
  }

  private openShop(state: GameState, merchant: MerchantShipState): void {
    state.activeMerchantId = merchant.id;

    const rows = Math.ceil(merchant.items.length / 3);
    const cols = 3;

    const panelX = merchant.x - PANEL_WIDTH - 80;
    const panelY = merchant.y - 40;

    this.shopInventory = new Inventory(this.assets, {
      cols,
      rows,
      x: panelX,
      y: panelY,
    });

    this.shopPanel = new Container();

    const titleBg = new Graphics();
    titleBg.roundRect(panelX, panelY - 30, PANEL_WIDTH, 26, 4);
    titleBg.fill({ color: 0x111122, alpha: 0.95 });
    titleBg.stroke({ color: 0x66ff88, width: 2 });
    this.shopPanel.addChild(titleBg);

    const title = new Text({
      text: "Merchant",
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 10,
        fill: 0x66ff88,
      },
    });
    title.x = panelX + 8;
    title.y = panelY - 26;
    this.shopPanel.addChild(title);

    this.goldLabel = new Text({
      text: `Gold: ${state.gold}`,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 10,
        fill: 0xffd700,
      },
    });
    this.goldLabel.anchor.set(1, 0);
    this.goldLabel.x = panelX + PANEL_WIDTH - 8;
    this.goldLabel.y = panelY - 26;
    this.shopPanel.addChild(this.goldLabel);

    this.layer.addChild(this.shopPanel);
    this.layer.addChild(this.shopInventory.container);

    for (let i = 0; i < merchant.items.length; i++) {
      const merchantItem = merchant.items[i];
      const gridX = i % cols;
      const gridY = Math.floor(i / cols);
      this.shopInventory.addItem(merchantItem.item, gridX, gridY);
    }

    this.addPriceOverlays(merchant, panelX, panelY, cols);

    if (this.inventoryManager) {
      this.inventoryManager.register(this.shopInventory);
      this.inventoryManager.setMerchantContext(
        this.shopInventory,
        merchant,
        state,
        () => this.refreshPriceOverlays(merchant, panelX, panelY, cols)
      );
    }
  }

  private addPriceOverlays(
    merchant: MerchantShipState,
    panelX: number,
    panelY: number,
    cols: number
  ): void {
    this.clearPriceOverlays();

    const gridOriginX = GRID_PADDING + BORDER_WIDTH;
    const gridOriginY = GRID_PADDING + BORDER_WIDTH;

    for (let i = 0; i < merchant.items.length; i++) {
      const merchantItem = merchant.items[i];
      const gridX = i % cols;
      const gridY = Math.floor(i / cols);

      const priceContainer = new Container();
      const priceBg = new Graphics();
      priceBg.roundRect(0, 0, CELL_SIZE - 4, 16, 3);
      priceBg.fill({ color: 0x000000, alpha: 0.8 });
      priceContainer.addChild(priceBg);

      const priceText = new Text({
        text: `${merchantItem.price}g`,
        style: {
          fontFamily: PIXEL_FONT_FAMILY,
          fontSize: 8,
          fill: 0xffd700,
        },
      });
      priceText.x = 4;
      priceText.y = 2;
      priceContainer.addChild(priceText);

      priceContainer.x = panelX + gridOriginX + gridX * CELL_SIZE + 2;
      priceContainer.y = panelY + gridOriginY + gridY * CELL_SIZE + CELL_SIZE - 18;

      this.layer.addChild(priceContainer);
      this.priceLabels.set(i, priceContainer);
    }
  }

  private refreshPriceOverlays(
    merchant: MerchantShipState,
    panelX: number,
    panelY: number,
    cols: number
  ): void {
    this.addPriceOverlays(merchant, panelX, panelY, cols);
  }

  private clearPriceOverlays(): void {
    for (const label of this.priceLabels.values()) {
      label.destroy();
    }
    this.priceLabels.clear();
  }

  private closeShop(state: GameState): void {
    state.activeMerchantId = null;

    if (this.shopInventory) {
      if (this.inventoryManager) {
        this.inventoryManager.clearMerchantContext();
      }
      this.shopInventory.destroy();
      this.shopInventory = null;
    }

    if (this.shopPanel) {
      this.shopPanel.destroy();
      this.shopPanel = null;
    }

    this.goldLabel = null;
    this.clearPriceOverlays();
  }

  destroy(): void {
    for (const d of this.shipDisplays.values()) d.destroy();
    this.shipDisplays.clear();
    this.clearPriceOverlays();

    if (this.shopInventory) this.shopInventory.destroy();
    if (this.shopPanel) this.shopPanel.destroy();

    this.layer.destroy();
  }
}
