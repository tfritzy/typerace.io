import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { EntityState } from "../state";

const ENEMY_TINT = 0xff6666;
const FRIENDLY_TINT = 0x66ff88;

export function createShipContainer(
  assets: AssetManager,
  entity: EntityState,
  friendly?: boolean
): Container {
  const shipTexture = assets.getShipTexture(entity.entityType, entity.colorPreset!);

  const shipSprite = new Sprite(shipTexture);
  shipSprite.anchor.set(0.5);
  shipSprite.tint = friendly ? FRIENDLY_TINT : ENEMY_TINT;

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
