import { Application, Container, Sprite, AnimatedSprite } from "pixi.js";
import { MANIFEST, ENGINE_ALIASES, ASTEROID_ALIASES, COLOR_PRESET_ALIASES } from "./manifest";
import { CANVAS_WIDTH, CANVAS_HEIGHT, SHIP_SCALE, ASTEROID_SCALE, PLANET_SCALE } from "./constants";
import { createTiledBackground } from "./background";
import { StarParticleManager } from "./particles";
import { AssetManager } from "./assetManager";
import {
  createInitialState,
  updateState,
  spawnMeteorAt,
  type GameState,
  type ShipState,
  type MeteorState,
} from "./state";
import { applyPaletteSwap } from "./ships";
import { MeteorType } from "./types";

const ENGINE_TYPE_TO_ALIAS = ENGINE_ALIASES;
const COLOR_PRESET_TO_ALIAS = COLOR_PRESET_ALIASES;
const METEOR_TYPE_TO_ALIAS: Record<MeteorType, string> = {
  [MeteorType.LargeBrown]: "asteroids-big-brown",
  [MeteorType.LargeWhite]: "asteroids-big-white",
  [MeteorType.SmallBrown]: "asteroids-small-brown",
  [MeteorType.SmallWhite]: "asteroids-small-white",
};

export class PlanetaryDefenseGame {
  private app: Application;
  private assetManager!: AssetManager;
  state!: GameState;

  private shipLayer!: Container;
  private meteorLayer!: Container;
  private starParticles!: StarParticleManager;

  private shipContainers = new Map<number, Container>();
  private meteorSprites = new Map<number, Sprite>();

  private meteorVariantCounts: Record<MeteorType, number> = {
    [MeteorType.LargeBrown]: 1,
    [MeteorType.LargeWhite]: 1,
    [MeteorType.SmallBrown]: 1,
    [MeteorType.SmallWhite]: 1,
  };

  private tickerCallback: ((ticker: { deltaMS: number }) => void) | null = null;

  constructor(app: Application) {
    this.app = app;
  }

  async init(): Promise<void> {
    this.assetManager = await AssetManager.load(
      MANIFEST,
      "planetary-defense",
      ENGINE_ALIASES,
      ASTEROID_ALIASES,
      COLOR_PRESET_ALIASES
    );

    const assets = this.assetManager.assets;

    for (const [meteorType, alias] of Object.entries(METEOR_TYPE_TO_ALIAS)) {
      this.meteorVariantCounts[Number(meteorType) as MeteorType] = Object.keys(
        assets.asteroids[alias].textures
      ).length;
    }

    this.state = createInitialState();
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

    const planetTextures = Object.values(assets.planets.textures);
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

  private createShipContainer(ship: ShipState): Container {
    const assets = this.assetManager.assets;

    const shipFrameName = `ship-${ship.shipType}`;
    const colormapFrameName = `cm-${ship.shipType}`;
    const presetAlias = COLOR_PRESET_TO_ALIAS[ship.colorPreset];
    const engineAlias = ENGINE_TYPE_TO_ALIAS[ship.engineType];

    const shipTexture = applyPaletteSwap(
      assets.spaceships.textures[shipFrameName],
      assets.spaceshipsColormap.textures[colormapFrameName],
      assets.colorPresets[presetAlias]
    );

    const shipSprite = new Sprite(shipTexture);
    shipSprite.anchor.set(0.5);

    const engineSheet = assets.engines[engineAlias];
    const engineFrames = engineSheet.animations[engineAlias];
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

  private createMeteorSprite(meteor: MeteorState): Sprite {
    const assets = this.assetManager.assets;
    const alias = METEOR_TYPE_TO_ALIAS[meteor.meteorType];
    const sheet = assets.asteroids[alias];
    const textures = Object.values(sheet.textures);
    const texture = textures[meteor.variant % textures.length];

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale.set(ASTEROID_SCALE);
    sprite.x = meteor.x;
    sprite.y = meteor.y;
    sprite.rotation = meteor.rotation;

    return sprite;
  }

  handleSpawnMeteor(canvasX: number, canvasY: number): void {
    const meteor = spawnMeteorAt(
      this.state,
      this.meteorVariantCounts,
      canvasX,
      canvasY
    );
    const sprite = this.createMeteorSprite(meteor);
    this.meteorLayer.addChild(sprite);
    this.meteorSprites.set(meteor.id, sprite);
  }

  private update(dt: number): void {
    this.starParticles.update(dt);

    const result = updateState(
      this.state,
      dt,
      this.meteorVariantCounts
    );

    if (result.newShip) {
      const container = this.createShipContainer(result.newShip);
      this.shipLayer.addChild(container);
      this.shipContainers.set(result.newShip.id, container);
    }

    if (result.newMeteor) {
      const sprite = this.createMeteorSprite(result.newMeteor);
      this.meteorLayer.addChild(sprite);
      this.meteorSprites.set(result.newMeteor.id, sprite);
    }

    for (const ship of this.state.ships) {
      const container = this.shipContainers.get(ship.id);
      if (container) {
        container.x = ship.x;
        container.y = ship.y;
      }
    }

    for (const meteor of this.state.meteors) {
      const sprite = this.meteorSprites.get(meteor.id);
      if (sprite) {
        sprite.x = meteor.x;
        sprite.y = meteor.y;
        sprite.rotation = meteor.rotation;
      }
    }

    for (const id of result.removedShipIds) {
      const container = this.shipContainers.get(id);
      if (container) {
        container.destroy();
        this.shipContainers.delete(id);
      }
    }

    for (const id of result.removedMeteorIds) {
      const sprite = this.meteorSprites.get(id);
      if (sprite) {
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
