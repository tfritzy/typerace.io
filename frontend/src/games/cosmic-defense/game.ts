import { Application, Container } from "pixi.js";
import { MANIFEST } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";
import { Background } from "./Background";
import { PlanetManager } from "./PlanetManager";
import { EnemyManager } from "./EnemyManager";
import { ExplosionManager } from "./ExplosionManager";
import { ShipManager } from "./ShipManager";
import { DamageNumberManager } from "./DamageNumberManager";
import { LaserBeamManager } from "./LaserBeamManager";
import { ProjectileManager } from "./ProjectileManager";
import { GemManager } from "./GemManager";
import { AssetManager } from "./assetManager";
import { RelicPickupManager } from "./RelicPickupManager";
import { createGameState, updateState, onCorrectKeystroke as stateOnCorrectKeystroke, onPerfectWord as stateOnPerfectWord, onWordWithError as stateOnWordWithError, pauseGame, unpauseGame } from "./state";
import type { GameState } from "./state";
import type { EntityType } from "./types";
import { SHIP_BLUEPRINTS } from "./shipCatalog";

export class CosmicDefenseGame {
  private app: Application;
  private assetManager!: AssetManager;
  state: GameState;
  shipPreviews: Map<EntityType, string> = new Map();

  private background!: Background;
  private planetManager!: PlanetManager;
  private enemyManager!: EnemyManager;
  private explosionManager!: ExplosionManager;
  private damageNumberManager!: DamageNumberManager;
  private laserBeamManager!: LaserBeamManager;
  private projectileManager!: ProjectileManager;
  private gemManager!: GemManager;
  private relicPickupManager!: RelicPickupManager;
  shipManager!: ShipManager;

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
    this.state = createGameState();
  }

  async init(): Promise<void> {
    this.assetManager = await AssetManager.load(MANIFEST);
    this.buildScene(this.assetManager);
    const baseTypes = SHIP_BLUEPRINTS.map((bp) => bp.entityType);
    this.shipPreviews = await this.assetManager.generateShipPreviews(this.app, baseTypes);

    this.tickerCallback = (ticker) => this.update(ticker.deltaMS / 1000);
    this.app.ticker.add(this.tickerCallback);
  }

  onCorrectKeystroke(): void {
    stateOnCorrectKeystroke(this.state);
  }

  onWordCompleted(perfect: boolean): void {
    if (perfect) {
      stateOnPerfectWord(this.state);
    } else {
      stateOnWordWithError(this.state);
    }
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

    this.laserBeamManager = new LaserBeamManager();
    world.addChild(this.laserBeamManager.layer);

    this.projectileManager = new ProjectileManager();
    world.addChild(this.projectileManager.layer);

    this.enemyManager = new EnemyManager(assetManager);
    this.enemyManager.subscribe(this.state);
    world.addChild(this.enemyManager.layer);

    this.explosionManager = new ExplosionManager(assetManager);
    world.addChild(this.explosionManager.layer);

    this.gemManager = new GemManager();
    this.gemManager.subscribe(this.state);
    world.addChild(this.gemManager.layer);

    this.damageNumberManager = new DamageNumberManager();
    this.damageNumberManager.subscribe(this.state);
    world.addChild(this.damageNumberManager.container);

    this.relicPickupManager = new RelicPickupManager(assetManager);
    this.relicPickupManager.subscribe(this.state);
    this.app.stage.addChild(this.relicPickupManager.layer);
  }

  pause(): void {
    pauseGame(this.state);
  }

  unpause(): void {
    unpauseGame(this.state);
  }

  private update(dt: number): void {
    try {
      this.explosionManager.update(this.state);
      this.damageNumberManager.update(dt);
      this.relicPickupManager.update(dt);
    } catch (e) {
      console.error("Game loop error (visual update):", e);
    }

    if (this.state.paused) return;

    try {
      updateState(this.state, dt);
      this.enemyManager.update(this.state, dt);
      this.laserBeamManager.update(this.state);
      this.projectileManager.update(this.state);
      this.shipManager.update(this.state, dt);
      this.gemManager.update(this.state, dt);
    } catch (e) {
      console.error("Game loop error (simulation update):", e);
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
    this.explosionManager.destroy();
    this.laserBeamManager.destroy();
    this.projectileManager.destroy();
    this.gemManager.destroy();
    this.damageNumberManager.destroy();
    this.relicPickupManager.destroy();
    this.shipManager.destroy();
    this.app.destroy(true);
  }
}

export async function createCosmicDefenseGame(
  container: HTMLElement
): Promise<CosmicDefenseGame> {
  const app = new Application();
  await app.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: 0x0a0a1a,
    antialias: false,
    resolution: 1,
    autoDensity: false,
    roundPixels: true,
    preserveDrawingBuffer: true,
  });

  app.canvas.style.width = "100%";
  app.canvas.style.height = "auto";
  app.canvas.style.aspectRatio = "16/9";

  container.appendChild(app.canvas);

  const game = new CosmicDefenseGame(app);
  await game.init();
  return game;
}
