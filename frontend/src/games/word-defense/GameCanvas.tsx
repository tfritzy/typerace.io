import { useEffect, useRef, useCallback } from "react";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const EARTH_CX = CANVAS_WIDTH / 2;
const EARTH_CY = CANVAS_HEIGHT / 2;
const EARTH_RADIUS = 200;
const SPAWN_INTERVAL_MIN = 1500;
const SPAWN_INTERVAL_MAX = 3500;
const MAX_DELTA_TIME = 0.1;
const METEOR_CLEANUP_MARGIN = 200;

interface SceneObject {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
  imageData: ImageData;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  vertices: { x: number; y: number }[];
}

function createMeteorVertices(radius: number): { x: number; y: number }[] {
  const vertexCount = 7 + Math.floor(Math.random() * 4);
  const vertices: { x: number; y: number }[] = [];
  for (let i = 0; i < vertexCount; i++) {
    const angle = (i / vertexCount) * Math.PI * 2;
    const r = radius * (0.65 + Math.random() * 0.7);
    vertices.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
  }
  return vertices;
}

function spawnMeteor(): Meteor {
  const side = Math.floor(Math.random() * 4);
  const margin = 60;
  let x: number, y: number;
  if (side === 0) {
    x = Math.random() * CANVAS_WIDTH;
    y = -margin;
  } else if (side === 1) {
    x = CANVAS_WIDTH + margin;
    y = Math.random() * CANVAS_HEIGHT;
  } else if (side === 2) {
    x = Math.random() * CANVAS_WIDTH;
    y = CANVAS_HEIGHT + margin;
  } else {
    x = -margin;
    y = Math.random() * CANVAS_HEIGHT;
  }

  const dx = EARTH_CX - x;
  const dy = EARTH_CY - y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const aimOffset = (Math.random() - 0.5) * EARTH_RADIUS * 0.8;
  const perpX = -dy / dist;
  const perpY = dx / dist;
  const tdx = EARTH_CX + perpX * aimOffset - x;
  const tdy = EARTH_CY + perpY * aimOffset - y;
  const tdist = Math.sqrt(tdx * tdx + tdy * tdy);

  const radius = 8 + Math.random() * 42;
  const speed = 150 - radius * 1.5;

  return {
    x,
    y,
    vx: (tdx / tdist) * speed,
    vy: (tdy / tdist) * speed,
    radius,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 3,
    vertices: createMeteorVertices(radius),
  };
}

function checkMeteorHitsPlanet(planet: SceneObject, meteor: Meteor): boolean {
  const sampleOffsets = [
    { ox: 0, oy: 0 },
    { ox: meteor.radius * 0.7, oy: 0 },
    { ox: -meteor.radius * 0.7, oy: 0 },
    { ox: 0, oy: meteor.radius * 0.7 },
    { ox: 0, oy: -meteor.radius * 0.7 },
    { ox: meteor.radius * 0.5, oy: meteor.radius * 0.5 },
    { ox: -meteor.radius * 0.5, oy: meteor.radius * 0.5 },
    { ox: meteor.radius * 0.5, oy: -meteor.radius * 0.5 },
    { ox: -meteor.radius * 0.5, oy: -meteor.radius * 0.5 },
  ];

  for (const { ox, oy } of sampleOffsets) {
    const px = Math.floor(meteor.x + ox - planet.x);
    const py = Math.floor(meteor.y + oy - planet.y);
    if (px >= 0 && px < planet.width && py >= 0 && py < planet.height) {
      if (planet.data[py * planet.width + px]) {
        return true;
      }
    }
  }
  return false;
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
  const meteorsRef = useRef<Meteor[]>([]);
  const colorRef = useRef<[number, number, number]>([230, 169, 25]);

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (const obj of objectsRef.current) {
      ctx.putImageData(obj.imageData, obj.x, obj.y);
    }

    for (const meteor of meteorsRef.current) {
      ctx.save();
      ctx.translate(meteor.x, meteor.y);
      ctx.rotate(meteor.rotation);
      ctx.beginPath();
      ctx.moveTo(meteor.vertices[0].x, meteor.vertices[0].y);
      for (let i = 1; i < meteor.vertices.length; i++) {
        ctx.lineTo(meteor.vertices[i].x, meteor.vertices[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = "#6B5A3E";
      ctx.fill();
      ctx.strokeStyle = "#3D3427";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, []);

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

    objectsRef.current = [
      createPlanet(EARTH_CX, EARTH_CY, EARTH_RADIUS, colorRef.current),
    ];
    meteorsRef.current = [];

    let animFrame: number;
    let lastTime = 0;
    let spawnTimer = 0;
    let nextSpawn = 2000;

    function loop(timestamp: number) {
      const dt = Math.min((timestamp - lastTime) / 1000, MAX_DELTA_TIME);
      if (lastTime > 0) {
        spawnTimer += dt * 1000;
        if (spawnTimer >= nextSpawn) {
          meteorsRef.current.push(spawnMeteor());
          spawnTimer = 0;
          nextSpawn =
            SPAWN_INTERVAL_MIN +
            Math.random() * (SPAWN_INTERVAL_MAX - SPAWN_INTERVAL_MIN);
        }

        const planet = objectsRef.current[0];
        const meteors = meteorsRef.current;

        for (let i = meteors.length - 1; i >= 0; i--) {
          const meteor = meteors[i];
          meteor.x += meteor.vx * dt;
          meteor.y += meteor.vy * dt;
          meteor.rotation += meteor.rotationSpeed * dt;

          if (
            meteor.x < -METEOR_CLEANUP_MARGIN ||
            meteor.x > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
            meteor.y < -METEOR_CLEANUP_MARGIN ||
            meteor.y > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
          ) {
            meteors.splice(i, 1);
            continue;
          }

          if (planet && checkMeteorHitsPlanet(planet, meteor)) {
            destroyCircle(
              planet,
              meteor.x,
              meteor.y,
              meteor.radius * 1.2,
              colorRef.current
            );
            meteors.splice(i, 1);
          }
        }
      }
      lastTime = timestamp;
      render();
      animFrame = requestAnimationFrame(loop);
    }

    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      ctxRef.current = null;
      objectsRef.current = [];
      meteorsRef.current = [];
    };
  }, [render]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg"
      style={{ aspectRatio: "16/9" }}
    />
  );
};
