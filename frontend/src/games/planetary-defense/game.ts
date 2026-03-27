import { Application, Container, Sprite } from "pixi.js";
import { MANIFEST } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLANET_SCALE } from "./constants";
import { createTiledBackground } from "./background";
import { StarParticleManager } from "./particles";
import { AssetManager } from "./assetManager";
import {
  createInitialState,
  updateState,
  type GameState,
} from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import { createMeteorSprite } from "./prefabs/meteorPrefab";

export class PlanetaryDefenseGame {
  private app: Application;
  private assetManager!: AssetManager;
  state!: GameState;

  private shipLayer!: Container;
  private meteorLayer!: Container;
  private starParticles!: StarParticleManager;

  private shipContainers = new Map<number, Container>();
  private meteorSprites = new Map<number, Sprite>();

  private activeShipIds = new Set<number>();
  private activeMeteorIds = new Set<number>();

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

    world.addChild(createTiledBackground(this.assetManager.background));

    this.starParticles = new StarParticleManager(this.assetManager.starsParticle);
    world.addChild(this.starParticles.container);

    const planetTextures = Object.values(this.assetManager.planets.textures);
    const planet = new Sprite(planetTextures[0]);
    planet.anchor.set(0.5);
    planet.scale.set(PLANET_SCALE);
    planet.x = CANVAS_WIDTH / 2;
    planet.y = CANVAS_HEIGHT / 2;
    world.addChild(planet);

    this.meteorLayer = new Container();
    world.addChild(this.meteorLayer);

    this.shipLayer = new Container();
    world.addChild(this.shipLayer);
  }

  private update(dt: number): void {
    this.starParticles.update(dt);
    updateState(this.state, dt);
    this.syncRendering();
  }

  private syncRendering(): void {
    this.activeShipIds.clear();
    for (const ship of this.state.ships) {
      this.activeShipIds.add(ship.id);
      let container = this.shipContainers.get(ship.id);
      if (!container) {
        container = createShipContainer(this.assetManager, ship);
        this.shipLayer.addChild(container);
        this.shipContainers.set(ship.id, container);
      }
      container.x = ship.x;
      container.y = ship.y;
    }

    for (const [id, container] of this.shipContainers) {
      if (!this.activeShipIds.has(id)) {
        container.destroy();
        this.shipContainers.delete(id);
      }
    }

    this.activeMeteorIds.clear();
    for (const meteor of this.state.meteors) {
      this.activeMeteorIds.add(meteor.id);
      let sprite = this.meteorSprites.get(meteor.id);
      if (!sprite) {
        sprite = createMeteorSprite(this.assetManager, meteor);
        this.meteorLayer.addChild(sprite);
        this.meteorSprites.set(meteor.id, sprite);
      }
      sprite.x = meteor.x;
      sprite.y = meteor.y;
      sprite.rotation = meteor.rotation;
    }

    for (const [id, sprite] of this.meteorSprites) {
      if (!this.activeMeteorIds.has(id)) {
        sprite.destroy();
        this.meteorSprites.delete(id);
      }
    }
  }

  destroy(): void {
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
    this.starParticles.destroy();
    for (const c of this.shipContainers.values()) c.destroy();
    for (const s of this.meteorSprites.values()) s.destroy();
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
