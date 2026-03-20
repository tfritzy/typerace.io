import { useEffect, useRef, useCallback } from "react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const DESTROY_RADIUS = 30;

interface SceneObject {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
  imageData: ImageData;
}

function createPlanet(
  cx: number,
  cy: number,
  radius: number,
  color: [number, number, number]
): SceneObject {
  const diameter = radius * 2;
  const data = new Uint8Array(diameter * diameter);
  const r2 = radius * radius;

  for (let y = 0; y < diameter; y++) {
    for (let x = 0; x < diameter; x++) {
      const dx = x - radius;
      const dy = y - radius;
      if (dx * dx + dy * dy <= r2) {
        data[y * diameter + x] = 1;
      }
    }
  }

  const imageData = new ImageData(diameter, diameter);
  rebuildImageData(data, imageData, diameter, diameter, color);

  return {
    x: cx - radius,
    y: cy - radius,
    width: diameter,
    height: diameter,
    data,
    imageData,
  };
}

function rebuildImageData(
  data: Uint8Array,
  imageData: ImageData,
  width: number,
  height: number,
  color: [number, number, number]
) {
  const pixels = imageData.data;
  for (let i = 0; i < width * height; i++) {
    if (data[i]) {
      pixels[i * 4] = color[0];
      pixels[i * 4 + 1] = color[1];
      pixels[i * 4 + 2] = color[2];
      pixels[i * 4 + 3] = 255;
    } else {
      pixels[i * 4] = 0;
      pixels[i * 4 + 1] = 0;
      pixels[i * 4 + 2] = 0;
      pixels[i * 4 + 3] = 0;
    }
  }
}

function destroyCircle(
  obj: SceneObject,
  hitX: number,
  hitY: number,
  radius: number,
  color: [number, number, number]
): boolean {
  const localX = hitX - obj.x;
  const localY = hitY - obj.y;

  const minX = Math.max(0, Math.floor(localX - radius));
  const maxX = Math.min(obj.width - 1, Math.ceil(localX + radius));
  const minY = Math.max(0, Math.floor(localY - radius));
  const maxY = Math.min(obj.height - 1, Math.ceil(localY + radius));

  if (minX >= obj.width || maxX < 0 || minY >= obj.height || maxY < 0) {
    return false;
  }

  const r2 = radius * radius;
  let changed = false;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - localX;
      const dy = y - localY;
      if (dx * dx + dy * dy <= r2 && obj.data[y * obj.width + x]) {
        obj.data[y * obj.width + x] = 0;
        changed = true;
      }
    }
  }

  if (changed) {
    rebuildImageData(obj.data, obj.imageData, obj.width, obj.height, color);
  }

  return changed;
}

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const objectsRef = useRef<SceneObject[]>([]);
  const colorRef = useRef<[number, number, number]>([230, 169, 25]);

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (const obj of objectsRef.current) {
      ctx.putImageData(obj.imageData, obj.x, obj.y);
    }
  }, []);

  const handleHit = useCallback(
    (canvasX: number, canvasY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const terrainX = (canvasX / canvas.clientWidth) * CANVAS_WIDTH;
      const terrainY = (canvasY / canvas.clientHeight) * CANVAS_HEIGHT;

      let needsRender = false;
      for (const obj of objectsRef.current) {
        if (
          destroyCircle(obj, terrainX, terrainY, DESTROY_RADIUS, colorRef.current)
        ) {
          needsRender = true;
        }
      }

      if (needsRender) {
        render();
      }
    },
    [render]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();
    const cr = parseInt(accentColor.slice(1, 3), 16);
    const cg = parseInt(accentColor.slice(3, 5), 16);
    const cb = parseInt(accentColor.slice(5, 7), 16);
    colorRef.current = [cr, cg, cb];

    const planet = createPlanet(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      200,
      colorRef.current
    );
    objectsRef.current = [planet];

    render();

    return () => {
      ctxRef.current = null;
      objectsRef.current = [];
    };
  }, [render]);

  const handlePointerEvent = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (e.buttons === 0 && e.type !== "pointerdown") return;
      const rect = e.currentTarget.getBoundingClientRect();
      handleHit(e.clientX - rect.left, e.clientY - rect.top);
    },
    [handleHit]
  );

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg cursor-crosshair"
      style={{ aspectRatio: "16/9", touchAction: "none" }}
      onPointerDown={handlePointerEvent}
      onPointerMove={handlePointerEvent}
    />
  );
};
