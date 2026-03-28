import { Container, Sprite, Text, TextStyle } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState } from "./state";
import { spawnShip, spawnMeteor } from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import { createMeteorSprite } from "./prefabs/meteorPrefab";
import { PIXEL_FONT } from "./constants";

class EnemyLabel {
  private typedLabel: Text;
  private untypedLabel: Text;

  constructor(layer: Container, typedStyle: TextStyle, untypedStyle: TextStyle) {
    this.typedLabel = new Text({
      text: "",
      style: typedStyle,
    });
    this.untypedLabel = new Text({
      text: "",
      style: untypedStyle,
    });
    this.typedLabel.anchor.set(1, 1);
    this.untypedLabel.anchor.set(0, 1);
    layer.addChild(this.typedLabel);
    layer.addChild(this.untypedLabel);
  }

  update(word: string, typedCount: number, centerX: number, y: number): void {
    const typedText = word.slice(0, typedCount);
    const untypedText = word.slice(typedCount);
    this.typedLabel.text = typedText;
    this.untypedLabel.text = untypedText;
    const typedWidth = this.typedLabel.width;
    const totalWidth = typedWidth + this.untypedLabel.width;
    const startX = Math.round(centerX - totalWidth / 2);
    this.typedLabel.x = startX;
    this.untypedLabel.x = startX + typedWidth;
    this.typedLabel.y = y;
    this.untypedLabel.y = y;
  }

  destroy(): void {
    this.typedLabel.destroy();
    this.untypedLabel.destroy();
  }
}

class EnemyLabelManager {
  private labels = new Map<number, EnemyLabel>();
  private typedStyle: TextStyle;
  private untypedStyle: TextStyle;

  constructor(typedStyle: TextStyle, untypedStyle: TextStyle) {
    this.typedStyle = typedStyle;
    this.untypedStyle = untypedStyle;
  }

  update(
    id: number,
    layer: Container,
    word: string,
    typedCount: number,
    centerX: number,
    y: number
  ): void {
    let label = this.labels.get(id);
    if (!label) {
      label = new EnemyLabel(layer, this.typedStyle, this.untypedStyle);
      this.labels.set(id, label);
    }
    label.update(word, typedCount, centerX, y);
  }

  removeMissing(activeIds: Set<number>): void {
    for (const [id, label] of this.labels) {
      if (activeIds.has(id)) continue;
      label.destroy();
      this.labels.delete(id);
    }
  }

  destroy(): void {
    for (const label of this.labels.values()) {
      label.destroy();
    }
    this.labels.clear();
  }
}

export class EnemyManager {
  readonly shipLayer: Container;
  readonly meteorLayer: Container;

  private assets: AssetManager;
  private shipContainers = new Map<number, Container>();
  private meteorSprites = new Map<number, Sprite>();
  private activeShipIds = new Set<number>();
  private activeMeteorIds = new Set<number>();
  private activeEntityIds = new Set<number>();
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
  private labelManager = new EnemyLabelManager(this.typedLabelStyle, this.untypedLabelStyle);

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
    this.activeEntityIds.clear();
    this.activeShipIds.clear();
    for (const ship of state.ships) {
      this.activeShipIds.add(ship.id);
      this.activeEntityIds.add(ship.id);
      let container = this.shipContainers.get(ship.id);
      if (!container) {
        container = createShipContainer(this.assets, ship);
        this.shipLayer.addChild(container);
        this.shipContainers.set(ship.id, container);
      }
      container.x = ship.x;
      container.y = ship.y;
      container.rotation = Math.atan2(ship.vy, ship.vx);
      this.labelManager.update(ship.id, this.shipLayer, ship.word, ship.typedCount, ship.x, ship.y - 20);
    }

    for (const [id, container] of this.shipContainers) {
      if (!this.activeShipIds.has(id)) {
        container.destroy();
        this.shipContainers.delete(id);
      }
    }

    this.activeMeteorIds.clear();
    for (const meteor of state.meteors) {
      this.activeMeteorIds.add(meteor.id);
      this.activeEntityIds.add(meteor.id);
      let sprite = this.meteorSprites.get(meteor.id);
      if (!sprite) {
        sprite = createMeteorSprite(this.assets, meteor);
        this.meteorLayer.addChild(sprite);
        this.meteorSprites.set(meteor.id, sprite);
      }
      sprite.x = meteor.x;
      sprite.y = meteor.y;
      sprite.rotation = meteor.rotation;
      this.labelManager.update(
        meteor.id,
        this.meteorLayer,
        meteor.word,
        meteor.typedCount,
        meteor.x,
        meteor.y - 16
      );
    }

    for (const [id, sprite] of this.meteorSprites) {
      if (!this.activeMeteorIds.has(id)) {
        sprite.destroy();
        this.meteorSprites.delete(id);
      }
    }
    this.labelManager.removeMissing(this.activeEntityIds);
  }

  destroy(): void {
    for (const c of this.shipContainers.values()) c.destroy();
    for (const s of this.meteorSprites.values()) s.destroy();
    this.shipContainers.clear();
    this.meteorSprites.clear();
    this.labelManager.destroy();
    this.shipLayer.destroy();
    this.meteorLayer.destroy();
  }
}
