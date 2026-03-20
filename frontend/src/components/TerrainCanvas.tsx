import { useEffect, useRef, useCallback } from "react";

const TERRAIN_WIDTH = 1920;
const TERRAIN_HEIGHT = 1080;
const DESTROY_RADIUS = 30;

export const TerrainCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    const imageData = imageDataRef.current;
    if (!ctx || !imageData) return;
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const destroyAt = useCallback((canvasX: number, canvasY: number) => {
    const imageData = imageDataRef.current;
    const canvas = canvasRef.current;
    if (!imageData || !canvas) return;
    const pixels = imageData.data;

    const terrainX = Math.floor((canvasX / canvas.clientWidth) * TERRAIN_WIDTH);
    const terrainY = Math.floor((canvasY / canvas.clientHeight) * TERRAIN_HEIGHT);

    const minX = Math.max(0, terrainX - DESTROY_RADIUS);
    const maxX = Math.min(TERRAIN_WIDTH - 1, terrainX + DESTROY_RADIUS);
    const minY = Math.max(0, terrainY - DESTROY_RADIUS);
    const maxY = Math.min(TERRAIN_HEIGHT - 1, terrainY + DESTROY_RADIUS);
    const r2 = DESTROY_RADIUS * DESTROY_RADIUS;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const dx = x - terrainX;
        const dy = y - terrainY;
        if (dx * dx + dy * dy <= r2) {
          const idx = (y * TERRAIN_WIDTH + x) * 4;
          pixels[idx] = 0;
          pixels[idx + 1] = 0;
          pixels[idx + 2] = 0;
          pixels[idx + 3] = 0;
        }
      }
    }

    render();
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = TERRAIN_WIDTH;
    canvas.height = TERRAIN_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();
    const cr = parseInt(accentColor.slice(1, 3), 16);
    const cg = parseInt(accentColor.slice(3, 5), 16);
    const cb = parseInt(accentColor.slice(5, 7), 16);

    const imageData = ctx.createImageData(TERRAIN_WIDTH, TERRAIN_HEIGHT);
    const pixels = imageData.data;
    for (let i = 0; i < TERRAIN_WIDTH * TERRAIN_HEIGHT; i++) {
      pixels[i * 4] = cr;
      pixels[i * 4 + 1] = cg;
      pixels[i * 4 + 2] = cb;
      pixels[i * 4 + 3] = 255;
    }
    imageDataRef.current = imageData;

    render();

    return () => {
      ctxRef.current = null;
      imageDataRef.current = null;
    };
  }, [render]);

  const handlePointerEvent = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.buttons === 0 && e.type !== "pointerdown") return;
      const rect = e.currentTarget.getBoundingClientRect();
      destroyAt(e.clientX - rect.left, e.clientY - rect.top);
    },
    [destroyAt]
  );

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg cursor-crosshair"
      style={{ aspectRatio: "16/9" }}
      onPointerDown={handlePointerEvent}
      onPointerMove={handlePointerEvent}
    />
  );
};
