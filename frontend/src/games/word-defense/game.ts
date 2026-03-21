import { Application, Container, Sprite, Graphics, Text, Texture, TextStyle } from "pixi.js";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";
import type { Meteor, TurretSlot, Bullet, WaveConfig, WavePhase, MeteorObject, SceneObject, TurretVisuals } from "./types";
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  EARTH_CX, EARTH_CY, EARTH_RADIUS,
  PLANET_COLOR,
  SPAWN_INTERVAL_MIN, SPAWN_INTERVAL_MAX,
  METEOR_CLEANUP_MARGIN, IMPACT_RADIUS_SCALE,
  WORD_FONT_SIZE,
  WORD_OFFSET_Y,
  BASE_METEOR_SPEED, METEOR_SPEED_WAVE_INCREMENT,
  BASE_METEORS_PER_WAVE, METEORS_PER_WAVE_INCREMENT,
  BASE_METEOR_RADIUS_MIN, BASE_METEOR_RADIUS_MAX,
  WAVE_RADIUS_GROWTH, MAX_METEOR_RADIUS,
  WAVE_SPAWN_INTERVAL_REDUCTION,
  GRAVITY_STRENGTH, PLANET_ROTATION_SPEED,
  ACTIVE_WAVE_ZOOM, BETWEEN_WAVE_ZOOM, BETWEEN_WAVE_FOCUS_Y, CAMERA_LERP_SPEED,
  TURRET_DESTROY_RADIUS_MULTIPLIER,
} from "./constants";
import { destroyCircle } from "./bitmap";
import { createPlanet } from "./planet";
import { spawnMeteor, checkMeteorHitsPlanet, getActiveWords, handleBulletImpact } from "./meteor";
import { createTurretSlots, updateTurretPositions, findTurretsWithLineOfSight, fireBullet, isSlotGroundIntact } from "./turret";
import { buildTurretVisuals, rebuildSlotVisual, drawSlotInteractive, drawHighlightRing } from "./turretRendering";
import { createMeteorObject, createBulletGraphics } from "./meteorRendering";

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
  private hud!: Container;
  private planetContainer!: Container;
  private planetObj!: SceneObject;
  private planetTexture!: Texture;
  private meteorLayer!: Container;
  private bulletLayer!: Container;
  private highlightGfx!: Graphics;
  private waveLabel!: Text;
  private startButton!: Container;
  private startButtonText!: Text;

  private slots: TurretSlot[] = [];
  private turretVisuals!: TurretVisuals;

  private meteors: Meteor[] = [];
  private meteorObjects: MeteorObject[] = [];
  private bullets: Bullet[] = [];
  private bulletGfxList: Graphics[] = [];

  private langCode: string;
  private waveConfig: WaveConfig;
  private phase: WavePhase = "active";
  private meteorsSpawned = 0;
  private spawnTimer = 0;
  private nextSpawn = 2000;
  private planetRotation = 0;
  private cameraZoom = ACTIVE_WAVE_ZOOM;
  private cameraY = EARTH_CY;
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
    this.world = new Container();
    this.app.stage.addChild(this.world);

    this.hud = new Container();
    this.app.stage.addChild(this.hud);

    this.planetObj = createPlanet(EARTH_CX, EARTH_CY, EARTH_RADIUS, PLANET_COLOR);
    this.planetContainer = new Container();
    this.planetContainer.position.set(EARTH_CX, EARTH_CY);
    this.world.addChild(this.planetContainer);

    this.planetTexture = Texture.from({ resource: this.planetObj.bitmap, alphaMode: "premultiply-alpha-on-upload" });
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

    this.waveLabel = new Text({
      text: "Wave 1",
      style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 24, fill: 0xffffff },
    });
    this.waveLabel.position.set(20, 12);
    this.waveLabel.alpha = 0.7;
    this.hud.addChild(this.waveLabel);

    this.buildStartButton();
  }

  private buildStartButton() {
    this.startButton = new Container();
    this.startButton.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 60);
    this.startButton.visible = false;
    this.startButton.eventMode = "static";
    this.startButton.cursor = "pointer";
    this.startButton.on("pointertap", () => this.startNextWave());

    const bg = new Graphics();
    bg.roundRect(-90, -20, 180, 40, 8);
    bg.fill(0x3b82f6);
    this.startButton.addChild(bg);

    this.startButtonText = new Text({
      text: "Start Wave 2",
      style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 16, fill: 0xffffff },
    });
    this.startButtonText.anchor.set(0.5);
    this.startButton.addChild(this.startButtonText);

    this.hud.addChild(this.startButton);
  }

  private setupInput() {
    document.addEventListener("keydown", this.keydownHandler);
  }

  private onKeyDown(e: KeyboardEvent) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.key.length !== 1) return;

    const key = e.key;
    for (const meteor of this.meteors) {
      const nextChar = meteor.word[meteor.typedCount];
      if (key === nextChar) {
        meteor.typedCount++;
        if (meteor.typedCount >= meteor.word.length) {
          const meteorCx = meteor.x + meteor.width / 2;
          const meteorCy = meteor.y + meteor.height / 2;
          const turretsWithLos = findTurretsWithLineOfSight(this.slots, meteorCx, meteorCy);
          for (const turret of turretsWithLos) {
            this.addBullet(fireBullet(turret, meteor));
          }
          const usedWords = getActiveWords(this.meteors);
          meteor.word = getRandomWord(this.langCode, usedWords);
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
    this.startButton.visible = false;
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

  private update(dt: number) {
    const isActive = this.phase === "active";

    this.updateSpawning(dt, isActive);
    this.checkWaveComplete(isActive);
    this.updateCamera(dt, isActive);
    this.updatePlanet(dt, isActive);
    this.updateSlotVisuals();
    this.updateBullets(dt);
    this.updateMeteors(dt);
    this.syncMeteorDisplays();

    this.waveLabel.text = `Wave ${this.waveConfig.waveNumber}`;
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
      this.bullets.length === 0
    ) {
      this.phase = "complete";
      this.startButtonText.text = `Start Wave ${this.waveConfig.waveNumber + 1}`;
      this.startButton.visible = true;
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

      let removeBullet = false;

      if (
        bullet.x < -METEOR_CLEANUP_MARGIN || bullet.x > CANVAS_WIDTH + METEOR_CLEANUP_MARGIN ||
        bullet.y < -METEOR_CLEANUP_MARGIN || bullet.y > CANVAS_HEIGHT + METEOR_CLEANUP_MARGIN
      ) {
        removeBullet = true;
      } else if (!this.meteors.includes(bullet.target)) {
        removeBullet = true;
      } else {
        const targetCx = bullet.target.x + bullet.target.width / 2;
        const targetCy = bullet.target.y + bullet.target.height / 2;
        const bdx = targetCx - bullet.x;
        const bdy = targetCy - bullet.y;
        const bDist = Math.sqrt(bdx * bdx + bdy * bdy);

        if (bDist < bullet.target.radius * 0.8) {
          const meteorIdx = this.meteors.indexOf(bullet.target);
          if (meteorIdx !== -1) {
            const usedWords = getActiveWords(this.meteors);
            const result = handleBulletImpact(bullet.target, bullet.x, bullet.y, this.langCode, usedWords);

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
      }

      if (removeBullet) {
        this.removeBulletAt(i);
      } else {
        this.bulletGfxList[i].position.set(bullet.x, bullet.y);
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
        destroyCircle(this.planetObj, localCx, localCy, destroyRadius, PLANET_COLOR);

        const turretDestroyRadius = destroyRadius * TURRET_DESTROY_RADIUS_MULTIPLIER;
        const tdr2 = turretDestroyRadius * turretDestroyRadius;
        for (let si = 0; si < this.slots.length; si++) {
          const slot = this.slots[si];
          if (slot.destroyed) continue;
          const sdx = slot.x - cx;
          const sdy = slot.y - cy;
          if (sdx * sdx + sdy * sdy <= tdr2) {
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
  }

  destroy() {
    document.removeEventListener("keydown", this.keydownHandler);
    this.app.destroy(true, { children: true });
  }
}

export async function createWordDefenseGame(container: HTMLElement): Promise<WordDefenseGame> {
  const app = new Application();
  await app.init({
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundAlpha: 0,
    antialias: true,
    resolution: 1,
    preserveDrawingBuffer: true,
  });

  app.canvas.style.width = "100%";
  app.canvas.style.height = "auto";
  app.canvas.style.aspectRatio = "16/9";
  app.canvas.classList.add("rounded-lg");
  container.appendChild(app.canvas);

  return new WordDefenseGame(app);
}
