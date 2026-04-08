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
import { PIXEL_FONT_FAMILY, CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { ColorPreset } from "./types";

const CLICK_RADIUS = 50;
const PANEL_WIDTH = CELL_SIZE * 3 + GRID_PADDING * 2 + BORDER_WIDTH * 2;
const NAME_LABEL_OFFSET_Y = -50;
const NAME_LABEL_PADDING_X = 16;
const NAME_LABEL_PADDING_Y = 10;
const TOOLTIP_WIDTH = 260;
const TOOLTIP_PADDING = 10;
const TOOLTIP_OFFSET_X = 60;

export class MerchantManager {
  readonly layer: Container;

  private assets: AssetManager;
  private shipDisplays = new Map<number, Container>();
  private nameLabels = new Map<number, Container>();
  private shopPanel: Container | null = null;
  private shopInventory: Inventory | null = null;
  private inventoryManager: InventoryManager | null = null;
  private activeMerchantId: number | null = null;
  private knownMerchantIds = new Set<number>();
  private promptContainer: Container | null = null;
  private promptVisible = false;
  private hoverTooltip: Container | null = null;
  private hoveredMerchantId: number | null = null;

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
      this.showHoverTooltip(merchant);
    });

    display.on("pointerout", () => {
      this.hideHoverTooltip();
    });

    this.layer.addChild(display);
    this.shipDisplays.set(merchant.id, display);

    this.createNameLabel(merchant);
  }

  private createNameLabel(merchant: MerchantShipState): void {
    const label = new Container();

    const nameText = new Text({
      text: merchant.name,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 9,
        fill: 0xffd700,
        lineHeight: 14,
      },
    });
    nameText.anchor.set(0.5, 0.5);

    const textWidth = nameText.width + NAME_LABEL_PADDING_X;
    const textHeight = nameText.height + NAME_LABEL_PADDING_Y;

    const bg = new Graphics();
    bg.roundRect(-textWidth / 2, -textHeight / 2, textWidth, textHeight, 4);
    bg.fill({ color: 0x111122, alpha: 0.85 });
    bg.stroke({ color: 0xffd700, width: 1, alpha: 0.5 });

    label.addChild(bg);
    label.addChild(nameText);
    label.x = merchant.x;
    label.y = merchant.y + NAME_LABEL_OFFSET_Y;

    this.layer.addChild(label);
    this.nameLabels.set(merchant.id, label);
  }

  private showHoverTooltip(merchant: MerchantShipState): void {
    if (this.hoveredMerchantId === merchant.id) return;
    this.hideHoverTooltip();
    this.hoveredMerchantId = merchant.id;

    this.hoverTooltip = new Container();

    const titleText = new Text({
      text: merchant.name,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 10,
        fill: 0xffd700,
        lineHeight: 16,
        wordWrap: true,
        wordWrapWidth: TOOLTIP_WIDTH - TOOLTIP_PADDING * 2,
      },
    });

    const descText = new Text({
      text: merchant.description,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 7,
        fill: 0xa6adc8,
        lineHeight: 14,
        wordWrap: true,
        wordWrapWidth: TOOLTIP_WIDTH - TOOLTIP_PADDING * 2,
      },
    });
    descText.y = titleText.height + 8;

    const contentHeight = titleText.height + 8 + descText.height;
    const tooltipHeight = contentHeight + TOOLTIP_PADDING * 2;

    const bg = new Graphics();
    bg.roundRect(0, 0, TOOLTIP_WIDTH, tooltipHeight, 6);
    bg.fill({ color: 0x0d0d1a, alpha: 0.95 });
    bg.stroke({ color: 0xffd700, width: 1.5, alpha: 0.6 });

    this.hoverTooltip.addChild(bg);

    titleText.x = TOOLTIP_PADDING;
    titleText.y = TOOLTIP_PADDING;
    descText.x = TOOLTIP_PADDING;
    descText.y = TOOLTIP_PADDING + titleText.height + 8;

    this.hoverTooltip.addChild(titleText);
    this.hoverTooltip.addChild(descText);

    this.hoverTooltip.x = merchant.x - TOOLTIP_WIDTH - TOOLTIP_OFFSET_X;
    this.hoverTooltip.y = merchant.y - tooltipHeight / 2;

    this.layer.addChild(this.hoverTooltip);
  }

  private hideHoverTooltip(): void {
    if (this.hoverTooltip) {
      this.hoverTooltip.destroy();
      this.hoverTooltip = null;
    }
    this.hoveredMerchantId = null;
  }

  private showPrompt(): void {
    if (this.promptVisible) return;

    this.promptContainer = new Container();

    const promptText = new Text({
      text: "CHOOSE A MERCHANT",
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 12,
        fill: 0xffd700,
      },
    });
    promptText.anchor.set(0.5, 0.5);

    const hintText = new Text({
      text: "click a ship to browse its wares",
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 8,
        fill: 0xa6adc8,
      },
    });
    hintText.anchor.set(0.5, 0.5);
    hintText.y = 22;

    const bgWidth = 320;
    const bgHeight = 50;
    const bg = new Graphics();
    bg.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 6);
    bg.fill({ color: 0x111122, alpha: 0.9 });
    bg.stroke({ color: 0xffd700, width: 1, alpha: 0.4 });

    this.promptContainer.addChild(bg);
    this.promptContainer.addChild(promptText);
    this.promptContainer.addChild(hintText);
    this.promptContainer.x = CANVAS_WIDTH - 250;
    this.promptContainer.y = CANVAS_HEIGHT / 2 - 200;

    this.layer.addChild(this.promptContainer);
    this.promptVisible = true;
  }

  private hidePrompt(): void {
    if (this.promptContainer) {
      this.promptContainer.destroy();
      this.promptContainer = null;
    }
    this.promptVisible = false;
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

      const label = this.nameLabels.get(merchant.id);
      if (label) {
        label.x = merchant.x;
        label.y = merchant.y + NAME_LABEL_OFFSET_Y;
      }
    }

    if (this.hoveredMerchantId !== null) {
      const hovered = state.merchants.find((m) => m.id === this.hoveredMerchantId);
      if (!hovered || hovered.departing) {
        this.hideHoverTooltip();
      }
    }

    const hasNonDeparting = state.merchants.some((m) => !m.departing);
    const anySelected = state.merchants.some((m) => m.shopOpenable);
    if (hasNonDeparting && !anySelected) {
      this.showPrompt();
    } else {
      this.hidePrompt();
    }
  }

  private removeMerchantDisplay(id: number): void {
    const display = this.shipDisplays.get(id);
    if (display) {
      display.destroy();
      this.shipDisplays.delete(id);
    }
    this.knownMerchantIds.delete(id);

    const label = this.nameLabels.get(id);
    if (label) {
      label.destroy();
      this.nameLabels.delete(id);
    }

    if (this.hoveredMerchantId === id) {
      this.hideHoverTooltip();
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

    for (const d of this.nameLabels.values()) d.destroy();
    this.nameLabels.clear();

    this.hidePrompt();
    this.hideHoverTooltip();

    if (this.shopInventory) this.shopInventory.destroy();
    if (this.shopPanel) this.shopPanel.destroy();

    this.layer.destroy();
  }
}
