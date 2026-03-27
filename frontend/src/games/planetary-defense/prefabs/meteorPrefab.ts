import { Sprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { MeteorState } from "../state";

export function createMeteorSprite(
  assets: AssetManager,
  meteor: MeteorState
): Sprite {
  const texture = assets.getMeteorTexture(meteor.meteorType, meteor.variant);

  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.scale.set(3);
  sprite.x = meteor.x;
  sprite.y = meteor.y;
  sprite.rotation = meteor.rotation;

  return sprite;
}
