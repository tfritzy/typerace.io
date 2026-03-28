import { Container, Sprite, Text, TextStyle } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState } from "./state";
import { spawnShip, spawnMeteor } from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import { createMeteorSprite } from "./prefabs/meteorPrefab";
import { PIXEL_FONT } from "./constants";

export class EnemyManager {
  readonly shipLayer: Container;
  readonly meteorLayer: Container;

  private assets: AssetManager;
  private shipContainers = new Map<number, Container>();
  private meteorSprites = new Map<number, Sprite>();
  private shipTypedLabels = new Map<number, Text>();
  private shipUntypedLabels = new Map<number, Text>();
  private meteorTypedLabels = new Map<number, Text>();
  private meteorUntypedLabels = new Map<number, Text>();
  private activeShipIds = new Set<number>();
  private activeMeteorIds = new Set<number>();
  private shipSpawnTimer = 0;
  private meteorSpawnTimer = 0;
  private untypedLabelStyle = new TextStyle({
    fontFamily: PIXEL_FONT,
    fontSize: 16,
    fontWeight: "bold",
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 4, join: "round" },
  });
  private typedLabelStyle = new TextStyle({
    fontFamily: PIXEL_FONT,
    fontSize: 16,
    fontWeight: "bold",
    fill: 0x90ee90,
    stroke: { color: 0x000000, width: 4, join: "round" },
  });

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.shipLayer = new Container();
    this.meteorLayer = new Container();
  }

  update(state: GameState, dt: number): void {
    this.shipSpawnTimer += dt;
    if (this.shipSpawnTimer >= 3) {
      this.shipSpawnTimer = 0;
      spawnShip(state);
    }

    this.meteorSpawnTimer += dt;
    if (this.meteorSpawnTimer >= 1.5) {
      this.meteorSpawnTimer = 0;
      spawnMeteor(state);
    }

    this.syncRendering(state);
  }

  private syncRendering(state: GameState): void {
    this.activeShipIds.clear();
    for (const ship of state.ships) {
      this.activeShipIds.add(ship.id);
      let container = this.shipContainers.get(ship.id);
      if (!container) {
        container = createShipContainer(this.assets, ship);
        this.shipLayer.addChild(container);
        this.shipContainers.set(ship.id, container);
      }
      container.x = ship.x;
      container.y = ship.y;
      container.rotation = Math.atan2(ship.vy, ship.vx);

      let typedLabel = this.shipTypedLabels.get(ship.id);
      let untypedLabel = this.shipUntypedLabels.get(ship.id);
      if (!typedLabel || !untypedLabel) {
        typedLabel = new Text({
          text: "",
          style: this.typedLabelStyle,
        });
        untypedLabel = new Text({
          text: ship.word,
          style: this.untypedLabelStyle,
        });
        typedLabel.anchor.set(1, 1);
        untypedLabel.anchor.set(0, 1);
        this.shipLayer.addChild(typedLabel);
        this.shipLayer.addChild(untypedLabel);
        this.shipTypedLabels.set(ship.id, typedLabel);
        this.shipUntypedLabels.set(ship.id, untypedLabel);
      }
      const typedText = ship.word.slice(0, ship.typedCount);
      const untypedText = ship.word.slice(ship.typedCount);
      typedLabel.text = typedText;
      untypedLabel.text = untypedText;
      this.positionWordLabels(typedLabel, untypedLabel, ship.x, ship.y - 20);
    }

    for (const [id, container] of this.shipContainers) {
      if (!this.activeShipIds.has(id)) {
        container.destroy();
        this.shipContainers.delete(id);
        const typedLabel = this.shipTypedLabels.get(id);
        const untypedLabel = this.shipUntypedLabels.get(id);
        if (typedLabel) {
          typedLabel.destroy();
          this.shipTypedLabels.delete(id);
        }
        if (untypedLabel) {
          untypedLabel.destroy();
          this.shipUntypedLabels.delete(id);
        }
      }
    }

    this.activeMeteorIds.clear();
    for (const meteor of state.meteors) {
      this.activeMeteorIds.add(meteor.id);
      let sprite = this.meteorSprites.get(meteor.id);
      if (!sprite) {
        sprite = createMeteorSprite(this.assets, meteor);
        this.meteorLayer.addChild(sprite);
        this.meteorSprites.set(meteor.id, sprite);
      }
      sprite.x = meteor.x;
      sprite.y = meteor.y;
      sprite.rotation = meteor.rotation;

      let typedLabel = this.meteorTypedLabels.get(meteor.id);
      let untypedLabel = this.meteorUntypedLabels.get(meteor.id);
      if (!typedLabel || !untypedLabel) {
        typedLabel = new Text({
          text: "",
          style: this.typedLabelStyle,
        });
        untypedLabel = new Text({
          text: meteor.word,
          style: this.untypedLabelStyle,
        });
        typedLabel.anchor.set(1, 1);
        untypedLabel.anchor.set(0, 1);
        this.meteorLayer.addChild(typedLabel);
        this.meteorLayer.addChild(untypedLabel);
        this.meteorTypedLabels.set(meteor.id, typedLabel);
        this.meteorUntypedLabels.set(meteor.id, untypedLabel);
      }
      const typedText = meteor.word.slice(0, meteor.typedCount);
      const untypedText = meteor.word.slice(meteor.typedCount);
      typedLabel.text = typedText;
      untypedLabel.text = untypedText;
      this.positionWordLabels(typedLabel, untypedLabel, meteor.x, meteor.y - 16);
    }

    for (const [id, sprite] of this.meteorSprites) {
      if (!this.activeMeteorIds.has(id)) {
        sprite.destroy();
        this.meteorSprites.delete(id);
        const typedLabel = this.meteorTypedLabels.get(id);
        const untypedLabel = this.meteorUntypedLabels.get(id);
        if (typedLabel) {
          typedLabel.destroy();
          this.meteorTypedLabels.delete(id);
        }
        if (untypedLabel) {
          untypedLabel.destroy();
          this.meteorUntypedLabels.delete(id);
        }
      }
    }
  }

  destroy(): void {
    for (const c of this.shipContainers.values()) c.destroy();
    for (const s of this.meteorSprites.values()) s.destroy();
    for (const l of this.shipTypedLabels.values()) l.destroy();
    for (const l of this.shipUntypedLabels.values()) l.destroy();
    for (const l of this.meteorTypedLabels.values()) l.destroy();
    for (const l of this.meteorUntypedLabels.values()) l.destroy();
    this.shipContainers.clear();
    this.meteorSprites.clear();
    this.shipTypedLabels.clear();
    this.shipUntypedLabels.clear();
    this.meteorTypedLabels.clear();
    this.meteorUntypedLabels.clear();
    this.shipLayer.destroy();
    this.meteorLayer.destroy();
  }

  private positionWordLabels(typedLabel: Text, untypedLabel: Text, centerX: number, y: number): void {
    const typedWidth = typedLabel.width;
    const totalWidth = typedWidth + untypedLabel.width;
    const splitX = Math.round(centerX - totalWidth / 2 + typedWidth);
    typedLabel.x = splitX;
    untypedLabel.x = splitX;
    typedLabel.y = y;
    untypedLabel.y = y;
  }
}
