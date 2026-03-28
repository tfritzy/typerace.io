import { Container, Sprite, Text, TextStyle } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState } from "./state";
import { spawnShip, spawnMeteor } from "./state";
import { createShipContainer } from "./prefabs/shipPrefab";
import { createMeteorSprite } from "./prefabs/meteorPrefab";

export class EnemyManager {
  readonly shipLayer: Container;
  readonly meteorLayer: Container;

  private assets: AssetManager;
  private shipContainers = new Map<number, Container>();
  private meteorSprites = new Map<number, Sprite>();
  private shipLabels = new Map<number, Text>();
  private meteorLabels = new Map<number, Text>();
  private activeShipIds = new Set<number>();
  private activeMeteorIds = new Set<number>();
  private shipSpawnTimer = 0;
  private meteorSpawnTimer = 0;
  private labelStyle = new TextStyle({
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "bold",
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 3 },
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

      let label = this.shipLabels.get(ship.id);
      if (!label) {
        label = new Text({
          text: ship.word,
          style: this.labelStyle,
        });
        label.anchor.set(0.5, 1);
        this.shipLayer.addChild(label);
        this.shipLabels.set(ship.id, label);
      }
      label.text = ship.word;
      label.x = ship.x;
      label.y = ship.y - 20;
    }

    for (const [id, container] of this.shipContainers) {
      if (!this.activeShipIds.has(id)) {
        container.destroy();
        this.shipContainers.delete(id);
        const label = this.shipLabels.get(id);
        if (label) {
          label.destroy();
          this.shipLabels.delete(id);
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

      let label = this.meteorLabels.get(meteor.id);
      if (!label) {
        label = new Text({
          text: meteor.word,
          style: this.labelStyle,
        });
        label.anchor.set(0.5, 1);
        this.meteorLayer.addChild(label);
        this.meteorLabels.set(meteor.id, label);
      }
      label.text = meteor.word;
      label.x = meteor.x;
      label.y = meteor.y - 16;
    }

    for (const [id, sprite] of this.meteorSprites) {
      if (!this.activeMeteorIds.has(id)) {
        sprite.destroy();
        this.meteorSprites.delete(id);
        const label = this.meteorLabels.get(id);
        if (label) {
          label.destroy();
          this.meteorLabels.delete(id);
        }
      }
    }
  }

  destroy(): void {
    for (const c of this.shipContainers.values()) c.destroy();
    for (const s of this.meteorSprites.values()) s.destroy();
    for (const l of this.shipLabels.values()) l.destroy();
    for (const l of this.meteorLabels.values()) l.destroy();
    this.shipContainers.clear();
    this.meteorSprites.clear();
    this.shipLabels.clear();
    this.meteorLabels.clear();
    this.shipLayer.destroy();
    this.meteorLayer.destroy();
  }
}
