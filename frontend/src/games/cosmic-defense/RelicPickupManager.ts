import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import { RELIC_MAP } from "./relics";
import type { GameState, RelicDropData } from "./state";

const PICKUP_DURATION_S = 0.7;
const PICKUP_ARC_HEIGHT = 120;
const PICKUP_TARGET_X = 120;
const PICKUP_TARGET_Y = 74;
const PICKUP_START_SIZE = 128;
const PICKUP_END_SIZE = 44;

interface ActivePickup {
  relicId: RelicDropData["relicId"];
  sprite: Sprite;
  elapsed: number;
  startX: number;
  startY: number;
}

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export class RelicPickupManager {
  readonly layer: Container;

  private assets: AssetManager;
  private state: GameState | null = null;
  private unsub: (() => void) | null = null;
  private activePickup: ActivePickup | null = null;
  private destroyed = false;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.layer = new Container();
  }

  subscribe(state: GameState): void {
    this.state = state;
    this.unsub = state.onRelicDropped.subscribe((data) => {
      void this.spawn(data);
    });
  }

  update(dt: number): void {
    if (!this.activePickup) return;

    this.activePickup.elapsed += dt;
    const progress = Math.min(1, this.activePickup.elapsed / PICKUP_DURATION_S);
    const eased = easeOutCubic(progress);
    const sprite = this.activePickup.sprite;

    sprite.x = lerp(this.activePickup.startX, PICKUP_TARGET_X, eased);
    sprite.y =
      lerp(this.activePickup.startY, PICKUP_TARGET_Y, eased) -
      Math.sin(progress * Math.PI) * PICKUP_ARC_HEIGHT;

    const startScale = PICKUP_START_SIZE / Math.max(sprite.texture.width, sprite.texture.height);
    const endScale = PICKUP_END_SIZE / Math.max(sprite.texture.width, sprite.texture.height);
    sprite.scale.set(lerp(startScale, endScale, eased));
    sprite.alpha = progress < 0.85 ? 1 : lerp(1, 0.8, (progress - 0.85) / 0.15);

    if (progress < 1) return;

    const relicId = this.activePickup.relicId;
    sprite.destroy();
    this.activePickup = null;
    this.state?.onRelicPickupArrived.emit(relicId);
  }

  destroy(): void {
    this.destroyed = true;
    this.unsub?.();
    this.unsub = null;
    if (this.activePickup) {
      this.activePickup.sprite.destroy();
      this.activePickup = null;
    }
    this.state = null;
    this.layer.destroy();
  }

  private async spawn(data: RelicDropData): Promise<void> {
    if (this.destroyed) return;

    const relic = RELIC_MAP.get(data.relicId);
    if (!relic) return;

    const texture = await this.assets.loadTexture(relic.sprite);
    if (this.destroyed || !this.state) return;

    if (this.activePickup) {
      this.activePickup.sprite.destroy();
      this.activePickup = null;
    }

    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.x = data.x;
    sprite.y = data.y;
    const startScale = PICKUP_START_SIZE / Math.max(texture.width, texture.height);
    sprite.scale.set(startScale);
    this.layer.addChild(sprite);

    this.activePickup = {
      relicId: data.relicId,
      sprite,
      elapsed: 0,
      startX: data.x,
      startY: data.y,
    };
  }
}
