import { Container, Circle, Graphics, Text } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, MerchantShipState } from "./state";
import { createEntityState } from "./state";
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
const DEPART_SPEED = 300;
const OFFSCREEN_BUFFER = 200;
const NAME_LABEL_OFFSET_Y = -45;

interface DepartingShip {
  display: Container;
  x: number;
  y: number;
}

export class MerchantManager {
  readonly layer: Container;

  private assets: AssetManager;
  private shipDisplays = new Map<number, Container>();
  private nameLabels = new Map<number, Container>();
  private shopPanel: Container | null = null;
  private shopInventory: Inventory | null = null;
  private inventoryManager: InventoryManager | null = null;
  private activeMerchantId: number | null = null;
  private departingShips: DepartingShip[] = [];
  private knownMerchantIds = new Set<number>();
  private promptContainer: Container | null = null;
  private selectedMerchantId: number | null = null;

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
      this.createMerchantDisplay(merchant);
      this.knownMerchantIds.add(merchant.id);
    }
    if (state.merchants.length > 0) {
      this.showPrompt();
    }
  }

  private createMerchantDisplay(merchant: MerchantShipState): void {
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
      this.selectMerchant(merchant);
    });

    this.layer.addChild(display);
    this.shipDisplays.set(merchant.id, display);

    this.createNameLabel(merchant);
  }

  private selectMerchant(merchant: MerchantShipState): void {
    if (this.selectedMerchantId !== null && this.selectedMerchantId !== merchant.id) {
      return;
    }

    if (this.selectedMerchantId === null) {
      this.selectedMerchantId = merchant.id;
      this.dismissUnselected(merchant.id);
      this.hidePrompt();
    }

    this.toggleShop(merchant);
  }

  private dismissUnselected(selectedId: number): void {
    for (const [id, display] of this.shipDisplays) {
      if (id === selectedId) continue;
      this.departingShips.push({ display, x: display.x, y: display.y });
      this.shipDisplays.delete(id);
      this.knownMerchantIds.delete(id);

      const label = this.nameLabels.get(id);
      if (label) {
        label.destroy();
        this.nameLabels.delete(id);
      }
    }
  }

  private createNameLabel(merchant: MerchantShipState): void {
    const label = new Container();

    const nameText = new Text({
      text: merchant.name,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: 9,
        fill: 0xffd700,
      },
    });
    nameText.anchor.set(0.5, 1);

    label.addChild(nameText);
    label.x = merchant.x;
    label.y = merchant.y + NAME_LABEL_OFFSET_Y;

    this.layer.addChild(label);
    this.nameLabels.set(merchant.id, label);
  }

  private showPrompt(): void {
    this.hidePrompt();

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
    this.promptContainer.y = CANVAS_HEIGHT / 2 - 280;

    this.layer.addChild(this.promptContainer);
  }

  private hidePrompt(): void {
    if (this.promptContainer) {
      this.promptContainer.destroy();
      this.promptContainer = null;
    }
  }

  private toggleShop(merchant: MerchantShipState): void {
    if (this.activeMerchantId === merchant.id) {
      this.closeShop();
      return;
    }

    this.closeShop();
    this.openShop(merchant);
  }

  update(state: GameState, dt: number): void {
    for (let i = this.departingShips.length - 1; i >= 0; i--) {
      const ship = this.departingShips[i];
      ship.x += DEPART_SPEED * dt;
      ship.display.x = ship.x;
      if (ship.x > CANVAS_WIDTH + OFFSCREEN_BUFFER) {
        ship.display.destroy();
        this.departingShips.splice(i, 1);
      }
    }

    this.syncMerchants(state);
  }

  private syncMerchants(state: GameState): void {
    const currentIds = new Set(state.merchants.map((m) => m.id));

    for (const [id, display] of this.shipDisplays) {
      if (!currentIds.has(id)) {
        this.departingShips.push({ display, x: display.x, y: display.y });
        this.shipDisplays.delete(id);
        this.knownMerchantIds.delete(id);

        const label = this.nameLabels.get(id);
        if (label) {
          label.destroy();
          this.nameLabels.delete(id);
        }
      }
    }

    if (this.activeMerchantId !== null && !currentIds.has(this.activeMerchantId)) {
      this.closeShop();
    }

    let hasNew = false;
    for (const merchant of state.merchants) {
      if (!this.knownMerchantIds.has(merchant.id)) {
        this.createMerchantDisplay(merchant);
        this.knownMerchantIds.add(merchant.id);
        hasNew = true;
      }
    }

    if (hasNew) {
      this.closeShop();
      this.selectedMerchantId = null;
      this.showPrompt();
    }

    if (state.merchants.length === 0) {
      this.hidePrompt();
      this.selectedMerchantId = null;
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

    for (const d of this.departingShips) d.display.destroy();
    this.departingShips.length = 0;

    for (const d of this.nameLabels.values()) d.destroy();
    this.nameLabels.clear();

    this.hidePrompt();

    if (this.shopInventory) this.shopInventory.destroy();
    if (this.shopPanel) this.shopPanel.destroy();

    this.layer.destroy();
  }
}
