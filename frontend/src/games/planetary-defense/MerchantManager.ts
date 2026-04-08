import { Container, Circle, Graphics, Text } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, MerchantShipState } from "./state";
import { createEntityState, selectMerchant } from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import {
  Inventory,
  CELL_SIZE,
  GRID_PADDING,
  BORDER_WIDTH,
} from "./Inventory";
import type { InventoryManager } from "./InventoryManager";
import { PIXEL_FONT_FAMILY } from "./constants";
import { ColorPreset } from "./types";

const CLICK_RADIUS = 50;
const PANEL_WIDTH = CELL_SIZE * 3 + GRID_PADDING * 2 + BORDER_WIDTH * 2;

export class MerchantManager {
  readonly layer: Container;
  hoveredMerchantId: number | null = null;

  private assets: AssetManager;
  private shipDisplays = new Map<number, Container>();
  private shopPanel: Container | null = null;
  private shopInventory: Inventory | null = null;
  private inventoryManager: InventoryManager | null = null;
  private activeMerchantId: number | null = null;
  private knownMerchantIds = new Set<number>();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
    this.layer.eventMode = "static";
  }

  setInventoryManager(manager: InventoryManager): void {
    this.inventoryManager = manager;
  }

  init(state: GameState): void {
    for (const merchant of state.merchants) {
      this.createMerchantDisplay(merchant, state);
      this.knownMerchantIds.add(merchant.id);
    }
  }

  private createMerchantDisplay(merchant: MerchantShipState, state: GameState): void {
    const entity = createEntityState(
      merchant.id,
      merchant.entityType,
      merchant.x,
      merchant.y,
      { vx: 1, colorPreset: ColorPreset.Preset3 }
    );

    const display = createShipContainer(this.assets, entity);
    display.eventMode = "static";
    display.cursor = "pointer";
    display.hitArea = new Circle(0, 0, CLICK_RADIUS);

    display.on("pointerdown", () => {
      if (merchant.departing) return;
      if (!merchant.shopOpenable) {
        selectMerchant(state, merchant.id);
      }
      if (merchant.shopOpenable) {
        this.toggleShop(merchant);
      }
    });

    display.on("pointerover", () => {
      if (merchant.departing) return;
      this.hoveredMerchantId = merchant.id;
    });

    display.on("pointerout", () => {
      if (this.hoveredMerchantId === merchant.id) {
        this.hoveredMerchantId = null;
      }
    });

    this.layer.addChild(display);
    this.shipDisplays.set(merchant.id, display);
  }

  private toggleShop(merchant: MerchantShipState): void {
    if (this.activeMerchantId === merchant.id) {
      this.closeShop();
      return;
    }

    this.closeShop();
    this.openShop(merchant);
  }

  update(state: GameState): void {
    this.syncMerchants(state);
  }

  private syncMerchants(state: GameState): void {
    const currentIds = new Set(state.merchants.map((m) => m.id));

    for (const [id] of this.shipDisplays) {
      if (!currentIds.has(id)) {
        this.removeMerchantDisplay(id);
      }
    }

    if (this.activeMerchantId !== null && !currentIds.has(this.activeMerchantId)) {
      this.closeShop();
    }

    const activeMerchant = this.activeMerchantId !== null
      ? state.merchants.find((m) => m.id === this.activeMerchantId)
      : null;
    if (activeMerchant && !activeMerchant.shopOpenable) {
      this.closeShop();
    }

    for (const merchant of state.merchants) {
      if (!this.knownMerchantIds.has(merchant.id)) {
        this.createMerchantDisplay(merchant, state);
        this.knownMerchantIds.add(merchant.id);
      }

      const display = this.shipDisplays.get(merchant.id);
      if (display) {
        display.x = merchant.x;
        display.y = merchant.y;
      }
    }

    if (this.hoveredMerchantId !== null) {
      const hovered = state.merchants.find((m) => m.id === this.hoveredMerchantId);
      if (!hovered || hovered.departing) {
        this.hoveredMerchantId = null;
      }
    }
  }

  private removeMerchantDisplay(id: number): void {
    const display = this.shipDisplays.get(id);
    if (display) {
      display.destroy();
      this.shipDisplays.delete(id);
    }
    this.knownMerchantIds.delete(id);

    if (this.hoveredMerchantId === id) {
      this.hoveredMerchantId = null;
    }
  }

  private openShop(merchant: MerchantShipState): void {
    this.activeMerchantId = merchant.id;

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
      text: merchant.name,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 10,
        fill: 0x66ff88,
      },
    });
    title.x = panelX + 8;
    title.y = panelY - 26;
    this.shopPanel.addChild(title);

    this.layer.addChild(this.shopPanel);
    this.layer.addChild(this.shopInventory.container);

    for (let i = 0; i < merchant.items.length; i++) {
      const item = merchant.items[i];
      const gridX = i % cols;
      const gridY = Math.floor(i / cols);
      this.shopInventory.addItem(item, gridX, gridY);
    }

    if (this.inventoryManager) {
      this.inventoryManager.register(this.shopInventory);
    }
  }

  private closeShop(): void {
    this.activeMerchantId = null;

    if (this.shopInventory) {
      if (this.inventoryManager) {
        this.inventoryManager.unregister(this.shopInventory);
      }
      this.shopInventory.destroy();
      this.shopInventory = null;
    }

    if (this.shopPanel) {
      this.shopPanel.destroy();
      this.shopPanel = null;
    }
  }

  destroy(): void {
    for (const d of this.shipDisplays.values()) d.destroy();
    this.shipDisplays.clear();

    if (this.shopInventory) this.shopInventory.destroy();
    if (this.shopPanel) this.shopPanel.destroy();

    this.layer.destroy();
  }
}
