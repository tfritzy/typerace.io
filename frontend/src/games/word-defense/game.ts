import { Emitter } from "@pixi/particle-emitter";
import { Application, Container, Sprite, Graphics, Texture, TextStyle } from "pixi.js";

import { getLanguageFromSlug } from "../../utils/modes";
import { TurretType } from "./types";
import type {
  Meteor, TurretSlot, Projectile, LaserBeam, WaveConfig, WavePhase,
  MeteorObject, SceneObject, TurretVisuals,
} from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX,
  METEOR_CLEANUP_MARGIN, IMPACT_RADIUS_SCALE,
  TARGET_WORD_FONT_SIZE,
  TARGET_WORD_OFFSET_Y,
  LABEL_SCREEN_PADDING,
  BASE_METEOR_SPEED, METEOR_SPEED_WAVE_INCREMENT,
  BASE_METEORS_PER_WAVE, METEORS_PER_WAVE_INCREMENT,
  BASE_METEOR_RADIUS_MIN, BASE_METEOR_RADIUS_MAX,
  WAVE_RADIUS_GROWTH, MAX_METEOR_RADIUS,
  WAVE_SPAWN_INTERVAL_REDUCTION,
  PLANET_ROTATION_SPEED,
  ACTIVE_WAVE_ZOOM, BETWEEN_WAVE_ZOOM, BETWEEN_WAVE_FOCUS_Y, CAMERA_LERP_SPEED,
  LASER_DAMAGE, LASER_BEAM_WIDTH,
  AUTO_TYPE_ENABLED, AUTO_TYPE_INTERVAL,
} from "./constants";
import { destroyCircle } from "./bitmap";
import { createPlanet } from "./planet";
import { spawnMeteor, checkMeteorHitsPlanet, getActiveWords } from "./meteor";
import { createTurretSlots, updateTurretPositions, findAvailableTurrets, fireBullet, isSlotGroundIntact, checkProjectileHitsMeteor } from "./turret";
import { buildTurretVisuals, rebuildSlotVisual, drawSlotInteractive, drawHighlightRing } from "./turretRendering";
import {
  createMeteorObject,
  createProjectileGraphics,
  createMeteorDestructionEmitterConfig,
} from "./meteorRendering";
import { fireMissile, fireNuclearMissile, updateMissile } from "./missile";
import { fireLaser } from "./laser";
import { fireRailgun } from "./railgun";
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
  private meteorParticleLayer!: Container;
  private projectileLayer!: Container;
  private highlightGfx!: Graphics;
  private hud!: GameHud;

  private slots: TurretSlot[] = [];
  private turretVisuals!: TurretVisuals;

  private meteors: Meteor[] = [];
  private meteorObjects: MeteorObject[] = [];
  private meteorDestructionEmitters: Emitter[] = [];
  private projectiles: Projectile[] = [];
  private projectileGfxList: Graphics[] = [];
  private laserBeams: LaserBeam[] = [];
  private laserGfxList: Graphics[] = [];

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
  private autoTypeTimer = 0;

  constructor(app: Application) {
    this.app = app;
    this.langCode = getLangCode();
    this.waveConfig = createWaveConfig(1);

    this.untypedStyle = new TextStyle({
      fontFamily: "monospace",
      fontWeight: "bold",
      fontSize: TARGET_WORD_FONT_SIZE,
      fill: 0xffffff,
      dropShadow: { color: "rgba(0, 0, 0, 0.9)", blur: 4, distance: 0 },
    });
    this.typedStyle = new TextStyle({
      fontFamily: "monospace",
      fontWeight: "bold",
      fontSize: TARGET_WORD_FONT_SIZE,
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

    this.meteorParticleLayer = new Container();
    this.world.addChild(this.meteorParticleLayer);

    this.projectileLayer = new Container();
    this.world.addChild(this.projectileLayer);

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
            if (turret.turretType === TurretType.Laser) {
              const beam = fireLaser(turret, meteor);
              if (beam) {
                this.addLaserBeam(beam);
                const mi = this.meteors.indexOf(meteor);
                if (mi >= 0) this.damageMeteor(mi, LASER_DAMAGE);
              }
            } else if (turret.turretType === TurretType.Missile) {
              const proj = fireMissile(turret, meteor);
              if (proj) this.addProjectile(proj);
            } else if (turret.turretType === TurretType.NuclearMissile) {
              const proj = fireNuclearMissile(turret, meteor);
              if (proj) this.addProjectile(proj);
            } else if (turret.turretType === TurretType.Railgun) {
              const proj = fireRailgun(turret, meteor);
              if (proj) this.addProjectile(proj);
            } else {
              const proj = fireBullet(turret, meteor);
              if (proj) this.addProjectile(proj);
            }
          }
          meteor.typedCount = 0;
        }
      } else if (meteor.typedCount > 0 && key !== nextChar) {
        meteor.typedCount = 0;
      }
    }
  }

  private updateAutoType(dt: number) {
    if (!AUTO_TYPE_ENABLED || this.meteors.length === 0) return;

    this.autoTypeTimer += dt;
    if (this.autoTypeTimer < AUTO_TYPE_INTERVAL) return;
    this.autoTypeTimer = 0;

    let nearest: Meteor | null = null;
    let nearestDist = Infinity;
    for (const meteor of this.meteors) {
      const dx = meteor.x - EARTH_CX;
      const dy = meteor.y - EARTH_CY;
      const dist = dx * dx + dy * dy;
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = meteor;
      }
    }

    if (!nearest) return;

    const nextChar = nearest.word[nearest.typedCount];
    if (nextChar) {
      this.handleKey(nextChar);
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

  private emitMeteorDestruction(meteor: Meteor) {
    const emitter = new Emitter(this.meteorParticleLayer, createMeteorDestructionEmitterConfig(meteor));
    emitter.updateOwnerPos(meteor.x, meteor.y);
    emitter.emitNow();
    this.meteorDestructionEmitters.push(emitter);
  }

  private addProjectile(proj: Projectile) {
    this.projectiles.push(proj);
    const g = createProjectileGraphics();
    g.position.set(proj.x, proj.y);
    this.projectileLayer.addChild(g);
    this.projectileGfxList.push(g);
  }

  private removeProjectileAt(index: number) {
    this.projectileGfxList[index].destroy();
    this.projectiles.splice(index, 1);
    this.projectileGfxList.splice(index, 1);
  }

  private addLaserBeam(beam: LaserBeam) {
    this.laserBeams.push(beam);
    const g = new Graphics();
    this.projectileLayer.addChild(g);
    this.laserGfxList.push(g);
  }

  private removeLaserBeamAt(index: number) {
    this.laserGfxList[index].destroy();
    this.laserBeams.splice(index, 1);
    this.laserGfxList.splice(index, 1);
  }

  private update(dt: number) {
    if (this.gameOver) return;
    const isActive = this.phase === "active";

    this.updateAutoType(dt);
    this.updateSpawning(dt, isActive);
    this.checkWaveComplete(isActive);
    this.updateCamera(dt, isActive);
    this.updatePlanet(dt, isActive);
    this.updateSlotVisuals();
    this.updateProjectiles(dt);
    this.updateLaserBeams(dt);
    this.updateMeteors(dt);
    this.updateMeteorDestructionParticles(dt);
    this.syncMeteorDisplays();

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
      this.projectiles.length === 0 &&
      this.laserBeams.length === 0
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

    for (let i = 0; i < this.slots.length; i++) {
        const tc = this.turretVisuals.containers[i];
        if (tc) {
            tc.rotation = -this.planetRotation;
        }
    }

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

  private damageMeteor(meteorIdx: number, damage: number) {
    const meteor = this.meteors[meteorIdx];
    const actualDamage = Math.min(damage, meteor.health);
    meteor.health -= actualDamage;
    this.credits += actualDamage;

    if (meteor.health <= 0) {
      this.emitMeteorDestruction(meteor);
      this.removeMeteorAt(meteorIdx);
    }
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];

      if (proj.explosionRadius > 0) {
        if (updateMissile(proj, dt)) {
          this.detonateProjectile(i);
          continue;
        }
      } else {
        proj.x += proj.vx * dt;
        proj.y += proj.vy * dt;

        if (
          proj.x < -METEOR_CLEANUP_MARGIN || proj.x > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
          proj.y < -METEOR_CLEANUP_MARGIN || proj.y > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
        ) {
          this.removeProjectileAt(i);
          continue;
        }
      }

      let hit = false;
      for (let mi = this.meteors.length - 1; mi >= 0; mi--) {
        if (checkProjectileHitsMeteor(proj, this.meteors[mi])) {
          if (proj.explosionRadius > 0) {
            this.detonateProjectile(i);
          } else {
            this.damageMeteor(mi, proj.damage);
            this.removeProjectileAt(i);
          }
          hit = true;
          break;
        }
      }

      if (!hit) {
        this.projectileGfxList[i].position.set(proj.x, proj.y);
      }
    }
  }

  private detonateProjectile(index: number) {
    const proj = this.projectiles[index];
    for (let mi = this.meteors.length - 1; mi >= 0; mi--) {
      const meteor = this.meteors[mi];
      const dx = proj.x - meteor.x;
      const dy = proj.y - meteor.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= meteor.radius + proj.explosionRadius) {
        this.damageMeteor(mi, proj.damage);
      }
    }
    this.removeProjectileAt(index);
  }

  private updateLaserBeams(dt: number) {
    for (let i = this.laserBeams.length - 1; i >= 0; i--) {
      const beam = this.laserBeams[i];
      beam.age += dt;

      if (beam.age >= beam.duration) {
        this.removeLaserBeamAt(i);
      } else {
        const alpha = 1 - beam.age / beam.duration;
        const g = this.laserGfxList[i];
        g.clear();
        g.moveTo(beam.startX, beam.startY);
        g.lineTo(beam.endX, beam.endY);
        g.stroke({ color: 0xff0000, alpha, width: LASER_BEAM_WIDTH });
      }
    }
  }

  private updateMeteors(dt: number) {
    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const meteor = this.meteors[i];
      meteor.x += meteor.vx * dt;
      meteor.y += meteor.vy * dt;

      let removed = false;

      if (
        meteor.x < -METEOR_CLEANUP_MARGIN ||
        meteor.x > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
        meteor.y < -METEOR_CLEANUP_MARGIN ||
        meteor.y > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
      ) {
        removed = true;
      } else if (checkMeteorHitsPlanet(this.planetObj, meteor, this.planetRotation)) {
        const destroyRadius = Math.max(
          meteor.radius * 1.2,
          meteor.radius * meteor.radius * IMPACT_RADIUS_SCALE,
        );

        const relX = meteor.x - EARTH_CX;
        const relY = meteor.y - EARTH_CY;
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
          const sdx = slot.x - meteor.x;
          const sdy = slot.y - meteor.y;
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

  private updateMeteorDestructionParticles(dt: number) {
    for (let i = this.meteorDestructionEmitters.length - 1; i >= 0; i--) {
      const emitter = this.meteorDestructionEmitters[i];
      emitter.update(dt);

      if (!emitter.emit && emitter.particleCount === 0) {
        emitter.destroy();
        this.meteorDestructionEmitters.splice(i, 1);
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
      mo.container.position.set(meteor.x, meteor.y);

      mo.untypedText.text = meteor.word;

      const naturalLocalY = meteor.radius + TARGET_WORD_OFFSET_Y + TARGET_WORD_FONT_SIZE;
      const scaledW = mo.untypedText.width * this.cameraZoom;
      const scaledH = mo.untypedText.height * this.cameraZoom;

      const screenX = (meteor.x - EARTH_CX) * this.cameraZoom + EARTH_CX;
      const screenY = (meteor.y + naturalLocalY - EARTH_CY) * this.cameraZoom + this.cameraY;

      const clampedScreenX = clampToRange(screenX, LABEL_SCREEN_PADDING + scaledW / 2, CANVAS_WIDTH - LABEL_SCREEN_PADDING - scaledW / 2);
      const clampedScreenY = clampToRange(screenY, LABEL_SCREEN_PADDING, CANVAS_HEIGHT - LABEL_SCREEN_PADDING - scaledH);

      const clampedLocalX = (clampedScreenX - EARTH_CX) / this.cameraZoom + EARTH_CX - meteor.x;
      const clampedLocalY = (clampedScreenY - this.cameraY) / this.cameraZoom + EARTH_CY - meteor.y;

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

      const healthFraction = meteor.health / meteor.maxHealth;
      const barWidth = meteor.radius * 2;
      mo.healthBar.clear();
      if (healthFraction < 1) {
        const filledWidth = barWidth * healthFraction;
        mo.healthBar.rect(-barWidth / 2, -meteor.radius - 4, filledWidth, 2);
        mo.healthBar.fill(0xffffff);
      }
    }
  }

  destroy() {
    document.removeEventListener("keydown", this.keydownHandler);
    for (const emitter of this.meteorDestructionEmitters) {
      emitter.destroy();
    }
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
