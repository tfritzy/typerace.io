import { Sprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { EntityState } from "../state";

export function createMeteorSprite(
  assets: AssetManager,
  entity: EntityState
): Sprite {
  const texture = assets.getMeteorTexture(entity.entityType, entity.variant!);

  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.scale.set(3);
  sprite.x = entity.x;
  sprite.y = entity.y;
  sprite.rotation = entity.rotation;

  return sprite;
}
