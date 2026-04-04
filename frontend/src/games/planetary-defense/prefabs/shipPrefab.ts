import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { EntityState } from "../state";

export function createShipContainer(
  assets: AssetManager,
  entity: EntityState,
  friendly?: boolean
): Container {
  let shipTexture;
  if (friendly) {
    shipTexture = assets.getShipTextureWithColor(entity.entityType, 100, 255, 136);
  } else {
    shipTexture = assets.getShipTextureWithColor(entity.entityType, 255, 100, 100);
  }

  const shipSprite = new Sprite(shipTexture);
  shipSprite.anchor.set(0.5);

  const container = new Container();
  container.addChild(shipSprite);

  if (entity.hasShield) {
    const shieldTexture = assets.getShieldTexture(entity.entityType);
    const shield = new Sprite(shieldTexture);
    shield.anchor.set(0.5);
    shield.alpha = 0.6;
    container.addChild(shield);
  }

  container.scale.set(3);
  container.x = entity.x;
  container.y = entity.y;

  return container;
}
