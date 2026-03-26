import { TilingSprite, type Texture } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

export function createTiledBackground(texture: Texture): TilingSprite {
  return new TilingSprite({
    texture,
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });
}
