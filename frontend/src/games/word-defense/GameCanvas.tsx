import { useEffect, useRef, useCallback } from "react";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";
import type { SceneObject, Meteor, TurretSlot, Bullet } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX,
  METEOR_CLEANUP_MARGIN, IMPACT_RADIUS_SCALE,
  WORD_FONT, WORD_FONT_SIZE,
  WORD_TYPED_ALPHA, WORD_UNTYPED_ALPHA, WORD_OFFSET_Y,
} from "./constants";
import { destroyCircle } from "./bitmap";
import { createPlanet } from "./planet";
import { spawnMeteor, checkMeteorHitsPlanet, getActiveWords, handleBulletImpact } from "./meteor";
import {
  createTurretSlots, findNearestFilledTurret, fireBullet,
  updateBullets, renderTurrets, renderBullets,
} from "./turret";

function getCurrentLangCode(): string {
  const slug = localStorage.getItem("typerace_lang_slug");
  return getLanguageFromSlug(slug ?? undefined).htmlLang;
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
            const turret = findNearestFilledTurret(
              turretSlotsRef.current,
              meteor.x + meteor.width / 2,
              meteor.y + meteor.height / 2
            );
            if (turret) {
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

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg"
      style={{ aspectRatio: "16/9" }}
    />
  );
};
