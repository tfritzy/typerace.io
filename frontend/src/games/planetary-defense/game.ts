import { Application, Container, Sprite } from "pixi.js";
import { MANIFEST } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLANET_SCALE } from "./constants";
import { Background } from "./Background";
import { EnemyManager } from "./EnemyManager";
import { AssetManager } from "./assetManager";
import {
  createInitialState,
  updateState,
  type GameState,
} from "./state";

export class PlanetaryDefenseGame {
  private app: Application;
  private assetManager!: AssetManager;
  state!: GameState;

  private background!: Background;
  private enemyManager!: EnemyManager;

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
  }

  async init(): Promise<void> {
    this.assetManager = await AssetManager.load(MANIFEST);
    this.state = createInitialState();
    this.buildScene();

    this.tickerCallback = (ticker) => this.update(ticker.deltaMS / 1000);
    this.app.ticker.add(this.tickerCallback);
  }

  private buildScene(): void {
    const world = new Container();
    this.app.stage.addChild(world);

    this.background = new Background(this.assetManager);
    world.addChild(this.background.container);

    const planetTextures = Object.values(this.assetManager.planets.textures);
    const planet = new Sprite(planetTextures[0]);
    planet.anchor.set(0.5);
    planet.scale.set(PLANET_SCALE);
    planet.x = CANVAS_WIDTH / 2;
    planet.y = CANVAS_HEIGHT / 2;
    world.addChild(planet);

    this.enemyManager = new EnemyManager(this.assetManager);
    world.addChild(this.enemyManager.meteorLayer);
    world.addChild(this.enemyManager.shipLayer);
  }

  private update(dt: number): void {
    this.background.update(dt);
    updateState(this.state, dt);
    this.enemyManager.syncRendering(this.state);
  }

  destroy(): void {
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
    this.background.destroy();
    this.enemyManager.destroy();
    this.app.destroy(true);
  }
}

export async function createPlanetaryDefenseGame(
  container: HTMLElement
): Promise<PlanetaryDefenseGame> {
  const app = new Application();
  await app.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: 0x0a0a1a,
    antialias: false,
    resolution: 1,
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
