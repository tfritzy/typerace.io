import { Texture } from "pixi.js";

export function textureToCanvas(
  texture: Texture
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const frame = texture.frame;
  const canvas = document.createElement("canvas");
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext("2d")!;

  const source = texture.source;
  const resource = source.resource as HTMLImageElement;
  ctx.drawImage(
    resource,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    0,
    0,
    frame.width,
    frame.height
  );

  return { canvas, ctx };
}

export function applyPaletteSwap(
  shipTexture: Texture,
  colormapTexture: Texture,
  presetTexture: Texture
): Texture {
  const { canvas, ctx } = textureToCanvas(shipTexture);
  const baseData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const { ctx: cmCtx } = textureToCanvas(colormapTexture);
  const cmData = cmCtx.getImageData(0, 0, canvas.width, canvas.height);

  const { ctx: presetCtx } = textureToCanvas(presetTexture);
  const presetData = presetCtx.getImageData(0, 0, presetTexture.frame.width, 1);

  for (let i = 0; i < baseData.data.length; i += 4) {
    if (cmData.data[i + 3] === 0) continue;

    const gray = cmData.data[i];
    const presetIdx = Math.round((gray / 255) * (presetData.width - 1));
    const pi = presetIdx * 4;

    baseData.data[i] = presetData.data[pi];
    baseData.data[i + 1] = presetData.data[pi + 1];
    baseData.data[i + 2] = presetData.data[pi + 2];
  }

  ctx.putImageData(baseData, 0, 0);
  const tex = Texture.from({ resource: canvas });
  tex.source.style.scaleMode = "nearest";
  return tex;
}
