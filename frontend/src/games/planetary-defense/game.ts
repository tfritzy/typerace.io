import { Application, Container } from "pixi.js";
import { MANIFEST } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT_FAMILY } from "./constants";
import { Background } from "./Background";
import { PlanetManager } from "./PlanetManager";
import { EnemyManager } from "./EnemyManager";
import type { LabelData } from "./EnemyManager";
import { RelicManager } from "./RelicManager";
import { ProjectileManager } from "./ProjectileManager";
import { DamageNumberManager } from "./DamageNumberManager";
import { DropManager } from "./DropManager";
import { Inventory, CELL_SIZE, GRID_PADDING, BORDER_WIDTH } from "./Inventory";
import { InventoryManager } from "./InventoryManager";
import { AssetManager } from "./assetManager";
import { createGameState, updateState, getRelicPosition } from "./state";
import type { GameState, RelicState } from "./state";
import { DropCategory } from "./dropConfig";
import { RELIC_SLOT_COUNT } from "./relicConfig";

export type { LabelData };

const WEAPON_SLOT_CENTER_OFFSET = GRID_PADDING + BORDER_WIDTH + CELL_SIZE / 2;

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
  private inventory!: Inventory;
  private weaponSlots: Inventory[] = [];
  private inventoryManager!: InventoryManager;

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
    this.state = createGameState();
  }

  get labels(): LabelData[] {
    const enemy = this.enemyManager?.labels ?? [];
    const drop = this.dropManager?.labels ?? [];
    return [...enemy, ...drop];
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

    this.dropManager = new DropManager();
    world.addChild(this.dropManager.layer);

    this.inventoryManager = new InventoryManager(this.app, this.assetManager);

    this.inventory = new Inventory(this.assetManager);
    world.addChild(this.inventory.container);
    this.inventory.populateTestData();
    this.inventoryManager.register(this.inventory);

    this.buildWeaponSlots(world);

    this.state.onDropCollected.subscribe((drop) => {
      if (drop.category === DropCategory.Gem && drop.gemType !== undefined && drop.gemQuality !== undefined) {
        this.inventory.addGemToFirstEmpty(drop.gemType, drop.gemQuality);
      }
    });
  }

  private buildWeaponSlots(world: Container): void {
    for (let i = 0; i < RELIC_SLOT_COUNT; i++) {
      const slot = this.state.relicSlots[i];
      const { x, y } = getRelicPosition(slot);

      const weaponSlot = new Inventory(this.assetManager, {
        cols: 1,
        rows: 1,
        x: x - WEAPON_SLOT_CENTER_OFFSET,
        y: y - WEAPON_SLOT_CENTER_OFFSET,
      });

      if (slot.relic) {
        weaponSlot.addItem(slot.relic.type, 0, 0);
      }

      const slotIndex = i;
      weaponSlot.onItemAdded.subscribe((item) => {
        if (item.relicType === undefined) return;
        const relic: RelicState = {
          type: item.relicType,
          level: 1,
          charge: 0,
          remainingShots: 0,
          nextShotTime: 0,
        };
        this.state.relicSlots[slotIndex].relic = relic;
      });

      weaponSlot.onItemRemoved.subscribe(() => {
        this.state.relicSlots[slotIndex].relic = null;
      });

      world.addChild(weaponSlot.container);
      this.weaponSlots.push(weaponSlot);
      this.inventoryManager.register(weaponSlot);
    }
  }

  private update(dt: number): void {
    this.background.update(dt);
    updateState(this.state, dt);
    this.enemyManager.update(this.state, dt);
    this.relicManager.update(this.state);
    this.projectileManager.update(this.state);
    this.damageNumberManager.update(dt);
    this.dropManager.update(this.state);
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
    this.inventory.destroy();
    for (const ws of this.weaponSlots) ws.destroy();
    this.weaponSlots = [];
    this.inventoryManager.destroy();
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
