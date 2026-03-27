import { Container, Sprite, AnimatedSprite } from "pixi.js";
import type { AssetManager } from "../assetManager";
import type { ShipState } from "../state";
import { SHIP_SCALE } from "../constants";

export function createShipContainer(
  assets: AssetManager,
  ship: ShipState
): Container {
  const shipTexture = assets.getShipTexture(ship.shipType, ship.colorPreset);

  const shipSprite = new Sprite(shipTexture);
  shipSprite.anchor.set(0.5);

  const frames = assets.getEngineFrames(ship.engineType);
  const engine = new AnimatedSprite(frames);
  engine.animationSpeed = 0.15;
  engine.play();
  engine.anchor.set(0.5);
  engine.x = -(shipTexture.width / 2) + 2;

  const container = new Container();
  container.addChild(engine);
  container.addChild(shipSprite);
  container.scale.set(SHIP_SCALE);
  container.x = ship.x;
  container.y = ship.y;

  return container;
}
