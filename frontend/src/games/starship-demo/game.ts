import { Application, Assets, Container, type Spritesheet, type Texture } from "pixi.js";
import { MANIFEST, ENGINE_ALIASES, ASTEROID_ALIASES, COLOR_PRESET_ALIASES } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SPAWN_INTERVAL, ASTEROID_SPAWN_INTERVAL } from "./constants";
import { createTiledBackground } from "./background";
import { createRandomPlanet } from "./planets";
import { createShip, updateShips, type ShipEntity } from "./ships";
import { createAsteroid, updateAsteroids, type AsteroidEntity } from "./asteroids";
import { StarParticleManager } from "./particles";

interface LoadedAssets {
  background: Texture;
  planets: Spritesheet;
  planetsRing: Spritesheet;
  starsParticle: Spritesheet;
  spaceships: Spritesheet;
  spaceshipsColormap: Spritesheet;
  engines: Record<string, Spritesheet>;
  asteroids: Record<string, Spritesheet>;
  colorPresets: Record<string, Texture>;
}

function setNearestNeighbor(sheet: Spritesheet): void {
  sheet.textureSource.style.scaleMode = "nearest";
}

export class StarshipDemoGame {
  private app: Application;
  private assets!: LoadedAssets;

  private shipLayer!: Container;
  private asteroidLayer!: Container;

  private ships: ShipEntity[] = [];
  private asteroidEntities: AsteroidEntity[] = [];
  private starParticles!: StarParticleManager;

  private shipSpawnTimer = 0;
  private asteroidSpawnTimer = 0;
  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
  }

  async init(): Promise<void> {
    const bundle = MANIFEST.bundles[0];
    Assets.addBundle(bundle.name, bundle.assets);
    const raw = await Assets.loadBundle("starship-demo");

    this.assets = {
      background: raw["background"] as Texture,
      planets: raw["planets"] as Spritesheet,
      planetsRing: raw["planets-ring"] as Spritesheet,
      starsParticle: raw["stars-particle"] as Spritesheet,
      spaceships: raw["spaceships"] as Spritesheet,
      spaceshipsColormap: raw["spaceships-colormap"] as Spritesheet,
      engines: Object.fromEntries(
        ENGINE_ALIASES.map((a) => [a, raw[a] as Spritesheet])
      ),
      asteroids: Object.fromEntries(
        ASTEROID_ALIASES.map((a) => [a, raw[a] as Spritesheet])
      ),
      colorPresets: Object.fromEntries(
        COLOR_PRESET_ALIASES.map((a) => [a, raw[a] as Texture])
      ),
    };

    this.applyNearestNeighbor();
    this.buildScene();
    this.tickerCallback = (ticker) => this.update(ticker.deltaMS / 1000);
    this.app.ticker.add(this.tickerCallback);
  }

  private applyNearestNeighbor(): void {
    this.assets.background.source.style.scaleMode = "nearest";

    setNearestNeighbor(this.assets.planets);
    setNearestNeighbor(this.assets.planetsRing);
    setNearestNeighbor(this.assets.starsParticle);
    setNearestNeighbor(this.assets.spaceships);
    setNearestNeighbor(this.assets.spaceshipsColormap);

    for (const sheet of Object.values(this.assets.engines)) {
      setNearestNeighbor(sheet);
    }
    for (const sheet of Object.values(this.assets.asteroids)) {
      setNearestNeighbor(sheet);
    }
    for (const tex of Object.values(this.assets.colorPresets)) {
      tex.source.style.scaleMode = "nearest";
    }
  }

  private buildScene(): void {
    const world = new Container();
    this.app.stage.addChild(world);

    world.addChild(createTiledBackground(this.assets.background));

    this.starParticles = new StarParticleManager(this.assets.starsParticle);
    world.addChild(this.starParticles.container);

    world.addChild(
      createRandomPlanet(this.assets.planets, this.assets.planetsRing)
    );

    this.asteroidLayer = new Container();
    world.addChild(this.asteroidLayer);

    this.shipLayer = new Container();
    world.addChild(this.shipLayer);
  }

  private update(dt: number): void {
    this.starParticles.update(dt);

    this.shipSpawnTimer += dt;
    if (this.shipSpawnTimer >= SHIP_SPAWN_INTERVAL) {
      this.shipSpawnTimer = 0;
      this.spawnShip();
    }

    this.asteroidSpawnTimer += dt;
    if (this.asteroidSpawnTimer >= ASTEROID_SPAWN_INTERVAL) {
      this.asteroidSpawnTimer = 0;
      this.spawnAsteroid();
    }

    this.ships = updateShips(this.ships, dt);
    this.asteroidEntities = updateAsteroids(this.asteroidEntities, dt);
  }

  private spawnShip(): void {
    const ship = createShip(
      this.assets.spaceships,
      this.assets.spaceshipsColormap,
      this.assets.engines,
      this.assets.colorPresets
    );
    this.shipLayer.addChild(ship.container);
    this.ships.push(ship);
  }

  private spawnAsteroid(): void {
    const asteroid = createAsteroid(this.assets.asteroids);
    this.asteroidLayer.addChild(asteroid.sprite);
    this.asteroidEntities.push(asteroid);
  }

  destroy(): void {
    if (this.tickerCallback) {
      this.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
    this.starParticles.destroy();
    for (const s of this.ships) s.container.destroy();
    for (const a of this.asteroidEntities) a.sprite.destroy();
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
