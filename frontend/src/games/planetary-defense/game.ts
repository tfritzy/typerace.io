import { Application, Container } from "pixi.js";
import { MANIFEST } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT_FAMILY } from "./constants";
import { Background } from "./Background";
import { PlanetManager } from "./PlanetManager";
import { EnemyManager } from "./EnemyManager";
import { RelicManager } from "./RelicManager";
import { ProjectileManager } from "./ProjectileManager";
import { DamageNumberManager } from "./DamageNumberManager";
import { DropManager } from "./DropManager";
import type { LabelData } from "./DropManager";
import { MerchantManager } from "./MerchantManager";
import { AssetManager } from "./assetManager";
import { InventoryState } from "./inventoryState";
import { createGameState, updateState, getRelicPosition, WavePhase, handleTypedCharacter as stateHandleTypedCharacter, onCorrectKeystroke } from "./state";
import type { GameState, RelicState, MerchantShipState } from "./state";
import { RELIC_SLOT_COUNT, RelicType, RELIC_CONFIGS } from "./relicConfig";

export type { LabelData };

export class PlanetaryDefenseGame {
  private app: Application;
  private assetManager!: AssetManager;
  state: GameState;

  private background!: Background;
  private planetManager!: PlanetManager;
  private enemyManager!: EnemyManager;
  private relicManager!: RelicManager;
  private projectileManager!: ProjectileManager;
  private damageNumberManager!: DamageNumberManager;
  private dropManager!: DropManager;
  private merchantManager!: MerchantManager;

  private inventory_!: InventoryState;
  private weaponSlots_: InventoryState[] = [];
  private merchantInventory_: InventoryState | null = null;
  private activeMerchant_: MerchantShipState | null = null;
  private merchantChangeListeners_ = new Set<() => void>();
  private waveActive_ = false;
  private waveActiveListeners_ = new Set<() => void>();

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
    this.state = createGameState();
  }

  get labels(): LabelData[] {
    return this.dropManager?.labels ?? [];
  }

  get playerInventory(): InventoryState {
    return this.inventory_;
  }

  get weaponSlotInventories(): InventoryState[] {
    return this.weaponSlots_;
  }

  get activeMerchantInventory(): InventoryState | null {
    return this.merchantInventory_;
  }

  get isWaveActive(): boolean {
    return this.waveActive_;
  }

  onWaveActiveChanged(fn: () => void): () => void {
    this.waveActiveListeners_.add(fn);
    return () => this.waveActiveListeners_.delete(fn);
  }

  onMerchantChanged(fn: () => void): () => void {
    this.merchantChangeListeners_.add(fn);
    return () => this.merchantChangeListeners_.delete(fn);
  }

  getAllInventories(): InventoryState[] {
    const invs: InventoryState[] = [this.inventory_, ...this.weaponSlots_];
    if (this.merchantInventory_) invs.push(this.merchantInventory_);
    return invs;
  }

  getItemTextureUrl(alias: string): string {
    return this.assetManager.getItemTextureUrl(alias);
  }

  getWeaponSlotPosition(index: number): { x: number; y: number } {
    const slot = this.state.relicSlots[index];
    return getRelicPosition(slot);
  }

  async init(): Promise<void> {
    await this.waitForPixelFont();
    this.assetManager = await AssetManager.load(MANIFEST);
    this.buildScene();

    this.tickerCallback = (ticker) => this.update(ticker.deltaMS / 1000);
    this.app.ticker.add(this.tickerCallback);
  }

  private async waitForPixelFont(): Promise<void> {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    try {
      const font = new FontFace(
        PIXEL_FONT_FAMILY,
        "url(/fonts/press-start-2p.ttf)"
      );
      const loaded = await Promise.race([
        font.load(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);
      if (loaded) {
        document.fonts.add(font);
      }
    } catch {
    }
  }

  private buildScene(): void {
    const world = new Container();
    world.eventMode = "static";
    this.app.stage.addChild(world);

    this.background = new Background(this.assetManager);
    world.addChild(this.background.container);

    this.planetManager = new PlanetManager(this.assetManager);
    world.addChild(this.planetManager.container);

    this.relicManager = new RelicManager();
    world.addChild(this.relicManager.container);

    this.projectileManager = new ProjectileManager();
    world.addChild(this.projectileManager.container);

    this.damageNumberManager = new DamageNumberManager();
    this.damageNumberManager.subscribe(this.state);
    world.addChild(this.damageNumberManager.container);

    this.enemyManager = new EnemyManager(this.assetManager);
    world.addChild(this.enemyManager.layer);

    this.dropManager = new DropManager(this.assetManager);
    world.addChild(this.dropManager.layer);

    this.merchantManager = new MerchantManager(this.assetManager);
    this.merchantManager.onShipClicked((merchant) => this.toggleMerchantShop(merchant));
    world.addChild(this.merchantManager.layer);

    this.inventory_ = new InventoryState("player", 10, 2);
    this.populateTestData();
    this.inventory_.addToFirstEmpty({ type: "Gold", amount: 100 });

    this.merchantManager.init(this.state);

    this.buildWeaponSlots();
  }

  private populateTestData(): void {
    this.inventory_.addItem({ type: RelicType.StarfallStiletto, amount: 1 }, 0, 0);
    this.inventory_.addItem({ type: RelicType.BloodthornDirk, amount: 1 }, 1, 0);
    this.inventory_.addItem({ type: RelicType.EmbercrestBlade, amount: 1 }, 2, 0);
    this.inventory_.addItem({ type: RelicType.BriarthornSaber, amount: 1 }, 3, 0);
    this.inventory_.addItem({ type: RelicType.TwinflareCrossblades, amount: 1 }, 4, 0);
    this.inventory_.addItem({ type: RelicType.CloudveilLongsword, amount: 1 }, 5, 0);
    this.inventory_.addItem({ type: RelicType.SteelBattleaxe, amount: 1 }, 6, 0);
    this.inventory_.addItem({ type: RelicType.MoltenZweihander, amount: 1 }, 7, 0);
    this.inventory_.addItem({ type: RelicType.MoonlitHatchet, amount: 1 }, 8, 0);
    this.inventory_.addItem({ type: RelicType.FrostfangClaymore, amount: 1 }, 9, 0);
  }

  private buildWeaponSlots(): void {
    for (let i = 0; i < RELIC_SLOT_COUNT; i++) {
      const slot = this.state.relicSlots[i];
      const weaponSlot = new InventoryState(`weapon-${i}`, 1, 1);

      if (slot.relic) {
        weaponSlot.addItem({ type: slot.relic.type, amount: 1 }, 0, 0);
      }

      const slotIndex = i;
      weaponSlot.onItemAdded((invItem) => {
        if (!invItem.item) return;
        const relicType = invItem.item.type as RelicType;
        if (!(relicType in RELIC_CONFIGS)) return;
        const relic: RelicState = {
          type: relicType,
          item: invItem.item,
          level: 1,
          charge: 0,
          remainingShots: 0,
          nextShotTime: 0,
        };
        this.state.relicSlots[slotIndex].relic = relic;
      });

      weaponSlot.onItemRemoved(() => {
        this.state.relicSlots[slotIndex].relic = null;
      });

      this.weaponSlots_.push(weaponSlot);
    }
  }

  private toggleMerchantShop(merchant: MerchantShipState): void {
    if (this.activeMerchant_?.id === merchant.id) {
      this.closeMerchantShop();
      return;
    }

    this.closeMerchantShop();
    this.openMerchantShop(merchant);
  }

  private openMerchantShop(merchant: MerchantShipState): void {
    this.activeMerchant_ = merchant;
    const cols = 3;
    const rows = Math.ceil(merchant.items.length / cols);
    this.merchantInventory_ = new InventoryState("merchant", cols, rows);

    for (let i = 0; i < merchant.items.length; i++) {
      const item = merchant.items[i];
      const gridX = i % cols;
      const gridY = Math.floor(i / cols);
      this.merchantInventory_.addItem(item, gridX, gridY);
    }

    for (const fn of this.merchantChangeListeners_) fn();
  }

  private closeMerchantShop(): void {
    if (this.merchantInventory_) {
      this.merchantInventory_.destroy();
      this.merchantInventory_ = null;
    }
    this.activeMerchant_ = null;
    for (const fn of this.merchantChangeListeners_) fn();
  }

  handleTypedCharacter(key: string): void {
    const collected = stateHandleTypedCharacter(this.state, key);
    for (const item of collected) {
      this.inventory_.addToFirstEmpty(item);
    }
  }

  onCorrectKeystroke(): void {
    onCorrectKeystroke(this.state);
  }

  private update(dt: number): void {
    this.background.update(dt);
    updateState(this.state, dt);
    this.enemyManager.update(this.state, dt);
    this.relicManager.update(this.state);
    this.projectileManager.update(this.state);
    this.damageNumberManager.update(dt);
    this.dropManager.update(this.state);
    this.merchantManager.update(this.state);

    const waveActive = this.state.wave.phase !== WavePhase.Idle;
    if (waveActive !== this.waveActive_) {
      this.waveActive_ = waveActive;
      this.merchantManager.layer.visible = !waveActive;
      for (const fn of this.waveActiveListeners_) fn();
    }
  }

  destroy(): void {
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
    this.background.destroy();
    this.planetManager.destroy();
    this.relicManager.destroy();
    this.projectileManager.destroy();
    this.damageNumberManager.destroy();
    this.dropManager.destroy();
    this.enemyManager.destroy();
    this.merchantManager.destroy();
    this.inventory_.destroy();
    for (const ws of this.weaponSlots_) ws.destroy();
    this.weaponSlots_ = [];
    if (this.merchantInventory_) this.merchantInventory_.destroy();
    this.app.destroy(true);
  }
}

export async function createPlanetaryDefenseGame(
  container: HTMLElement
): Promise<PlanetaryDefenseGame> {
  const app = new Application();
  const resolution = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  await app.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: 0x0a0a1a,
    antialias: false,
    resolution,
    autoDensity: true,
    roundPixels: true,
    preserveDrawingBuffer: true,
  });

  app.canvas.style.width = "100%";
  app.canvas.style.height = "auto";
  app.canvas.style.aspectRatio = "16/9";
  app.canvas.style.imageRendering = "pixelated";
  container.appendChild(app.canvas);

  const game = new PlanetaryDefenseGame(app);
  await game.init();
  return game;
}
