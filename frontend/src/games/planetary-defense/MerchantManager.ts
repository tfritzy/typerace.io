import { Container, Circle } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, MerchantShipState } from "./state";
import { createEntityState } from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import { ColorPreset } from "./types";

const CLICK_RADIUS = 50;

export class MerchantManager {
  readonly layer: Container;

  private assets: AssetManager;
  private shipDisplays = new Map<number, Container>();
  private clickHandler: ((merchant: MerchantShipState) => void) | null = null;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
    this.layer.eventMode = "static";
  }

  onShipClicked(handler: (merchant: MerchantShipState) => void): void {
    this.clickHandler = handler;
  }

  init(state: GameState): void {
    for (const merchant of state.merchants) {
      this.createMerchantDisplay(merchant);
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
      if (this.clickHandler) this.clickHandler(merchant);
    });

    this.layer.addChild(display);
    this.shipDisplays.set(merchant.id, display);
  }

  update(_state: GameState): void {}

  destroy(): void {
    for (const d of this.shipDisplays.values()) d.destroy();
    this.shipDisplays.clear();
    this.layer.destroy();
  }
}
