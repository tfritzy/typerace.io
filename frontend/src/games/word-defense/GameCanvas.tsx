import { useEffect, useRef, useCallback } from "react";
import { getRandomWord } from "./wordLists";
import { getLanguageFromSlug } from "../../utils/modes";

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;
const EARTH_CX = CANVAS_WIDTH / 2;
const EARTH_CY = CANVAS_HEIGHT / 2;
const EARTH_RADIUS = 200;
const SPAWN_INTERVAL_MIN = 1500;
const SPAWN_INTERVAL_MAX = 3500;
const METEOR_CLEANUP_MARGIN = 200;
const IMPACT_RADIUS_SCALE = 1 / 20;
const METEOR_COLOR: [number, number, number] = [107, 90, 62];
const METEOR_ANGULAR_SEGMENTS = 32;
const WORD_FONT_SIZE = 28;
const WORD_FONT = `bold ${WORD_FONT_SIZE}px monospace`;
const WORD_TYPED_ALPHA = 1.0;
const WORD_UNTYPED_ALPHA = 0.35;
const WORD_OFFSET_Y = 10;

interface SceneObject {
  x: number;
  y: number;
  width: number;
  height: number;
  data: Uint8Array;
  imageData: ImageData;
}

interface Meteor extends SceneObject {
  vx: number;
  vy: number;
  radius: number;
  word: string;
}

function createMeteorBitmap(
  radius: number
): Pick<SceneObject, "data" | "imageData" | "width" | "height"> {
  const intRadius = Math.ceil(radius);
  const diameter = intRadius * 2;
  const data = new Uint8Array(diameter * diameter);
  const noiseTable = Array.from(
    { length: METEOR_ANGULAR_SEGMENTS },
    () => 0.65 + Math.random() * 0.7
  );

  for (let py = 0; py < diameter; py++) {
    for (let px = 0; px < diameter; px++) {
      const dx = px - intRadius;
      const dy = py - intRadius;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const t = (angle + Math.PI) / (2 * Math.PI);
      const noiseIndex =
        Math.floor(t * METEOR_ANGULAR_SEGMENTS) % METEOR_ANGULAR_SEGMENTS;
      if (dist <= radius * noiseTable[noiseIndex]) {
        data[py * diameter + px] = 1;
      }
    }
  }

  const imageData = new ImageData(diameter, diameter);
  rebuildImageData(data, imageData, diameter, diameter, METEOR_COLOR);
  return { data, imageData, width: diameter, height: diameter };
}

function spawnMeteor(langCode: string, usedWords: Set<string>): Meteor {
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
  const vx = (tdx / tdist) * speed;
  const vy = (tdy / tdist) * speed;

  const bitmap = createMeteorBitmap(radius);
  const word = getRandomWord(langCode, usedWords);

  return {
    x: x - bitmap.width / 2,
    y: y - bitmap.height / 2,
    vx,
    vy,
    radius,
    word,
    ...bitmap,
  };
}

function checkMeteorHitsPlanet(planet: SceneObject, meteor: Meteor): boolean {
  const cx = meteor.x + meteor.radius;
  const cy = meteor.y + meteor.radius;

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
    const px = Math.floor(cx + ox - planet.x);
    const py = Math.floor(cy + oy - planet.y);
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

function getActiveWords(meteors: Meteor[]): Set<string> {
  const words = new Set<string>();
  for (const m of meteors) words.add(m.word);
  return words;
}

function getCurrentLangCode(): string {
  const slug = localStorage.getItem("typerace_lang_slug");
  return getLanguageFromSlug(slug ?? undefined).htmlLang;
}

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const objectsRef = useRef<SceneObject[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const colorRef = useRef<[number, number, number]>([230, 169, 25]);
  const activeMeteorRef = useRef<Meteor | null>(null);
  const typedCountRef = useRef(0);
  const langCodeRef = useRef(getCurrentLangCode());

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (const obj of objectsRef.current) {
      ctx.putImageData(obj.imageData, obj.x, obj.y);
    }

    for (const meteor of meteorsRef.current) {
      ctx.putImageData(meteor.imageData, meteor.x, meteor.y);
    }

    ctx.font = WORD_FONT;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 4;

    for (const meteor of meteorsRef.current) {
      const wordX = meteor.x + meteor.radius;
      const wordY = meteor.y + meteor.radius * 2 + WORD_OFFSET_Y + WORD_FONT_SIZE;
      const isActive = meteor === activeMeteorRef.current;
      const typedCount = isActive ? typedCountRef.current : 0;

      ctx.globalAlpha = WORD_UNTYPED_ALPHA;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(meteor.word, wordX, wordY);

      if (typedCount > 0) {
        const typed = meteor.word.slice(0, typedCount);
        const fullWidth = ctx.measureText(meteor.word).width;
        ctx.textAlign = "left";
        ctx.globalAlpha = WORD_TYPED_ALPHA;
        ctx.fillText(typed, wordX - fullWidth / 2, wordY);
        ctx.textAlign = "center";
      }
    }

    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0;
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
    activeMeteorRef.current = null;
    typedCountRef.current = 0;

    const langCode = langCodeRef.current;

    let animFrame: number;
    let lastTime = 0;
    let spawnTimer = 0;
    let nextSpawn = 2000;

    function loop(timestamp: number) {
      const dt = (timestamp - lastTime) / 1000;
      if (lastTime > 0) {
        spawnTimer += dt * 1000;
        if (spawnTimer >= nextSpawn) {
          const usedWords = getActiveWords(meteorsRef.current);
          meteorsRef.current.push(spawnMeteor(langCode, usedWords));
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

          const cx = meteor.x + meteor.radius;
          const cy = meteor.y + meteor.radius;

          let removed = false;

          if (
            cx < -METEOR_CLEANUP_MARGIN ||
            cx > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
            cy < -METEOR_CLEANUP_MARGIN ||
            cy > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
          ) {
            removed = true;
          } else if (planet && checkMeteorHitsPlanet(planet, meteor)) {
            const destroyRadius = Math.max(
              meteor.radius * 1.2,
              meteor.radius * meteor.radius * IMPACT_RADIUS_SCALE
            );
            destroyCircle(
              planet,
              cx,
              cy,
              destroyRadius,
              colorRef.current
            );
            removed = true;
          }

          if (removed) {
            if (activeMeteorRef.current === meteor) {
              activeMeteorRef.current = null;
              typedCountRef.current = 0;
            }
            meteors.splice(i, 1);
          }
        }
      }
      lastTime = timestamp;
      render();
      animFrame = requestAnimationFrame(loop);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return;

      const key = e.key;
      const meteors = meteorsRef.current;

      if (!activeMeteorRef.current) {
        for (const meteor of meteors) {
          if (meteor.word[0] === key) {
            activeMeteorRef.current = meteor;
            typedCountRef.current = 1;
            return;
          }
        }
        return;
      }

      const active = activeMeteorRef.current;
      const nextChar = active.word[typedCountRef.current];

      if (key === nextChar) {
        typedCountRef.current++;
        if (typedCountRef.current >= active.word.length) {
          const usedWords = getActiveWords(meteors);
          active.word = getRandomWord(langCode, usedWords);
          activeMeteorRef.current = null;
          typedCountRef.current = 0;
        }
      } else {
        activeMeteorRef.current = null;
        typedCountRef.current = 0;
      }
    }

    document.addEventListener("keydown", onKeyDown);
    animFrame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrame);
      document.removeEventListener("keydown", onKeyDown);
      ctxRef.current = null;
      objectsRef.current = [];
      meteorsRef.current = [];
      activeMeteorRef.current = null;
      typedCountRef.current = 0;
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
