import { Application, Assets, Container, type Texture } from "pixi.js";
import { MANIFEST } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SPAWN_INTERVAL_MS, ASTEROID_SPAWN_INTERVAL_MS } from "./constants";
import { createTiledBackground } from "./background";
import { buildPlanetTextures, buildPlanetRingTextures, createRandomPlanet } from "./planets";
import { preloadShipImages, createShip, updateShips, type ShipEntity } from "./ships";
import { createAsteroid, updateAsteroids, type AsteroidEntity } from "./asteroids";
import { buildStarParticleTextures, StarParticleManager } from "./particles";

export class StarshipDemoGame {
  private app: Application;
  private world!: Container;
  private shipLayer!: Container;
  private asteroidLayer!: Container;

  private ships: ShipEntity[] = [];
  private asteroids: AsteroidEntity[] = [];
  private assets!: Record<string, Texture>;

  private shipSpawnTimer = 0;
  private asteroidSpawnTimer = 0;
  private starParticles!: StarParticleManager;

  constructor(app: Application) {
    this.app = app;
  }

  async init(): Promise<void> {
    const bundle = MANIFEST.bundles[0];
    Assets.addBundle(bundle.name, bundle.assets);
    this.assets = await Assets.loadBundle("starship-demo") as Record<string, Texture>;
    await preloadShipImages();

    this.buildScene();
    this.app.ticker.add((ticker) => this.update(ticker.deltaMS / 1000));
  }

  private buildScene(): void {
    this.world = new Container();
    this.app.stage.addChild(this.world);

    const bg = createTiledBackground(this.assets["background"]);
    this.world.addChild(bg);

    const starTextures = buildStarParticleTextures(this.assets["stars-particle"]);
    this.starParticles = new StarParticleManager(starTextures);
    this.world.addChild(this.starParticles.container);

    const planetTextures = buildPlanetTextures(this.assets["planet-sheet"]);
    const planetRingTextures = buildPlanetRingTextures(this.assets["planet-ring-sheet"]);
    const planet = createRandomPlanet(planetTextures, planetRingTextures);
    this.world.addChild(planet);

    this.asteroidLayer = new Container();
    this.world.addChild(this.asteroidLayer);

    this.shipLayer = new Container();
    this.world.addChild(this.shipLayer);
  }

  private update(dt: number): void {
    this.starParticles.update(dt);

    this.shipSpawnTimer += dt * 1000;
    if (this.shipSpawnTimer >= SHIP_SPAWN_INTERVAL_MS) {
      this.shipSpawnTimer = 0;
      this.spawnShip();
    }

    this.asteroidSpawnTimer += dt * 1000;
    if (this.asteroidSpawnTimer >= ASTEROID_SPAWN_INTERVAL_MS) {
      this.asteroidSpawnTimer = 0;
      this.spawnAsteroid();
    }

    this.ships = updateShips(this.ships, dt);
    this.asteroids = updateAsteroids(this.asteroids, dt);
  }

  private spawnShip(): void {
    const ship = createShip(this.assets);
    this.shipLayer.addChild(ship.container);
    this.ships.push(ship);
  }

  private spawnAsteroid(): void {
    const asteroid = createAsteroid(this.assets);
    this.asteroidLayer.addChild(asteroid.sprite);
    this.asteroids.push(asteroid);
  }

  destroy(): void {
    this.starParticles.destroy();
    for (const s of this.ships) s.container.destroy();
    for (const a of this.asteroids) a.sprite.destroy();
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
