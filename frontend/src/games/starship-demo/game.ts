import { Application, Container, Sprite, AnimatedSprite } from "pixi.js";
import { MANIFEST, ENGINE_ALIASES, ASTEROID_ALIASES, COLOR_PRESET_ALIASES } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SCALE, ASTEROID_SCALE, PLANET_SCALE } from "./constants";
import { createTiledBackground } from "./background";
import { StarParticleManager } from "./particles";
import { AssetManager } from "./assetManager";
import {
  createInitialState,
  updateState,
  type GameState,
  type ShipState,
  type AsteroidState,
} from "./state";
import { applyPaletteSwap } from "./ships";

export class StarshipDemoGame {
  private app: Application;
  private assetManager!: AssetManager;
  state!: GameState;

  private shipLayer!: Container;
  private asteroidLayer!: Container;
  private starParticles!: StarParticleManager;

  private shipContainers = new Map<number, Container>();
  private asteroidSprites = new Map<number, Sprite>();

  private shipFrameNames: string[] = [];
  private asteroidTextureCounts: Record<string, number> = {};

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
  }

  async init(): Promise<void> {
    this.assetManager = await AssetManager.load(
      MANIFEST,
      "starship-demo",
      ENGINE_ALIASES,
      ASTEROID_ALIASES,
      COLOR_PRESET_ALIASES
    );

    const assets = this.assetManager.assets;
    this.shipFrameNames = Object.keys(assets.spaceships.textures);

    for (const alias of ASTEROID_ALIASES) {
      this.asteroidTextureCounts[alias] = Object.keys(
        assets.asteroids[alias].textures
      ).length;
    }

    const planetFrames = [
      ...Object.keys(assets.planets.textures),
      ...Object.keys(assets.planetsRing.textures),
    ];

    this.state = createInitialState(planetFrames);
    this.buildScene();

    this.tickerCallback = (ticker) => this.update(ticker.deltaMS / 1000);
    this.app.ticker.add(this.tickerCallback);
  }

  private buildScene(): void {
    const assets = this.assetManager.assets;
    const world = new Container();
    this.app.stage.addChild(world);

    world.addChild(createTiledBackground(assets.background));

    this.starParticles = new StarParticleManager(assets.starsParticle);
    world.addChild(this.starParticles.container);

    const planetTexture =
      assets.planets.textures[this.state.planetFrame] ??
      assets.planetsRing.textures[this.state.planetFrame];
    const planet = new Sprite(planetTexture);
    planet.anchor.set(0.5);
    planet.scale.set(PLANET_SCALE);
    planet.x = CANVAS_WIDTH / 2;
    planet.y = CANVAS_HEIGHT / 2;
    world.addChild(planet);

    this.asteroidLayer = new Container();
    world.addChild(this.asteroidLayer);

    this.shipLayer = new Container();
    world.addChild(this.shipLayer);
  }

  private createShipContainer(ship: ShipState): Container {
    const assets = this.assetManager.assets;

    const shipTexture = applyPaletteSwap(
      assets.spaceships.textures[ship.shipFrame],
      assets.spaceshipsColormap.textures[ship.colormapFrame],
      assets.colorPresets[ship.presetAlias]
    );

    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);

    const engineSheet = assets.engines[ship.engineAlias];
    const engineFrames = engineSheet.animations[ship.engineAlias];
    const engine = new AnimatedSprite(engineFrames);
    engine.animationSpeed = 0.15;
    engine.play();
    engine.anchor.set(0.5);
    engine.x = -(shipTexture.width / 2) + 2;

    const container = new Container();
    container.addChild(engine);
    container.addChild(shipSprite);
    container.scale.set(SHIP_SCALE);
    container.x = ship.x;
    container.y = ship.y;

    return container;
  }

  private createAsteroidSprite(asteroid: AsteroidState): Sprite {
    const assets = this.assetManager.assets;
    const sheet = assets.asteroids[asteroid.asteroidAlias];
    const textures = Object.values(sheet.textures);
    const texture = textures[asteroid.textureIndex % textures.length];

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale.set(ASTEROID_SCALE);
    sprite.x = asteroid.x;
    sprite.y = asteroid.y;
    sprite.rotation = asteroid.rotation;

    return sprite;
  }

  private update(dt: number): void {
    this.starParticles.update(dt);

    const result = updateState(
      this.state,
      dt,
      this.shipFrameNames,
      this.asteroidTextureCounts
    );

    if (result.newShip) {
      const container = this.createShipContainer(result.newShip);
      this.shipLayer.addChild(container);
      this.shipContainers.set(result.newShip.id, container);
    }

    if (result.newAsteroid) {
      const sprite = this.createAsteroidSprite(result.newAsteroid);
      this.asteroidLayer.addChild(sprite);
      this.asteroidSprites.set(result.newAsteroid.id, sprite);
    }

    for (const ship of this.state.ships) {
      const container = this.shipContainers.get(ship.id);
      if (container) {
        container.x = ship.x;
        container.y = ship.y;
      }
    }

    for (const asteroid of this.state.asteroids) {
      const sprite = this.asteroidSprites.get(asteroid.id);
      if (sprite) {
        sprite.x = asteroid.x;
        sprite.y = asteroid.y;
        sprite.rotation = asteroid.rotation;
      }
    }

    for (const id of result.removedShipIds) {
      const container = this.shipContainers.get(id);
      if (container) {
        container.destroy();
        this.shipContainers.delete(id);
      }
    }

    for (const id of result.removedAsteroidIds) {
      const sprite = this.asteroidSprites.get(id);
      if (sprite) {
        sprite.destroy();
        this.asteroidSprites.delete(id);
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
    for (const s of this.asteroidSprites.values()) s.destroy();
    this.app.destroy(true);
  }
}

export async function createStarshipDemoGame(
  container: HTMLElement
): Promise<StarshipDemoGame> {
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

  const game = new StarshipDemoGame(app);
  await game.init();
  return game;
}
