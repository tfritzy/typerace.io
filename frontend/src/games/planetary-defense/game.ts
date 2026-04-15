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
import { createGameState, updateState, WavePhase, handleTypedCharacter as stateHandleTypedCharacter, onCorrectKeystroke, toggleMerchantShop } from "./state";
import type { GameState } from "./state";

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

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
    this.state = createGameState();
  }

  get labels(): LabelData[] {
    return this.dropManager?.labels ?? [];
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
    this.merchantManager.onShipClicked((merchant) => toggleMerchantShop(this.state, merchant));
    world.addChild(this.merchantManager.layer);

    this.merchantManager.init(this.state);
  }

  handleTypedCharacter(key: string): void {
    const collected = stateHandleTypedCharacter(this.state, key);
    for (const item of collected) {
      this.state.playerInventory.addToFirstEmpty(item);
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
    if (waveActive !== this.state.waveActive) {
      this.state.waveActive = waveActive;
      this.merchantManager.layer.visible = !waveActive;
      this.state.onWaveActiveChanged.emit();
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
    this.state.playerInventory.destroy();
    if (this.state.activeMerchantInventory) this.state.activeMerchantInventory.destroy();
    for (const m of this.state.merchants) m.shopInventory.destroy();
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
    antialias: true,
    resolution,
    autoDensity: true,
    roundPixels: true,
    preserveDrawingBuffer: true,
  });

  app.canvas.style.width = "100%";
  app.canvas.style.height = "auto";
  app.canvas.style.aspectRatio = "16/9";

  container.appendChild(app.canvas);

  const game = new PlanetaryDefenseGame(app);
  await game.init();
  return game;
}
