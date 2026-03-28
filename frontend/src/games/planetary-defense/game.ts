import { Application, Container } from "pixi.js";
import { MANIFEST } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT } from "./constants";
import { Background } from "./Background";
import { PlanetManager } from "./PlanetManager";
import { EnemyManager } from "./EnemyManager";
import { AssetManager } from "./assetManager";
import { createGameState, updateState } from "./state";
import type { GameState } from "./state";

export class PlanetaryDefenseGame {
  private app: Application;
  private assetManager!: AssetManager;
  state: GameState;

  private background!: Background;
  private planetManager!: PlanetManager;
  private enemyManager!: EnemyManager;

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
    this.state = createGameState();
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
    let timedOut = false;
    await Promise.race([
      document.fonts.load(`16px "${PIXEL_FONT}"`),
      new Promise<void>((resolve) =>
        setTimeout(() => {
          timedOut = true;
          resolve();
        }, 1000)
      ),
    ]);
    if (timedOut) {
      console.warn(`Timed out loading font "${PIXEL_FONT}" for Planetary Defense labels.`);
    }
  }

  private buildScene(): void {
    const world = new Container();
    this.app.stage.addChild(world);

    this.background = new Background(this.assetManager);
    world.addChild(this.background.container);

    this.planetManager = new PlanetManager(this.assetManager);
    world.addChild(this.planetManager.container);

    this.enemyManager = new EnemyManager(this.assetManager);
    world.addChild(this.enemyManager.meteorLayer);
    world.addChild(this.enemyManager.shipLayer);
  }

  private update(dt: number): void {
    this.background.update(dt);
    updateState(this.state, dt);
    this.enemyManager.update(this.state, dt);
  }

  destroy(): void {
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
    this.background.destroy();
    this.planetManager.destroy();
    this.enemyManager.destroy();
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
