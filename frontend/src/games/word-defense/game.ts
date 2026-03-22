import { Application, Container, Sprite, Graphics, Texture, TextStyle } from "pixi.js";

import { getLanguageFromSlug } from "../../utils/modes";
import type { Meteor, TurretSlot, Bullet, Missile, WaveConfig, WavePhase, MeteorObject, SceneObject, TurretVisuals } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX,
  METEOR_CLEANUP_MARGIN, IMPACT_RADIUS_SCALE,
  WORD_FONT_SIZE,
  WORD_OFFSET_Y,
  LABEL_SCREEN_PADDING,
  BASE_METEOR_SPEED, METEOR_SPEED_WAVE_INCREMENT,
  BASE_METEORS_PER_WAVE, METEORS_PER_WAVE_INCREMENT,
  BASE_METEOR_RADIUS_MIN, BASE_METEOR_RADIUS_MAX,
  WAVE_RADIUS_GROWTH, MAX_METEOR_RADIUS,
  WAVE_SPAWN_INTERVAL_REDUCTION,
  GRAVITY_STRENGTH, PLANET_ROTATION_SPEED,
  ACTIVE_WAVE_ZOOM, BETWEEN_WAVE_ZOOM, BETWEEN_WAVE_FOCUS_Y, CAMERA_LERP_SPEED,
  MISSILE_EXPLOSION_RADIUS,
} from "./constants";
import { destroyCircle } from "./bitmap";
import { createPlanet } from "./planet";
import { spawnMeteor, checkMeteorHitsPlanet, getActiveWords, handleBulletImpact, handleMissileExplosion } from "./meteor";
import { createTurretSlots, updateTurretPositions, findAvailableTurrets, fireBullet, isSlotGroundIntact, checkBulletHitsMeteor } from "./turret";
import { buildTurretVisuals, rebuildSlotVisual, drawSlotInteractive, drawHighlightRing } from "./turretRendering";
import { createMeteorObject, createBulletGraphics, createMissileGraphics } from "./meteorRendering";
import { fireMissile, updateMissile, checkMissileHitsMeteor } from "./missile";
import { buildPalette, getBackgroundColor, ACCENT_INDEX } from "./palette";
import { GameHud } from "./hud";
import { clampToRange } from "../../utils/math";

function getLangCode(): string {
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
    meteorSpeed: BASE_METEOR_SPEED + (waveNumber - 1) * METEOR_SPEED_WAVE_INCREMENT,
  };
}

export class WordDefenseGame {
  private app: Application;
  private world!: Container;
  private planetContainer!: Container;
  private planetObj!: SceneObject;
  private planetTexture!: Texture;
  private meteorLayer!: Container;
  private bulletLayer!: Container;
  private highlightGfx!: Graphics;
  private hud!: GameHud;

  private slots: TurretSlot[] = [];
  private turretVisuals!: TurretVisuals;

  private meteors: Meteor[] = [];
  private meteorObjects: MeteorObject[] = [];
  private bullets: Bullet[] = [];
  private bulletGfxList: Graphics[] = [];
  private missiles: Missile[] = [];
  private missileGfxList: Graphics[] = [];

  private langCode: string;
  private waveConfig: WaveConfig;
  private phase: WavePhase = "active";
  private meteorsSpawned = 0;
  private spawnTimer = 0;
  private nextSpawn = 2000;
  private planetRotation = 0;
  private cameraZoom = ACTIVE_WAVE_ZOOM;
  private cameraY = EARTH_CY;
  private credits = 0;
  private initialHabitablePixels = 0;
  private habitablePixels = 0;
  private gameOver = false;
  private selectedSlot: TurretSlot | null = null;
  private hoveredSlot: TurretSlot | null = null;

  private untypedStyle: TextStyle;
  private typedStyle: TextStyle;
  private keydownHandler: (e: KeyboardEvent) => void;

  constructor(app: Application) {
    this.app = app;
    this.langCode = getLangCode();
    this.waveConfig = createWaveConfig(1);

    this.untypedStyle = new TextStyle({
      fontFamily: "monospace",
      fontWeight: "bold",
      fontSize: WORD_FONT_SIZE,
      fill: 0xffffff,
      dropShadow: { color: "rgba(0, 0, 0, 0.9)", blur: 4, distance: 0 },
    });
    this.typedStyle = new TextStyle({
      fontFamily: "monospace",
      fontWeight: "bold",
      fontSize: WORD_FONT_SIZE,
      fill: 0xffffff,
      dropShadow: { color: "rgba(0, 0, 0, 0.9)", blur: 4, distance: 0 },
    });

    this.keydownHandler = (e: KeyboardEvent) => this.onKeyDown(e);

    this.buildScene();
    this.setupInput();
    this.app.ticker.add((ticker) => this.update(ticker.deltaMS / 1000));
  }

  private buildScene() {
    buildPalette();

    this.world = new Container();
    this.app.stage.addChild(this.world);

    this.hud = new GameHud(() => this.startNextWave());
    this.app.stage.addChild(this.hud.container);

    const { planet, habitablePixels } = createPlanet(EARTH_CX, EARTH_CY, EARTH_RADIUS);
    this.planetObj = planet;
    this.initialHabitablePixels = habitablePixels;
    this.habitablePixels = habitablePixels;
    this.planetContainer = new Container();
    this.planetContainer.position.set(EARTH_CX, EARTH_CY);
    this.world.addChild(this.planetContainer);

    this.planetTexture = Texture.from({ resource: this.planetObj.bitmap, transparent: true });
    const planetSprite = new Sprite(this.planetTexture);
    planetSprite.anchor.set(0.5);
    this.planetContainer.addChild(planetSprite);

    this.slots = createTurretSlots();
    this.turretVisuals = buildTurretVisuals(this.slots, this.planetContainer);

    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const hitArea = this.turretVisuals.hitAreas[i];
      hitArea.on("pointertap", () => {
        this.selectedSlot = this.selectedSlot === slot ? null : slot;
      });
      hitArea.on("pointerover", () => {
        this.hoveredSlot = slot;
      });
      hitArea.on("pointerout", () => {
        if (this.hoveredSlot === slot) this.hoveredSlot = null;
      });
    }

    this.highlightGfx = new Graphics();
    this.world.addChild(this.highlightGfx);

    this.meteorLayer = new Container();
    this.world.addChild(this.meteorLayer);

    this.bulletLayer = new Container();
    this.world.addChild(this.bulletLayer);

    this.hud.updateHabitability(1);
  }

  private setupInput() {
    document.addEventListener("keydown", this.keydownHandler);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (this.gameOver) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key.length !== 1) return;
    this.handleKey(e.key);
  }

  private handleKey(key: string) {
    if (this.gameOver) return;
    if (key.length !== 1) return;

    for (const meteor of this.meteors) {
      const nextChar = meteor.word[meteor.typedCount];
      if (key === nextChar) {
        meteor.typedCount++;
        if (meteor.typedCount >= meteor.word.length) {
          const availableTurrets = findAvailableTurrets(this.slots);
          for (const turret of availableTurrets) {
            if (turret.isMissileTurret) {
              this.addMissile(fireMissile(turret, meteor));
            } else {
              this.addBullet(fireBullet(turret, meteor));
            }
          }
          meteor.typedCount = 0;
        }
      } else if (meteor.typedCount > 0 && key !== nextChar) {
        meteor.typedCount = 0;
      }
    }
  }

  private startNextWave() {
    const next = this.waveConfig.waveNumber + 1;
    this.waveConfig = createWaveConfig(next);
    this.phase = "active";
    this.meteorsSpawned = 0;
    this.selectedSlot = null;
    this.hoveredSlot = null;
    this.hud.hideStartButton();
  }

  private addMeteor(meteor: Meteor) {
    this.meteors.push(meteor);
    const mo = createMeteorObject(meteor, this.untypedStyle, this.typedStyle);
    this.meteorObjects.push(mo);
    this.meteorLayer.addChild(mo.container);
  }

  private removeMeteorAt(index: number) {
    const mo = this.meteorObjects[index];
    mo.container.destroy({ children: true });
    this.meteors.splice(index, 1);
    this.meteorObjects.splice(index, 1);
  }

  private addBullet(bullet: Bullet) {
    this.bullets.push(bullet);
    const g = createBulletGraphics();
    g.position.set(bullet.x, bullet.y);
    this.bulletLayer.addChild(g);
    this.bulletGfxList.push(g);
  }

  private removeBulletAt(index: number) {
    this.bulletGfxList[index].destroy();
    this.bullets.splice(index, 1);
    this.bulletGfxList.splice(index, 1);
  }

  private addMissile(missile: Missile) {
    this.missiles.push(missile);
    const g = createMissileGraphics();
    g.position.set(missile.x, missile.y);
    g.rotation = missile.launchAngle;
    this.bulletLayer.addChild(g);
    this.missileGfxList.push(g);
  }

  private removeMissileAt(index: number) {
    this.missileGfxList[index].destroy();
    this.missiles.splice(index, 1);
    this.missileGfxList.splice(index, 1);
  }

  private update(dt: number) {
    if (this.gameOver) return;
    const isActive = this.phase === "active";

    this.updateSpawning(dt, isActive);
    this.checkWaveComplete(isActive);
    this.updateCamera(dt, isActive);
    this.updatePlanet(dt, isActive);
    this.updateSlotVisuals();
    this.updateBullets(dt);
    this.updateMissiles(dt);
    this.updateMeteors(dt);
    this.syncMeteorDisplays();

    this.hud.updateWave(this.waveConfig.waveNumber);
    this.hud.updateCredits(this.credits);
    const fraction = this.initialHabitablePixels > 0
      ? this.habitablePixels / this.initialHabitablePixels
      : 0;
    this.hud.updateHabitability(fraction);
  }

  private updateSpawning(dt: number, isActive: boolean) {
    if (!isActive || this.meteorsSpawned >= this.waveConfig.totalMeteors) return;

    this.spawnTimer += dt * 1000;
    if (this.spawnTimer >= this.nextSpawn) {
      const usedWords = getActiveWords(this.meteors);
      this.addMeteor(spawnMeteor(this.langCode, usedWords, this.waveConfig));
      this.meteorsSpawned++;
      this.spawnTimer = 0;
      this.nextSpawn =
        this.waveConfig.spawnIntervalMin +
        Math.random() * (this.waveConfig.spawnIntervalMax - this.waveConfig.spawnIntervalMin);
    }
  }

  private checkWaveComplete(isActive: boolean) {
    if (
      isActive &&
      this.meteorsSpawned >= this.waveConfig.totalMeteors &&
      this.meteors.length === 0 &&
      this.bullets.length === 0 &&
      this.missiles.length === 0
    ) {
      this.phase = "complete";
      this.hud.showStartButton(this.waveConfig.waveNumber + 1);
    }
  }

  private updateCamera(dt: number, isActive: boolean) {
    const targetZoom = isActive ? ACTIVE_WAVE_ZOOM : BETWEEN_WAVE_ZOOM;
    this.cameraZoom += (targetZoom - this.cameraZoom) * CAMERA_LERP_SPEED * dt;

    const targetY = isActive ? EARTH_CY : BETWEEN_WAVE_FOCUS_Y;
    this.cameraY += (targetY - this.cameraY) * CAMERA_LERP_SPEED * dt;

    this.world.scale.set(this.cameraZoom);
    this.world.pivot.set(EARTH_CX, EARTH_CY);
    this.world.position.set(EARTH_CX, this.cameraY);
  }

  private updatePlanet(dt: number, isActive: boolean) {
    if (isActive) {
      this.planetRotation += PLANET_ROTATION_SPEED * dt;
    }
    updateTurretPositions(this.slots, this.planetRotation);
    this.planetContainer.rotation = this.planetRotation;
    this.planetTexture.source.update();
  }

  private updateSlotVisuals() {
    const isComplete = this.phase === "complete";
    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      if (slot.destroyed) {
        this.turretVisuals.hitAreas[i].visible = false;
        continue;
      }
      this.turretVisuals.hitAreas[i].visible = isComplete;
      if (isComplete) {
        if (!slot.filled) {
          drawSlotInteractive(this.turretVisuals.hitAreas[i], slot === this.selectedSlot, slot === this.hoveredSlot);
        }
      }
    }

    this.highlightGfx.clear();
    if (isComplete) {
      for (const slot of this.slots) {
        const isSelected = slot === this.selectedSlot;
        const isHovered = slot === this.hoveredSlot;
        if (slot.filled && (isSelected || isHovered)) {
          drawHighlightRing(this.highlightGfx, slot.x, slot.y, isSelected);
        }
      }
    }
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;

      const bgdx = EARTH_CX - bullet.x;
      const bgdy = EARTH_CY - bullet.y;
      const bgDist = Math.sqrt(bgdx * bgdx + bgdy * bgdy);
      if (bgDist > 1) {
        const bAccel = GRAVITY_STRENGTH / Math.max(bgDist, EARTH_RADIUS);
        bullet.vx += (bgdx / bgDist) * bAccel * dt;
        bullet.vy += (bgdy / bgDist) * bAccel * dt;
      }

      let removeBullet = false;

      if (
        bullet.x < -METEOR_CLEANUP_MARGIN || bullet.x > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
        bullet.y < -METEOR_CLEANUP_MARGIN || bullet.y > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
      ) {
        removeBullet = true;
      } else if (!this.meteors.includes(bullet.target)) {
        removeBullet = true;
      } else if (checkBulletHitsMeteor(bullet, bullet.target)) {
          const meteorIdx = this.meteors.indexOf(bullet.target);
          if (meteorIdx !== -1) {
            const usedWords = getActiveWords(this.meteors);
            let pixelsBefore = 0;
            for (let i = 0; i < bullet.target.data.length; i++) {
              if (bullet.target.data[i]) pixelsBefore++;
            }

            const result = handleBulletImpact(bullet.target, bullet.x, bullet.y, this.langCode, usedWords);

            let pixelsAfter = 0;
            for (const m of result) {
              for (let i = 0; i < m.data.length; i++) {
                if (m.data[i]) pixelsAfter++;
              }
            }
            this.credits += pixelsBefore - pixelsAfter;

            if (result.length === 0) {
              this.removeMeteorAt(meteorIdx);
            } else if (result.length > 1 || result[0] !== bullet.target) {
              this.removeMeteorAt(meteorIdx);
              for (const newMeteor of result) {
                this.addMeteor(newMeteor);
              }
            } else {
              const mo = this.meteorObjects[meteorIdx];
              const oldTexture = mo.sprite.texture;
              mo.sprite.texture = Texture.from({ resource: bullet.target.bitmap, alphaMode: "premultiply-alpha-on-upload" });
              oldTexture.destroy();
            }
          }
          removeBullet = true;
      }

      if (removeBullet) {
        this.removeBulletAt(i);
      } else {
        this.bulletGfxList[i].position.set(bullet.x, bullet.y);
      }
    }
  }

  private detonateMissile(missile: Missile) {
    const usedWords = getActiveWords(this.meteors);
    for (let mi = this.meteors.length - 1; mi >= 0; mi--) {
      const meteor = this.meteors[mi];
      const mcx = meteor.x + meteor.width / 2;
      const mcy = meteor.y + meteor.height / 2;
      const dx = missile.x - mcx;
      const dy = missile.y - mcy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > meteor.radius + MISSILE_EXPLOSION_RADIUS) continue;

      let pixelsBefore = 0;
      for (let p = 0; p < meteor.data.length; p++) {
        if (meteor.data[p]) pixelsBefore++;
      }

      const result = handleMissileExplosion(meteor, missile.x, missile.y, MISSILE_EXPLOSION_RADIUS, this.langCode, usedWords);

      let pixelsAfter = 0;
      for (const m of result) {
        for (let p = 0; p < m.data.length; p++) {
          if (m.data[p]) pixelsAfter++;
        }
      }
      this.credits += pixelsBefore - pixelsAfter;

      if (result.length === 0) {
        this.removeMeteorAt(mi);
      } else if (result.length > 1 || result[0] !== meteor) {
        this.removeMeteorAt(mi);
        for (const newMeteor of result) {
          this.addMeteor(newMeteor);
        }
      } else {
        const mo = this.meteorObjects[mi];
        const oldTexture = mo.sprite.texture;
        mo.sprite.texture = Texture.from({ resource: meteor.bitmap, alphaMode: "premultiply-alpha-on-upload" });
        oldTexture.destroy();
      }
    }
  }

  private updateMissiles(dt: number) {
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const missile = this.missiles[i];

      let shouldDetonate = false;

      if (this.meteors.includes(missile.target) && checkMissileHitsMeteor(missile, missile.target)) {
        shouldDetonate = true;
      }

      const expired = updateMissile(missile, dt);
      if (expired) {
        shouldDetonate = true;
      }

      if (shouldDetonate) {
        this.detonateMissile(missile);
        this.removeMissileAt(i);
      } else {
        this.missileGfxList[i].position.set(missile.x, missile.y);
        this.missileGfxList[i].rotation = missile.launchAngle;
      }
    }
  }

  private updateMeteors(dt: number) {
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const meteor = this.meteors[i];
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
      } else if (checkMeteorHitsPlanet(this.planetObj, meteor, this.planetRotation)) {
        const destroyRadius = Math.max(
          meteor.radius * 1.2,
          meteor.radius * meteor.radius * IMPACT_RADIUS_SCALE,
        );

        const relX = cx - EARTH_CX;
        const relY = cy - EARTH_CY;
        const rcos = Math.cos(-this.planetRotation);
        const rsin = Math.sin(-this.planetRotation);
        const localCx = relX * rcos - relY * rsin + EARTH_CX;
        const localCy = relX * rsin + relY * rcos + EARTH_CY;
        const destroyed = destroyCircle(this.planetObj, localCx, localCy, destroyRadius, ACCENT_INDEX);
        this.habitablePixels = Math.max(0, this.habitablePixels - destroyed);

        if (this.habitablePixels <= 0) {
          this.gameOver = true;
          this.hud.showGameOver();
        }

        const dr2 = destroyRadius * destroyRadius;
        for (let si = 0; si < this.slots.length; si++) {
          const slot = this.slots[si];
          if (slot.destroyed) continue;
          const sdx = slot.x - cx;
          const sdy = slot.y - cy;
          if (sdx * sdx + sdy * sdy <= dr2) {
            slot.filled = false;
            slot.destroyed = true;
            rebuildSlotVisual(si, this.slots, this.turretVisuals, this.planetContainer);
          }
        }

        this.checkAllSlotSurfaces();

        removed = true;
      }

      if (removed) {
        this.removeMeteorAt(i);
      }
    }
  }

  private checkAllSlotSurfaces() {
    for (let si = 0; si < this.slots.length; si++) {
      const slot = this.slots[si];
      if (slot.destroyed) continue;
      if (!isSlotGroundIntact(this.planetObj, slot)) {
        slot.filled = false;
        slot.destroyed = true;
        rebuildSlotVisual(si, this.slots, this.turretVisuals, this.planetContainer);
      }
    }
  }

  private syncMeteorDisplays() {
    for (let i = 0; i < this.meteors.length; i++) {
      const meteor = this.meteors[i];
      const mo = this.meteorObjects[i];
      const containerX = meteor.x + meteor.width / 2;
      const containerY = meteor.y + meteor.height / 2;
      mo.container.position.set(containerX, containerY);

      mo.untypedText.text = meteor.word;

      const naturalLocalY = meteor.height / 2 + WORD_OFFSET_Y + WORD_FONT_SIZE;
      const scaledW = mo.untypedText.width * this.cameraZoom;
      const scaledH = mo.untypedText.height * this.cameraZoom;

      const screenX = (containerX - EARTH_CX) * this.cameraZoom + EARTH_CX;
      const screenY = (containerY + naturalLocalY - EARTH_CY) * this.cameraZoom + this.cameraY;

      const clampedScreenX = clampToRange(screenX, LABEL_SCREEN_PADDING + scaledW / 2, CANVAS_WIDTH - LABEL_SCREEN_PADDING - scaledW / 2);
      const clampedScreenY = clampToRange(screenY, LABEL_SCREEN_PADDING, CANVAS_HEIGHT - LABEL_SCREEN_PADDING - scaledH);

      const clampedLocalX = (clampedScreenX - EARTH_CX) / this.cameraZoom + EARTH_CX - containerX;
      const clampedLocalY = (clampedScreenY - this.cameraY) / this.cameraZoom + EARTH_CY - containerY;

      mo.untypedText.position.set(clampedLocalX, clampedLocalY);

      if (meteor.typedCount > 0) {
        const typed = meteor.word.slice(0, meteor.typedCount);
        mo.typedText.text = typed;
        mo.typedText.visible = true;
        const fullWidth = mo.untypedText.width;
        mo.typedText.position.set(clampedLocalX - fullWidth / 2, clampedLocalY);
      } else {
        mo.typedText.visible = false;
      }
    }
  }

  destroy() {
    document.removeEventListener("keydown", this.keydownHandler);
    this.app.destroy(true, { children: true });
  }
}

export async function createWordDefenseGame(container: HTMLElement): Promise<WordDefenseGame> {
  buildPalette();
  const app = new Application();
  await app.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    background: getBackgroundColor(),
    antialias: true,
    resolution: 1,
    preserveDrawingBuffer: true,
  });

  app.canvas.style.width = "100%";
  app.canvas.style.height = "auto";
  app.canvas.style.aspectRatio = "16/9";
  container.appendChild(app.canvas);

  return new WordDefenseGame(app);
}
