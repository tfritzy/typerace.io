import { useEffect, useRef, useCallback, useState } from "react";
import { Application, Container, Sprite, Graphics, Text, Texture, TextStyle, Circle } from "pixi.js";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";
import type { Meteor, TurretSlot, Bullet, WaveConfig, WavePhase } from "./types";
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
  BETWEEN_WAVE_ZOOM, BETWEEN_WAVE_FOCUS_Y, CAMERA_LERP_SPEED,
  SLOT_INTERACTIVE_RADIUS, SLOT_HIT_BUFFER,
  TURRET_BARREL_LENGTH, TURRET_BARREL_WIDTH, TURRET_BASE_RADIUS,
  BULLET_RENDER_RADIUS,
} from "./constants";
import { destroyCircle } from "./bitmap";
import { createPlanet } from "./planet";
import { spawnMeteor, checkMeteorHitsPlanet, getActiveWords, handleBulletImpact } from "./meteor";
import {
  createTurretSlots, updateTurretPositions, findTurretsWithLineOfSight, fireBullet,
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

function createTurretGraphics(slot: TurretSlot): Container {
  const container = new Container();
  container.position.set(
    Math.cos(slot.baseAngle) * EARTH_RADIUS,
    Math.sin(slot.baseAngle) * EARTH_RADIUS,
  );

  const barrel = new Graphics();
  barrel.rect(0, -TURRET_BARREL_WIDTH / 2, TURRET_BARREL_LENGTH, TURRET_BARREL_WIDTH);
  barrel.fill(0x6b7280);
  barrel.rotation = slot.baseAngle;
  container.addChild(barrel);

  const base = new Graphics();
  base.circle(0, 0, TURRET_BASE_RADIUS);
  base.fill(0x9ca3af);
  container.addChild(base);

  return container;
}

function createEmptySlotGraphics(): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 2);
  g.fill({ color: 0xffffff, alpha: 0.15 });
  return g;
}

function createSlotHitArea(slot: TurretSlot): Graphics {
  const g = new Graphics();
  g.eventMode = "static";
  g.cursor = "pointer";
  g.hitArea = new Circle(0, 0, SLOT_INTERACTIVE_RADIUS + SLOT_HIT_BUFFER);
  g.position.set(
    Math.cos(slot.baseAngle) * EARTH_RADIUS,
    Math.sin(slot.baseAngle) * EARTH_RADIUS,
  );
  g.visible = false;
  return g;
}

function drawSlotInteractive(g: Graphics, isSelected: boolean, isHovered: boolean) {
  g.clear();
  const circleAlpha = isSelected ? 0.8 : isHovered ? 0.5 : 0.3;
  const plusAlpha = isSelected ? 0.7 : isHovered ? 0.4 : 0.2;

  g.circle(0, 0, SLOT_INTERACTIVE_RADIUS);
  g.stroke({ color: 0xffffff, alpha: circleAlpha, width: isSelected ? 2 : 1.5 });

  g.moveTo(-4, 0);
  g.lineTo(4, 0);
  g.moveTo(0, -4);
  g.lineTo(0, 4);
  g.stroke({ color: 0xffffff, alpha: plusAlpha, width: 1.5 });
}

function drawHighlightRing(gfx: Graphics, x: number, y: number, isSelected: boolean) {
  gfx.circle(x, y, TURRET_BASE_RADIUS + 5);
  gfx.stroke({
    color: 0xffffff,
    alpha: isSelected ? 0.8 : 0.4,
    width: 2,
  });
}

interface MeteorObject {
  data: Meteor;
  container: Container;
  sprite: Sprite;
  untypedText: Text;
  typedText: Text;
}

function createMeteorObject(meteor: Meteor, untypedStyle: TextStyle, typedStyle: TextStyle): MeteorObject {
  const container = new Container();
  container.position.set(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2);

  const tex = Texture.from({ resource: meteor.bitmap, alphaMode: "premultiply-alpha-on-upload" });
  const sprite = new Sprite(tex);
  sprite.anchor.set(0.5);
  container.addChild(sprite);

  const untypedText = new Text({ text: meteor.word, style: untypedStyle });
  untypedText.anchor.set(0.5, 0);
  untypedText.position.set(0, meteor.height / 2 + WORD_OFFSET_Y + WORD_FONT_SIZE);
  untypedText.alpha = WORD_UNTYPED_ALPHA;
  container.addChild(untypedText);

  const typedText = new Text({ text: "", style: typedStyle });
  typedText.anchor.set(0, 0);
  typedText.alpha = WORD_TYPED_ALPHA;
  typedText.visible = false;
  container.addChild(typedText);

  return { data: meteor, container, sprite, untypedText, typedText };
}

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wavePhase, setWavePhase] = useState<WavePhase>("active");
  const [waveNumber, setWaveNumber] = useState(1);
  const startNextWaveRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();
    const cr = parseInt(accentColor.slice(1, 3), 16);
    const cg = parseInt(accentColor.slice(3, 5), 16);
    const cb = parseInt(accentColor.slice(5, 7), 16);
    const planetColor: [number, number, number] = [cr, cg, cb];

    let destroyed = false;
    let pixiApp: Application | null = null;
    let keydownHandler: ((e: KeyboardEvent) => void) | null = null;

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

      app.canvas.style.width = "100%";
      app.canvas.style.height = "auto";
      app.canvas.style.aspectRatio = "16/9";
      app.canvas.classList.add("rounded-lg");
      div.insertBefore(app.canvas, div.firstChild);

      const world = new Container();
      app.stage.addChild(world);

      const hud = new Container();
      app.stage.addChild(hud);

      const planetObj = createPlanet(EARTH_CX, EARTH_CY, EARTH_RADIUS, planetColor);
      const planetContainer = new Container();
      planetContainer.position.set(EARTH_CX, EARTH_CY);
      world.addChild(planetContainer);

      const planetTexture = Texture.from({ resource: planetObj.bitmap, alphaMode: "premultiply-alpha-on-upload" });
      const planetSprite = new Sprite(planetTexture);
      planetSprite.anchor.set(0.5);
      planetContainer.addChild(planetSprite);

      const slots = createTurretSlots();
      const turretContainers: (Container | null)[] = [];
      const emptySlotGfx: (Graphics | null)[] = [];
      const slotHitAreas: Graphics[] = [];

      for (const slot of slots) {
        if (slot.filled) {
          const tc = createTurretGraphics(slot);
          planetContainer.addChild(tc);
          turretContainers.push(tc);
          emptySlotGfx.push(null);
        } else {
          const eg = createEmptySlotGraphics();
          eg.position.set(
            Math.cos(slot.baseAngle) * EARTH_RADIUS,
            Math.sin(slot.baseAngle) * EARTH_RADIUS,
          );
          planetContainer.addChild(eg);
          turretContainers.push(null);
          emptySlotGfx.push(eg);
        }

        const hitArea = createSlotHitArea(slot);
        planetContainer.addChild(hitArea);
        slotHitAreas.push(hitArea);
      }

      const highlightGfx = new Graphics();
      world.addChild(highlightGfx);

      const meteorLayer = new Container();
      world.addChild(meteorLayer);

      const bulletLayer = new Container();
      world.addChild(bulletLayer);

      const langCode = getCurrentLangCode();
      let waveConfig = createWaveConfig(1);
      let phase: WavePhase = "active";
      let meteorsSpawned = 0;
      let spawnTimer = 0;
      let nextSpawn = 2000;
      let planetRotation = 0;
      let cameraZoom = 1;
      let cameraY = EARTH_CY;
      let selectedSlot: TurretSlot | null = null;
      let hoveredSlot: TurretSlot | null = null;

      const meteors: Meteor[] = [];
      const meteorObjects: MeteorObject[] = [];
      const bullets: Bullet[] = [];
      const bulletGfxList: Graphics[] = [];

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

      const waveLabel = new Text({
        text: "Wave 1",
        style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 24, fill: 0xffffff },
      });
      waveLabel.position.set(20, 12);
      waveLabel.alpha = 0.7;
      hud.addChild(waveLabel);

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const hitArea = slotHitAreas[i];
        hitArea.on("pointertap", () => {
          selectedSlot = selectedSlot === slot ? null : slot;
        });
        hitArea.on("pointerover", () => {
          hoveredSlot = slot;
        });
        hitArea.on("pointerout", () => {
          if (hoveredSlot === slot) hoveredSlot = null;
        });
      }

      function addMeteor(meteor: Meteor) {
        meteors.push(meteor);
        const mo = createMeteorObject(meteor, untypedStyle, typedStyle);
        meteorObjects.push(mo);
        meteorLayer.addChild(mo.container);
      }

      function removeMeteorAt(index: number) {
        const mo = meteorObjects[index];
        mo.container.destroy({ children: true });
        meteors.splice(index, 1);
        meteorObjects.splice(index, 1);
      }

      function addBullet(bullet: Bullet) {
        bullets.push(bullet);
        const g = new Graphics();
        g.circle(0, 0, BULLET_RENDER_RADIUS);
        g.fill(0xffffff);
        g.position.set(bullet.x, bullet.y);
        bulletLayer.addChild(g);
        bulletGfxList.push(g);
      }

      function removeBulletAt(index: number) {
        bulletGfxList[index].destroy();
        bullets.splice(index, 1);
        bulletGfxList.splice(index, 1);
      }

      function rebuildSlotVisuals(index: number) {
        const slot = slots[index];
        if (slot.filled && !turretContainers[index]) {
          if (emptySlotGfx[index]) {
            emptySlotGfx[index]!.destroy();
            emptySlotGfx[index] = null;
          }
          const tc = createTurretGraphics(slot);
          planetContainer.addChild(tc);
          turretContainers[index] = tc;
        } else if (!slot.filled && turretContainers[index]) {
          turretContainers[index]!.destroy({ children: true });
          turretContainers[index] = null;
          const eg = createEmptySlotGraphics();
          eg.position.set(
            Math.cos(slot.baseAngle) * EARTH_RADIUS,
            Math.sin(slot.baseAngle) * EARTH_RADIUS,
          );
          planetContainer.addChild(eg);
          emptySlotGfx[index] = eg;
        }
      }

      startNextWaveRef.current = () => {
        const next = waveConfig.waveNumber + 1;
        waveConfig = createWaveConfig(next);
        phase = "active";
        meteorsSpawned = 0;
        selectedSlot = null;
        hoveredSlot = null;
        setWavePhase("active");
        setWaveNumber(next);
      };

      function onKeyDown(e: KeyboardEvent) {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key.length !== 1) return;

        const key = e.key;
        for (const meteor of meteors) {
          const nextChar = meteor.word[meteor.typedCount];
          if (key === nextChar) {
            meteor.typedCount++;
            if (meteor.typedCount >= meteor.word.length) {
              const meteorCx = meteor.x + meteor.width / 2;
              const meteorCy = meteor.y + meteor.height / 2;
              const turretsWithLos = findTurretsWithLineOfSight(slots, meteorCx, meteorCy);
              for (const turret of turretsWithLos) {
                addBullet(fireBullet(turret, meteor));
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
        const isActive = phase === "active";

        if (isActive && meteorsSpawned < waveConfig.totalMeteors) {
          spawnTimer += dt * 1000;
          if (spawnTimer >= nextSpawn) {
            const usedWords = getActiveWords(meteors);
            addMeteor(spawnMeteor(langCode, usedWords, waveConfig));
            meteorsSpawned++;
            spawnTimer = 0;
            nextSpawn =
              waveConfig.spawnIntervalMin +
              Math.random() * (waveConfig.spawnIntervalMax - waveConfig.spawnIntervalMin);
          }
        }

        if (
          isActive &&
          meteorsSpawned >= waveConfig.totalMeteors &&
          meteors.length === 0 &&
          bullets.length === 0
        ) {
          phase = "complete";
          setWavePhase("complete");
        }

        const targetZoom = isActive ? 1 : BETWEEN_WAVE_ZOOM;
        cameraZoom += (targetZoom - cameraZoom) * CAMERA_LERP_SPEED * dt;

        const targetY = isActive ? EARTH_CY : BETWEEN_WAVE_FOCUS_Y;
        cameraY += (targetY - cameraY) * CAMERA_LERP_SPEED * dt;

        world.scale.set(cameraZoom);
        world.pivot.set(EARTH_CX, EARTH_CY);
        world.position.set(EARTH_CX, cameraY);

        if (isActive) {
          planetRotation += PLANET_ROTATION_SPEED * dt;
        }
        updateTurretPositions(slots, planetRotation);
        planetContainer.rotation = planetRotation;
        planetTexture.source.update();

        const isComplete = phase === "complete";
        for (let i = 0; i < slots.length; i++) {
          slotHitAreas[i].visible = isComplete;
          if (isComplete) {
            const slot = slots[i];
            if (!slot.filled) {
              drawSlotInteractive(slotHitAreas[i], slot === selectedSlot, slot === hoveredSlot);
            }
          }
        }

        highlightGfx.clear();
        if (isComplete) {
          for (const slot of slots) {
            const isSelected = slot === selectedSlot;
            const isHovered = slot === hoveredSlot;
            if (slot.filled && (isSelected || isHovered)) {
              drawHighlightRing(highlightGfx, slot.x, slot.y, isSelected);
            }
          }
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
          const bullet = bullets[i];
          bullet.x += bullet.vx * dt;
          bullet.y += bullet.vy * dt;

          let removeBullet = false;

          if (
            bullet.x < -50 || bullet.x > CANVAS_WIDTH + 50 ||
            bullet.y < -50 || bullet.y > CANVAS_HEIGHT + 50
          ) {
            removeBullet = true;
          } else if (!meteors.includes(bullet.target)) {
            removeBullet = true;
          } else {
            const targetCx = bullet.target.x + bullet.target.width / 2;
            const targetCy = bullet.target.y + bullet.target.height / 2;
            const bdx = targetCx - bullet.x;
            const bdy = targetCy - bullet.y;
            const bDist = Math.sqrt(bdx * bdx + bdy * bdy);

            if (bDist < bullet.target.radius * 0.8) {
              const meteorIdx = meteors.indexOf(bullet.target);
              if (meteorIdx !== -1) {
                const usedWords = getActiveWords(meteors);
                const result = handleBulletImpact(bullet.target, bullet.x, bullet.y, langCode, usedWords);

                if (result.length === 0) {
                  removeMeteorAt(meteorIdx);
                } else if (result.length > 1 || result[0] !== bullet.target) {
                  removeMeteorAt(meteorIdx);
                  for (const newMeteor of result) {
                    addMeteor(newMeteor);
                  }
                } else {
                  const mo = meteorObjects[meteorIdx];
                  const oldTexture = mo.sprite.texture;
                  mo.sprite.texture = Texture.from({ resource: bullet.target.bitmap, alphaMode: "premultiply-alpha-on-upload" });
                  oldTexture.destroy();
                }
              }
              removeBullet = true;
            }
          }

          if (removeBullet) {
            removeBulletAt(i);
          } else {
            bulletGfxList[i].position.set(bullet.x, bullet.y);
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
          } else if (checkMeteorHitsPlanet(planetObj, meteor, planetRotation)) {
            const destroyRadius = Math.max(
              meteor.radius * 1.2,
              meteor.radius * meteor.radius * IMPACT_RADIUS_SCALE,
            );

            const relX = cx - EARTH_CX;
            const relY = cy - EARTH_CY;
            const rcos = Math.cos(-planetRotation);
            const rsin = Math.sin(-planetRotation);
            const localCx = relX * rcos - relY * rsin + EARTH_CX;
            const localCy = relX * rsin + relY * rcos + EARTH_CY;
            destroyCircle(planetObj, localCx, localCy, destroyRadius, planetColor);

            const dr2 = destroyRadius * destroyRadius;
            for (let si = 0; si < slots.length; si++) {
              const slot = slots[si];
              const sdx = slot.x - cx;
              const sdy = slot.y - cy;
              if (sdx * sdx + sdy * sdy <= dr2) {
                slot.filled = false;
                rebuildSlotVisuals(si);
              }
            }

            removed = true;
          }

          if (removed) {
            removeMeteorAt(i);
          }
        }

        for (let i = 0; i < meteors.length; i++) {
          const meteor = meteors[i];
          const mo = meteorObjects[i];
          mo.container.position.set(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2);

          mo.untypedText.text = meteor.word;

          if (meteor.typedCount > 0) {
            const typed = meteor.word.slice(0, meteor.typedCount);
            mo.typedText.text = typed;
            mo.typedText.visible = true;
            const fullWidth = mo.untypedText.width;
            mo.typedText.position.set(-fullWidth / 2, meteor.height / 2 + WORD_OFFSET_Y + WORD_FONT_SIZE);
          } else {
            mo.typedText.visible = false;
          }
        }

        waveLabel.text = `Wave ${waveConfig.waveNumber}`;
      });
    })();

    return () => {
      destroyed = true;
      if (keydownHandler) document.removeEventListener("keydown", keydownHandler);
      if (pixiApp) {
        pixiApp.destroy(true, { children: true });
      }
    };
  }, []);

  const startNextWave = useCallback(() => {
    startNextWaveRef.current?.();
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
