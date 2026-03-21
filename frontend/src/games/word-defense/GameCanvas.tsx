import { useEffect, useRef, useCallback, useState } from "react";
import { Application, Container, Sprite, Graphics, Text, Texture, TextStyle, Circle } from "pixi.js";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";
import type { SceneObject, Meteor, TurretSlot, Bullet, WaveConfig, WavePhase } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX,
  METEOR_CLEANUP_MARGIN, IMPACT_RADIUS_SCALE,
  WORD_FONT_SIZE,
  WORD_TYPED_ALPHA, WORD_UNTYPED_ALPHA, WORD_OFFSET_Y,
  BASE_METEOR_SPEED,
  BASE_METEORS_PER_WAVE, METEORS_PER_WAVE_INCREMENT,
  BASE_METEOR_RADIUS_MIN, BASE_METEOR_RADIUS_MAX,
  WAVE_RADIUS_GROWTH, MAX_METEOR_RADIUS,
  WAVE_SPAWN_INTERVAL_REDUCTION,
  GRAVITY_STRENGTH, PLANET_ROTATION_SPEED,
  BETWEEN_WAVE_ZOOM, BETWEEN_WAVE_FOCUS_Y, CAMERA_LERP_SPEED, SLOT_INTERACTIVE_RADIUS,
  TURRET_BARREL_LENGTH, TURRET_BARREL_WIDTH, TURRET_BASE_RADIUS,
  BULLET_RENDER_RADIUS,
} from "./constants";
import { destroyCircle } from "./bitmap";
import { createPlanet } from "./planet";
import { spawnMeteor, checkMeteorHitsPlanet, getActiveWords, handleBulletImpact } from "./meteor";
import {
  createTurretSlots, updateTurretPositions, findTurretsWithLineOfSight, fireBullet,
  updateBullets,
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

interface MeteorDisplay {
  sprite: Sprite;
  untypedText: Text;
  typedText: Text;
}

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const objectsRef = useRef<SceneObject[]>([]);
  const meteorsRef = useRef<Meteor[]>([]);
  const turretSlotsRef = useRef<TurretSlot[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const colorRef = useRef<[number, number, number]>([230, 169, 25]);
  const langCodeRef = useRef(getCurrentLangCode());
  const planetRotationRef = useRef(0);
  const cameraZoomRef = useRef(1);
  const cameraYRef = useRef(EARTH_CY);
  const selectedSlotRef = useRef<TurretSlot | null>(null);
  const hoveredSlotRef = useRef<TurretSlot | null>(null);
  const waveConfigRef = useRef<WaveConfig>(createWaveConfig(1));
  const wavePhaseRef = useRef<WavePhase>("active");
  const meteorsSpawnedRef = useRef(0);
  const [wavePhase, setWavePhase] = useState<WavePhase>("active");
  const [waveNumber, setWaveNumber] = useState(1);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();
    const cr = parseInt(accentColor.slice(1, 3), 16);
    const cg = parseInt(accentColor.slice(3, 5), 16);
    const cb = parseInt(accentColor.slice(5, 7), 16);
    colorRef.current = [cr, cg, cb];

    let destroyed = false;
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null;
    let pixiApp: Application | null = null;

    const meteorDisplays = new Map<Meteor, MeteorDisplay>();

    (async () => {
      const app = new Application();
      await app.init({
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        backgroundAlpha: 0,
        antialias: true,
        resolution: 1,
        preserveDrawingBuffer: true,
      });
      if (destroyed) { app.destroy(true); return; }
      pixiApp = app;
      appRef.current = app;

      app.canvas.style.width = "100%";
      app.canvas.style.height = "auto";
      app.canvas.style.aspectRatio = "16/9";
      app.canvas.classList.add("rounded-lg");
      div.insertBefore(app.canvas, div.firstChild);

      const world = new Container();
      app.stage.addChild(world);

      const hud = new Container();
      app.stage.addChild(hud);

      const planet = createPlanet(EARTH_CX, EARTH_CY, EARTH_RADIUS, colorRef.current);
      objectsRef.current = [planet];

      const planetContainer = new Container();
      planetContainer.position.set(EARTH_CX, EARTH_CY);
      world.addChild(planetContainer);

      const planetTexture = Texture.from({ resource: planet.bitmap, alphaMode: "premultiply-alpha-on-upload" });
      const planetSprite = new Sprite(planetTexture);
      planetSprite.anchor.set(0.5);
      planetContainer.addChild(planetSprite);

      const turretGfx = new Graphics();
      world.addChild(turretGfx);

      const bulletGfx = new Graphics();
      world.addChild(bulletGfx);

      const meteorContainer = new Container();
      world.addChild(meteorContainer);

      const wordContainer = new Container();
      world.addChild(wordContainer);

      const slots = createTurretSlots();
      turretSlotsRef.current = slots;

      const slotGfxList: Graphics[] = [];
      for (const slot of slots) {
        const g = new Graphics();
        g.eventMode = "static";
        g.cursor = "pointer";
        g.hitArea = new Circle(0, 0, SLOT_INTERACTIVE_RADIUS + 4);
        g.position.set(slot.x, slot.y);
        g.visible = false;

        g.on("pointertap", () => {
          selectedSlotRef.current = selectedSlotRef.current === slot ? null : slot;
        });
        g.on("pointerover", () => {
          hoveredSlotRef.current = slot;
        });
        g.on("pointerout", () => {
          if (hoveredSlotRef.current === slot) hoveredSlotRef.current = null;
        });

        world.addChild(g);
        slotGfxList.push(g);
      }

      meteorsRef.current = [];
      bulletsRef.current = [];

      const langCode = langCodeRef.current;
      let spawnTimer = 0;
      let nextSpawn = 2000;

      const untypedStyle = new TextStyle({
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: WORD_FONT_SIZE,
        fill: 0xffffff,
        dropShadow: { color: "rgba(0, 0, 0, 0.9)", blur: 4, distance: 0 },
      });
      const typedStyle = new TextStyle({
        fontFamily: "monospace",
        fontWeight: "bold",
        fontSize: WORD_FONT_SIZE,
        fill: 0xffffff,
        dropShadow: { color: "rgba(0, 0, 0, 0.9)", blur: 4, distance: 0 },
      });

      const waveLabel = new Text({ text: "Wave 1", style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 24, fill: 0xffffff } });
      waveLabel.position.set(20, 12);
      waveLabel.alpha = 0.7;
      hud.addChild(waveLabel);

      function addMeteorDisplay(meteor: Meteor) {
        const tex = Texture.from({ resource: meteor.bitmap, alphaMode: "premultiply-alpha-on-upload" });
        const sprite = new Sprite(tex);
        sprite.position.set(meteor.x, meteor.y);
        meteorContainer.addChild(sprite);

        const untypedText = new Text({ text: meteor.word, style: untypedStyle });
        untypedText.anchor.set(0.5, 0);
        untypedText.alpha = WORD_UNTYPED_ALPHA;
        wordContainer.addChild(untypedText);

        const typedText = new Text({ text: "", style: typedStyle });
        typedText.anchor.set(0, 0);
        typedText.alpha = WORD_TYPED_ALPHA;
        wordContainer.addChild(typedText);

        meteorDisplays.set(meteor, { sprite, untypedText, typedText });
      }

      function removeMeteorDisplay(meteor: Meteor) {
        const display = meteorDisplays.get(meteor);
        if (!display) return;
        display.sprite.destroy();
        display.untypedText.destroy();
        display.typedText.destroy();
        meteorDisplays.delete(meteor);
      }

      function drawTurrets() {
        turretGfx.clear();
        const isComplete = wavePhaseRef.current === "complete";

        for (let i = 0; i < slots.length; i++) {
          const slot = slots[i];
          const g = slotGfxList[i];
          g.position.set(slot.x, slot.y);
          g.visible = isComplete;

          if (slot.filled) {
            const cos = Math.cos(slot.angle);
            const sin = Math.sin(slot.angle);
            const hw = TURRET_BARREL_WIDTH / 2;
            turretGfx.poly([
              slot.x - sin * (-hw), slot.y + cos * (-hw),
              slot.x + cos * TURRET_BARREL_LENGTH - sin * (-hw), slot.y + sin * TURRET_BARREL_LENGTH + cos * (-hw),
              slot.x + cos * TURRET_BARREL_LENGTH - sin * hw, slot.y + sin * TURRET_BARREL_LENGTH + cos * hw,
              slot.x - sin * hw, slot.y + cos * hw,
            ], true);
            turretGfx.fill(0x6b7280);

            turretGfx.circle(slot.x, slot.y, TURRET_BASE_RADIUS);
            turretGfx.fill(0x9ca3af);

            if (isComplete) {
              const isSelected = slot === selectedSlotRef.current;
              const isHovered = slot === hoveredSlotRef.current;
              if (isSelected || isHovered) {
                turretGfx.circle(slot.x, slot.y, TURRET_BASE_RADIUS + 5);
                turretGfx.stroke({
                  color: 0xffffff,
                  alpha: isSelected ? 0.8 : 0.4,
                  width: 2,
                });
              }
            }
          } else {
            if (isComplete) {
              const isSelected = slot === selectedSlotRef.current;
              const isHovered = slot === hoveredSlotRef.current;
              const circleAlpha = isSelected ? 0.8 : isHovered ? 0.5 : 0.3;
              const plusAlpha = isSelected ? 0.7 : isHovered ? 0.4 : 0.2;

              g.clear();
              g.circle(0, 0, SLOT_INTERACTIVE_RADIUS);
              g.stroke({ color: 0xffffff, alpha: circleAlpha, width: isSelected ? 2 : 1.5 });

              g.moveTo(-4, 0);
              g.lineTo(4, 0);
              g.moveTo(0, -4);
              g.lineTo(0, 4);
              g.stroke({ color: 0xffffff, alpha: plusAlpha, width: 1.5 });
            } else {
              turretGfx.circle(slot.x, slot.y, 2);
              turretGfx.fill({ color: 0xffffff, alpha: 0.15 });
            }
          }
        }
      }

      function drawBullets() {
        bulletGfx.clear();
        for (const bullet of bulletsRef.current) {
          bulletGfx.circle(bullet.x, bullet.y, BULLET_RENDER_RADIUS);
          bulletGfx.fill(0xffffff);
        }
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

      keydownHandler = onKeyDown;
      document.addEventListener("keydown", onKeyDown);

      app.ticker.add((ticker) => {
        const dt = ticker.deltaMS / 1000;
        const waveConfig = waveConfigRef.current;
        const isActive = wavePhaseRef.current === "active";

        if (isActive && meteorsSpawnedRef.current < waveConfig.totalMeteors) {
          spawnTimer += dt * 1000;
          if (spawnTimer >= nextSpawn) {
            const usedWords = getActiveWords(meteorsRef.current);
            const meteor = spawnMeteor(langCode, usedWords, waveConfig);
            meteorsRef.current.push(meteor);
            addMeteorDisplay(meteor);
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

        const planetObj = objectsRef.current[0];
        const meteors = meteorsRef.current;

        const targetZoom = isActive ? 1 : BETWEEN_WAVE_ZOOM;
        cameraZoomRef.current += (targetZoom - cameraZoomRef.current) * CAMERA_LERP_SPEED * dt;

        const targetY = isActive ? EARTH_CY : BETWEEN_WAVE_FOCUS_Y;
        cameraYRef.current += (targetY - cameraYRef.current) * CAMERA_LERP_SPEED * dt;

        world.scale.set(cameraZoomRef.current);
        world.pivot.set(EARTH_CX, EARTH_CY);
        world.position.set(EARTH_CX, cameraYRef.current);

        if (isActive) {
          planetRotationRef.current += PLANET_ROTATION_SPEED * dt;
        }
        updateTurretPositions(slots, planetRotationRef.current);

        planetContainer.rotation = planetRotationRef.current;
        planetTexture.source.update();

        const hits = updateBullets(bulletsRef.current, meteors, dt);
        for (const hit of hits) {
          const meteorIdx = meteors.indexOf(hit.target);
          if (meteorIdx === -1) continue;

          const usedWords = getActiveWords(meteors);
          const result = handleBulletImpact(hit.target, hit.x, hit.y, langCode, usedWords);

          if (result.length === 0) {
            removeMeteorDisplay(hit.target);
            meteors.splice(meteorIdx, 1);
          } else if (result.length > 1 || result[0] !== hit.target) {
            removeMeteorDisplay(hit.target);
            meteors.splice(meteorIdx, 1);
            for (const newMeteor of result) {
              meteors.push(newMeteor);
              addMeteorDisplay(newMeteor);
            }
          } else {
            const display = meteorDisplays.get(hit.target);
            if (display) {
              display.sprite.texture = Texture.from({ resource: hit.target.bitmap, alphaMode: "premultiply-alpha-on-upload" });
            }
          }
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
          const meteor = meteors[i];
          meteor.x += meteor.vx * dt;
          meteor.y += meteor.vy * dt;

          const cx = meteor.x + meteor.width / 2;
          const cy = meteor.y + meteor.height / 2;

          const gdx = EARTH_CX - cx;
          const gdy = EARTH_CY - cy;
          const gDist = Math.sqrt(gdx * gdx + gdy * gdy);
          if (gDist > 1) {
            const accel = GRAVITY_STRENGTH / Math.max(gDist, EARTH_RADIUS);
            meteor.vx += (gdx / gDist) * accel * dt;
            meteor.vy += (gdy / gDist) * accel * dt;
          }

          let removed = false;

          if (
            cx < -METEOR_CLEANUP_MARGIN ||
            cx > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
            cy < -METEOR_CLEANUP_MARGIN ||
            cy > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
          ) {
            removed = true;
          } else if (planetObj && checkMeteorHitsPlanet(planetObj, meteor, planetRotationRef.current)) {
            const destroyRadius = Math.max(
              meteor.radius * 1.2,
              meteor.radius * meteor.radius * IMPACT_RADIUS_SCALE
            );

            const relX = cx - EARTH_CX;
            const relY = cy - EARTH_CY;
            const rcos = Math.cos(-planetRotationRef.current);
            const rsin = Math.sin(-planetRotationRef.current);
            const localCx = relX * rcos - relY * rsin + EARTH_CX;
            const localCy = relX * rsin + relY * rcos + EARTH_CY;
            destroyCircle(
              planetObj,
              localCx,
              localCy,
              destroyRadius,
              colorRef.current
            );

            const dr2 = destroyRadius * destroyRadius;
            for (const slot of turretSlotsRef.current) {
              const sdx = slot.x - cx;
              const sdy = slot.y - cy;
              if (sdx * sdx + sdy * sdy <= dr2) {
                slot.filled = false;
              }
            }

            removed = true;
          }

          if (removed) {
            removeMeteorDisplay(meteor);
            meteors.splice(i, 1);
          }
        }

        for (const meteor of meteors) {
          const display = meteorDisplays.get(meteor);
          if (!display) continue;
          display.sprite.position.set(meteor.x, meteor.y);

          const wordX = meteor.x + meteor.width / 2;
          const wordY = meteor.y + meteor.height + WORD_OFFSET_Y + WORD_FONT_SIZE;

          display.untypedText.text = meteor.word;
          display.untypedText.position.set(wordX, wordY);
          display.untypedText.alpha = WORD_UNTYPED_ALPHA;

          if (meteor.typedCount > 0) {
            const typed = meteor.word.slice(0, meteor.typedCount);
            display.typedText.text = typed;
            display.typedText.visible = true;
            display.typedText.alpha = WORD_TYPED_ALPHA;

            const fullWidth = display.untypedText.width;
            display.typedText.position.set(wordX - fullWidth / 2, wordY);
          } else {
            display.typedText.visible = false;
          }
        }

        waveLabel.text = `Wave ${waveConfig.waveNumber}`;

        drawTurrets();
        drawBullets();
      });
    })();

    return () => {
      destroyed = true;
      if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
      if (pixiApp) {
        pixiApp.destroy(true, { children: true });
      }
      appRef.current = null;
      objectsRef.current = [];
      meteorsRef.current = [];
      turretSlotsRef.current = [];
      bulletsRef.current = [];
    };
  }, []);

  const startNextWave = useCallback(() => {
    const next = waveConfigRef.current.waveNumber + 1;
    waveConfigRef.current = createWaveConfig(next);
    wavePhaseRef.current = "active";
    meteorsSpawnedRef.current = 0;
    selectedSlotRef.current = null;
    hoveredSlotRef.current = null;
    setWavePhase("active");
    setWaveNumber(next);
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ aspectRatio: "16/9" }}>
      {wavePhase === "complete" && (
        <button
          onClick={startNextWave}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 text-sm font-bold rounded-lg text-white cursor-pointer"
          style={{
            backgroundColor: "var(--accent-primary)",
            border: "none",
            zIndex: 10,
          }}
        >
          Start Wave {waveNumber + 1}
        </button>
      )}
    </div>
  );
};
