import { Application, Container } from "pixi.js";
import { MANIFEST } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { Background } from "./Background";
import { PlanetManager } from "./PlanetManager";
import { EnemyManager } from "./EnemyManager";
import { ProjectileManager } from "./ProjectileManager";
import { ExplosionManager } from "./ExplosionManager";
import { ShipManager } from "./ShipManager";
import { AssetManager } from "./assetManager";
import { createGameState, updateState, onCorrectKeystroke as stateOnCorrectKeystroke, WavePhase } from "./state";
import type { GameState } from "./state";
import type { EntityType } from "./types";

export class CosmicDefenseGame {
  private app: Application;
  private assetManager!: AssetManager;
  state: GameState;
  shipPreviews: Map<EntityType, string> = new Map();

  private background!: Background;
  private planetManager!: PlanetManager;
  private enemyManager!: EnemyManager;
  private projectileManager!: ProjectileManager;
  private explosionManager!: ExplosionManager;
  shipManager!: ShipManager;

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
    this.state = createGameState();
  }

  async init(): Promise<void> {
    this.assetManager = await AssetManager.load(MANIFEST);
    this.buildScene(this.assetManager);
    this.shipPreviews = await this.assetManager.generateShipPreviews(this.app);

    this.tickerCallback = (ticker) => this.update(ticker.deltaMS / 1000);
    this.app.ticker.add(this.tickerCallback);
  }

  onCorrectKeystroke(): void {
    stateOnCorrectKeystroke(this.state);
  }

  private buildScene(assetManager: AssetManager): void {
    const world = new Container();
    world.eventMode = "static";
    this.app.stage.addChild(world);

    this.background = new Background(assetManager);
    world.addChild(this.background.container);

    this.planetManager = new PlanetManager(assetManager);
    world.addChild(this.planetManager.container);

    this.shipManager = new ShipManager(assetManager);
    world.addChild(this.shipManager.layer);

    this.projectileManager = new ProjectileManager(assetManager);
    world.addChild(this.projectileManager.layer);

    this.explosionManager = new ExplosionManager(assetManager);
    world.addChild(this.explosionManager.layer);

    this.enemyManager = new EnemyManager(assetManager);
    world.addChild(this.enemyManager.layer);
  }

  private update(dt: number): void {
    updateState(this.state, dt);
    this.enemyManager.update(this.state, dt);
    this.projectileManager.update(this.state);
    this.explosionManager.update(this.state);
    this.shipManager.update(this.state);

    const waveActive = this.state.wave.phase !== WavePhase.Idle;
    if (waveActive !== this.state.waveActive) {
      this.state.waveActive = waveActive;
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
    this.enemyManager.destroy();
    this.projectileManager.destroy();
    this.explosionManager.destroy();
    this.shipManager.destroy();
    this.app.destroy(true);
  }
}

export async function createCosmicDefenseGame(
  container: HTMLElement
): Promise<CosmicDefenseGame> {
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

  const game = new CosmicDefenseGame(app);
  await game.init();
  return game;
}
