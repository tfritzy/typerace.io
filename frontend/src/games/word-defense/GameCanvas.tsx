import { useEffect, useRef, useCallback, useState } from "react";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";
import type { SceneObject, Meteor, TurretSlot, Bullet, WaveConfig, WavePhase } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX,
  METEOR_CLEANUP_MARGIN, IMPACT_RADIUS_SCALE,
  WORD_FONT, WORD_FONT_SIZE,
  WORD_TYPED_ALPHA, WORD_UNTYPED_ALPHA, WORD_OFFSET_Y,
  BASE_METEOR_SPEED,
  BASE_METEORS_PER_WAVE, METEORS_PER_WAVE_INCREMENT,
  BASE_METEOR_RADIUS_MIN, BASE_METEOR_RADIUS_MAX,
  WAVE_RADIUS_GROWTH, MAX_METEOR_RADIUS,
  WAVE_SPAWN_INTERVAL_REDUCTION,
} from "./constants";
import { destroyCircle } from "./bitmap";
import { createPlanet } from "./planet";
import { spawnMeteor, checkMeteorHitsPlanet, getActiveWords, handleBulletImpact } from "./meteor";
import {
  createTurretSlots, findTurretsWithLineOfSight, fireBullet,
  updateBullets, renderTurrets, renderBullets,
} from "./turret";

function getCurrentLangCode(): string {
  const slug = localStorage.getItem("typerace_lang_slug");
  return getLanguageFromSlug(slug ?? undefined).htmlLang;
}

function createWaveConfig(waveNumber: number): WaveConfig {
  const spawnFactor = Math.pow(WAVE_SPAWN_INTERVAL_REDUCTION, waveNumber - 1);
  return {
    waveNumber,
    totalMeteors: BASE_METEORS_PER_WAVE + (waveNumber - 1) * METEORS_PER_WAVE_INCREMENT,
    spawnIntervalMin: SPAWN_INTERVAL_MIN * spawnFactor,
    spawnIntervalMax: SPAWN_INTERVAL_MAX * spawnFactor,
    meteorRadiusMin: Math.min(BASE_METEOR_RADIUS_MIN + (waveNumber - 1) * WAVE_RADIUS_GROWTH, MAX_METEOR_RADIUS - 5),
    meteorRadiusMax: Math.min(BASE_METEOR_RADIUS_MAX + (waveNumber - 1) * WAVE_RADIUS_GROWTH, MAX_METEOR_RADIUS),
    meteorSpeed: BASE_METEOR_SPEED + (waveNumber - 1) * 8,
  };
}

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const objectsRef = useRef<SceneObject[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const turretSlotsRef = useRef<TurretSlot[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const colorRef = useRef<[number, number, number]>([230, 169, 25]);
  const langCodeRef = useRef(getCurrentLangCode());
  const waveConfigRef = useRef<WaveConfig>(createWaveConfig(1));
  const wavePhaseRef = useRef<WavePhase>("active");
  const meteorsSpawnedRef = useRef(0);
  const [wavePhase, setWavePhase] = useState<WavePhase>("active");
  const [waveNumber, setWaveNumber] = useState(1);

  const render = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (const obj of objectsRef.current) {
      ctx.drawImage(obj.bitmap, Math.round(obj.x), Math.round(obj.y));
    }

    renderTurrets(ctx, turretSlotsRef.current);

    for (const meteor of meteorsRef.current) {
      ctx.drawImage(meteor.bitmap, Math.round(meteor.x), Math.round(meteor.y));
    }

    renderBullets(ctx, bulletsRef.current);

    ctx.font = WORD_FONT;
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.9)";
    ctx.shadowBlur = 4;

    for (const meteor of meteorsRef.current) {
      const wordX = meteor.x + meteor.width / 2;
      const wordY = meteor.y + meteor.height + WORD_OFFSET_Y + WORD_FONT_SIZE;
      const typedCount = meteor.typedCount;

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

    ctx.font = "bold 24px monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.globalAlpha = 0.7;
    ctx.fillText(`Wave ${waveConfigRef.current.waveNumber}`, 20, 36);
    ctx.globalAlpha = 1.0;
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
    turretSlotsRef.current = createTurretSlots();
    bulletsRef.current = [];

    const langCode = langCodeRef.current;

    let animFrame: number;
    let lastTime = 0;
    let spawnTimer = 0;
    let nextSpawn = 2000;

    function loop(timestamp: number) {
      const dt = (timestamp - lastTime) / 1000;
      if (lastTime > 0) {
        const waveConfig = waveConfigRef.current;
        const isActive = wavePhaseRef.current === "active";

        if (isActive && meteorsSpawnedRef.current < waveConfig.totalMeteors) {
          spawnTimer += dt * 1000;
          if (spawnTimer >= nextSpawn) {
            const usedWords = getActiveWords(meteorsRef.current);
            meteorsRef.current.push(spawnMeteor(langCode, usedWords, waveConfig));
            meteorsSpawnedRef.current++;
            spawnTimer = 0;
            nextSpawn =
              waveConfig.spawnIntervalMin +
              Math.random() * (waveConfig.spawnIntervalMax - waveConfig.spawnIntervalMin);
          }
        }

        if (
          isActive &&
          meteorsSpawnedRef.current >= waveConfig.totalMeteors &&
          meteorsRef.current.length === 0 &&
          bulletsRef.current.length === 0
        ) {
          wavePhaseRef.current = "complete";
          setWavePhase("complete");
        }

        const planet = objectsRef.current[0];
        const meteors = meteorsRef.current;

        const hits = updateBullets(bulletsRef.current, meteors, dt);
        for (const hit of hits) {
          const meteorIdx = meteors.indexOf(hit.target);
          if (meteorIdx === -1) continue;

          const usedWords = getActiveWords(meteors);
          const result = handleBulletImpact(hit.target, hit.x, hit.y, langCode, usedWords);

          if (result.length === 0) {
            meteors.splice(meteorIdx, 1);
          } else if (result.length > 1 || result[0] !== hit.target) {
            meteors.splice(meteorIdx, 1);
            meteors.push(...result);
          }
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
          const meteor = meteors[i];
          meteor.x += meteor.vx * dt;
          meteor.y += meteor.vy * dt;

          const cx = meteor.x + meteor.width / 2;
          const cy = meteor.y + meteor.height / 2;

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

      for (const meteor of meteors) {
        const nextChar = meteor.word[meteor.typedCount];
        if (key === nextChar) {
          meteor.typedCount++;
          if (meteor.typedCount >= meteor.word.length) {
            const meteorCx = meteor.x + meteor.width / 2;
            const meteorCy = meteor.y + meteor.height / 2;
            const turretsWithLos = findTurretsWithLineOfSight(
              turretSlotsRef.current,
              meteorCx,
              meteorCy
            );
            for (const turret of turretsWithLos) {
              bulletsRef.current.push(fireBullet(turret, meteor));
            }
            const usedWords = getActiveWords(meteors);
            meteor.word = getRandomWord(langCode, usedWords);
            meteor.typedCount = 0;
          }
        } else if (meteor.typedCount > 0 && key !== nextChar) {
          meteor.typedCount = 0;
        }
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
      turretSlotsRef.current = [];
      bulletsRef.current = [];
    };
  }, [render]);

  const startNextWave = useCallback(() => {
    const next = waveConfigRef.current.waveNumber + 1;
    waveConfigRef.current = createWaveConfig(next);
    wavePhaseRef.current = "active";
    meteorsSpawnedRef.current = 0;
    setWavePhase("active");
    setWaveNumber(next);
  }, []);

  return (
    <div className="relative" style={{ aspectRatio: "16/9" }}>
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg"
        style={{ aspectRatio: "16/9" }}
      />
      {wavePhase === "complete" && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}>
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-2">
              Wave {waveNumber} Complete!
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              Prepare for wave {waveNumber + 1}
            </p>
            <button
              onClick={startNextWave}
              className="px-8 py-3 text-lg font-bold rounded-lg text-white cursor-pointer"
              style={{
                backgroundColor: "var(--accent-primary)",
                border: "none",
              }}
            >
              Start Next Wave
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
