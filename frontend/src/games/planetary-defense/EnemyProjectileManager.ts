import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "./assetManager";
import type { GameState, EnemyProjectileState } from "./state";

const PROJECTILE_SCALE = 2;

export class EnemyProjectileManager {
  readonly container: Container;

  private assets: AssetManager;
  private sprites = new Map<number, Sprite>();

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.container = new Container();
  }

  update(state: GameState): void {
    const activeIds = new Set<number>();

    for (const ep of state.enemyProjectiles) {
      activeIds.add(ep.id);
      let sprite = this.sprites.get(ep.id);
      if (!sprite) {
        sprite = this.createSprite(ep);
        this.container.addChild(sprite);
        this.sprites.set(ep.id, sprite);
      }
      sprite.x = ep.x;
      sprite.y = ep.y;
      sprite.rotation = ep.rotation;
    }

    for (const [id, sprite] of this.sprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.sprites.delete(id);
      }
    }
  }

  private createSprite(ep: EnemyProjectileState): Sprite {
    const texture = this.assets.getProjectileTexture(ep.projectileType);
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale.set(PROJECTILE_SCALE);
    return sprite;
  }

  destroy(): void {
    for (const sprite of this.sprites.values()) sprite.destroy();
    this.sprites.clear();
    this.container.destroy();
  }
}
