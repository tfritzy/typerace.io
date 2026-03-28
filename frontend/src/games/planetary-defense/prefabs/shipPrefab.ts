import { Container, Sprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { ShipState } from "../state";

export function createShipContainer(
  assets: AssetManager,
  ship: ShipState
): Container {
  const shipTexture = assets.getShipTexture(ship.shipType, ship.colorPreset);

  const shipSprite = new Sprite(shipTexture);
  shipSprite.anchor.set(0.5);

  const container = new Container();
  container.addChild(shipSprite);

  if (ship.hasShield) {
    const shieldTexture = assets.getShieldTexture(ship.shipType);
    const shield = new Sprite(shieldTexture);
    shield.anchor.set(0.5);
    shield.alpha = 0.6;
    container.addChild(shield);
  }

  container.scale.set(3);
  container.x = ship.x;
  container.y = ship.y;

  return container;
}
