import { Container, Sprite, Text, TextStyle } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, EntityState } from "./state";
import { WavePhase, spawnEntity } from "./state";
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
    const typedWidth = Math.round(this.typedLabel.width);
    const untypedWidth = Math.round(this.untypedLabel.width);
    const totalWidth = typedWidth + untypedWidth;
    const startX = Math.round(centerX - totalWidth / 2);
    this.typedLabel.x = startX + typedWidth;
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
  private typedStyle = new TextStyle({
    fontFamily: PIXEL_FONT,
    fontSize: 16,
    fill: 0x90ee90,
    stroke: { color: 0x000000, width: 4, join: "round" },
  });
  private untypedStyle = new TextStyle({
    fontFamily: PIXEL_FONT,
    fontSize: 16,
    fill: 0xffffff,
    stroke: { color: 0x000000, width: 4, join: "round" },
  });

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
  readonly layer: Container;

  private assets: AssetManager;
  private entityDisplayObjects = new Map<number, Container>();
  private activeEntityIds = new Set<number>();
  private labelManager = new EnemyLabelManager();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  update(state: GameState, dt: number): void {
    const wave = state.wave;

    if (wave.phase === WavePhase.Spawning) {
      wave.waveTimer += dt;

      if (
        state.entities.length === 0 &&
        wave.spawnIndex < wave.spawnQueue.length
      ) {
        wave.waveTimer = wave.spawnQueue[wave.spawnIndex].spawnTime;
      }

      while (
        wave.spawnIndex < wave.spawnQueue.length &&
        wave.waveTimer >= wave.spawnQueue[wave.spawnIndex].spawnTime
      ) {
        const entry = wave.spawnQueue[wave.spawnIndex];
        spawnEntity(state, entry.config);
        wave.spawnIndex++;
      }

      if (wave.spawnIndex >= wave.spawnQueue.length) {
        wave.phase = WavePhase.Clearing;
      }
    }

    if (wave.phase === WavePhase.Clearing) {
      if (state.entities.length === 0) {
        wave.phase = WavePhase.Idle;
        state.onWaveComplete.emit();
      }
    }

    this.syncRendering(state);
  }

  private createDisplayObject(entity: EntityState): Container {
    if (entity.shipType != null) {
      return createShipContainer(this.assets, entity);
    }
    return createMeteorSprite(this.assets, entity);
  }

  private syncRendering(state: GameState): void {
    this.activeEntityIds.clear();

    for (const entity of state.entities) {
      this.activeEntityIds.add(entity.id);
      let display = this.entityDisplayObjects.get(entity.id);
      if (!display) {
        display = this.createDisplayObject(entity);
        this.layer.addChild(display);
        this.entityDisplayObjects.set(entity.id, display);
      }
      display.x = entity.x;
      display.y = entity.y;

      if (entity.shipType != null) {
        display.rotation = Math.atan2(entity.vy, entity.vx);
      } else {
        display.rotation = entity.rotation;
      }

      const labelOffset = entity.shipType != null ? -24 : -20;
      this.labelManager.update(
        entity.id,
        this.layer,
        entity.word,
        entity.typedCount,
        entity.x,
        entity.y + labelOffset
      );
    }

    for (const [id, display] of this.entityDisplayObjects) {
      if (!this.activeEntityIds.has(id)) {
        display.destroy();
        this.entityDisplayObjects.delete(id);
      }
    }
    this.labelManager.removeMissing(this.activeEntityIds);
  }

  destroy(): void {
    for (const d of this.entityDisplayObjects.values()) d.destroy();
    this.entityDisplayObjects.clear();
    this.labelManager.destroy();
    this.layer.destroy();
  }
}
