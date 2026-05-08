import { Assets, BlurFilter, Container, Graphics, Sprite, Texture } from "pixi.js";
import { RELIC_MAP } from "./relics";
import { collectDroppedRelic, type GameState, type RelicDropData } from "./state";

const RELIC_RENDER_SIZE = 64;
const RELIC_MAX_LIFE = 8;
const COLLECTION_DISTANCE = 16;
const INITIAL_MOVE_STRENGTH = 0.5;
const MOVE_ACCELERATION = 12;
const TARGET_X = 60;
const TARGET_Y = 20;
const RELIC_GLOW_COLOR = 0xf9e2af;
const GLOW_BLUR_STRENGTH = 16;
const GLOW_BLUR_QUALITY = 3;
const GLOW_OUTER_RADIUS = RELIC_RENDER_SIZE * 0.85;
const GLOW_INNER_RADIUS = RELIC_RENDER_SIZE * 0.55;
const GLOW_OUTER_ALPHA = 0.16;
const GLOW_INNER_ALPHA = 0.28;

interface ActiveRelicDrop {
  relicId: RelicDropData["relicId"];
  glow: Graphics;
  sprite: Sprite;
  elapsed: number;
  x: number;
  y: number;
}

export class RelicPickupManager {
  readonly layer: Container;
  private glowLayer: Container;
  private spriteLayer: Container;
  private active: ActiveRelicDrop[] = [];
  private unsub: (() => void) | null = null;

  constructor() {
    this.layer = new Container();
    this.glowLayer = new Container();
    this.spriteLayer = new Container();
    this.glowLayer.filters = [new BlurFilter({ strength: GLOW_BLUR_STRENGTH, quality: GLOW_BLUR_QUALITY })];
    this.layer.addChild(this.glowLayer);
    this.layer.addChild(this.spriteLayer);
  }

  subscribe(state: GameState): void {
    this.unsub = state.onRelicDropped.subscribe((data: RelicDropData) => {
      this.spawn(data);
    });
  }

  private spawn(data: RelicDropData): void {
    const relic = RELIC_MAP.get(data.relicId);
    if (!relic) return;

    const glow = new Graphics();
    glow.circle(0, 0, GLOW_OUTER_RADIUS);
    glow.fill({ color: RELIC_GLOW_COLOR, alpha: GLOW_OUTER_ALPHA });
    glow.circle(0, 0, GLOW_INNER_RADIUS);
    glow.fill({ color: RELIC_GLOW_COLOR, alpha: GLOW_INNER_ALPHA });
    glow.x = data.x;
    glow.y = data.y;
    glow.scale.set(0);
    this.glowLayer.addChild(glow);

    const sprite = new Sprite(Texture.EMPTY);
    sprite.anchor.set(0.5);
    const activeDrop: ActiveRelicDrop = {
      relicId: data.relicId,
      glow,
      sprite,
      elapsed: 0,
      x: data.x,
      y: data.y,
    };
    sprite.x = data.x;
    sprite.y = data.y;
    sprite.alpha = 0;
    sprite.width = 0;
    sprite.height = 0;
    this.spriteLayer.addChild(sprite);
    this.active.push(activeDrop);
    void Assets.load<Texture>(relic.sprite).then((texture) => {
      if (sprite.destroyed) return;
      sprite.texture = texture;
    }).catch((error: unknown) => {
      if (sprite.destroyed) return;
      sprite.texture = Texture.WHITE;
      sprite.tint = RELIC_GLOW_COLOR;
      console.warn("Failed to load relic pickup sprite texture, using fallback:", relic.sprite, error);
    });
  }

  update(state: GameState, dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const relicDrop = this.active[i];
      relicDrop.elapsed += dt;

      if (relicDrop.elapsed >= RELIC_MAX_LIFE) {
        collectDroppedRelic(state, relicDrop.relicId);
        relicDrop.glow.destroy();
        relicDrop.sprite.destroy();
        this.active.splice(i, 1);
        continue;
      }

      const dx = TARGET_X - relicDrop.x;
      const dy = TARGET_Y - relicDrop.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < COLLECTION_DISTANCE * COLLECTION_DISTANCE) {
        collectDroppedRelic(state, relicDrop.relicId);
        relicDrop.glow.destroy();
        relicDrop.sprite.destroy();
        this.active.splice(i, 1);
        continue;
      }

      const t = 1 - Math.exp(-dt * (INITIAL_MOVE_STRENGTH + relicDrop.elapsed * MOVE_ACCELERATION));
      relicDrop.x += dx * t;
      relicDrop.y += dy * t;
      relicDrop.glow.x = relicDrop.x;
      relicDrop.glow.y = relicDrop.y;
      relicDrop.sprite.x = relicDrop.x;
      relicDrop.sprite.y = relicDrop.y;

      const easeInDur = 0.2;
      const progress = relicDrop.elapsed / easeInDur;
      const scale = relicDrop.elapsed < easeInDur ? progress * (2 - progress) : 1;
      relicDrop.glow.scale.set(scale);
      relicDrop.sprite.width = RELIC_RENDER_SIZE * scale;
      relicDrop.sprite.height = RELIC_RENDER_SIZE * scale;
      relicDrop.sprite.alpha = scale;
    }
  }

  destroy(): void {
    this.unsub?.();
    for (const relicDrop of this.active) {
      relicDrop.glow.destroy();
      relicDrop.sprite.destroy();
    }
    this.active.length = 0;
    this.layer.destroy();
  }
}
