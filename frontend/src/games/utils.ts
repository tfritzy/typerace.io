import type { Spritesheet, Texture } from "pixi.js";

export function setNearestNeighbor(sheet: Spritesheet): void {
  sheet.textureSource.style.scaleMode = "nearest";
}

export function setTextureNearest(tex: Texture): void {
  tex.source.style.scaleMode = "nearest";
}
