import { BlurFilter, Container, Graphics } from "pixi.js";
import { awardXP, type EntityDeathData, type GameState } from "./state";

const GEM_MAX_LIFE = 12.0;
const COLLECTION_DIST = 8;
const LERP_START = 0.5;
const LERP_END = 12;

const TARGET_X = 60;
const TARGET_Y = 20;

const GLOW_BLUR_STRENGTH = 12;
const GLOW_BLUR_QUALITY = 3;
const GLOW_OUTER_RADIUS_MULTIPLIER = 2.5;
const GLOW_INNER_RADIUS_MULTIPLIER = 1.5;
const GLOW_OUTER_ALPHA = 0.3;
const GLOW_INNER_ALPHA = 0.55;
const CORE_HIGHLIGHT_RADIUS_MULTIPLIER = 0.35;

interface GemColors {
  fill: number;
  edge: number;
}

interface GemType {
  xp: number;
  colors: GemColors;
  size: number;
}

const GEM_TYPES: GemType[] = [
  { xp: 3,   colors: { fill: 0xa6e3a1, edge: 0x94e2d5 }, size: 10 },
  { xp: 9,   colors: { fill: 0x89b4fa, edge: 0x74c7ec }, size: 14 },
  { xp: 25,  colors: { fill: 0xcba6f7, edge: 0xb4befe }, size: 18 },
  { xp: 70,  colors: { fill: 0xf9e2af, edge: 0xfab387 }, size: 24 },
  { xp: 250, colors: { fill: 0xff6b6b, edge: 0xe55c7b }, size: 32 },
];

function rollGemType(expectedXp: number): GemType {
  if (expectedXp <= GEM_TYPES[0].xp) return GEM_TYPES[0];
  if (expectedXp >= GEM_TYPES[GEM_TYPES.length - 1].xp) return GEM_TYPES[GEM_TYPES.length - 1];

  for (let i = 0; i < GEM_TYPES.length - 1; i++) {
    const lo = GEM_TYPES[i];
    const hi = GEM_TYPES[i + 1];
    if (expectedXp >= lo.xp && expectedXp <= hi.xp) {
      const pHigh = (expectedXp - lo.xp) / (hi.xp - lo.xp);
      return Math.random() < pHigh ? hi : lo;
    }
  }

  return GEM_TYPES[GEM_TYPES.length - 1];
}

interface ActiveGem {
  glow: Graphics;
  core: Graphics;
  elapsed: number;
  x: number;
  y: number;
  xpAmount: number;
}

export class GemManager {
  readonly layer: Container;
  private glowLayer: Container;
  private coreLayer: Container;

  private active: ActiveGem[] = [];
  private unsub: (() => void) | null = null;

  constructor() {
    this.layer = new Container();
    this.glowLayer = new Container();
    this.coreLayer = new Container();
    this.glowLayer.filters = [new BlurFilter({ strength: GLOW_BLUR_STRENGTH, quality: GLOW_BLUR_QUALITY })];
    this.layer.addChild(this.glowLayer);
    this.layer.addChild(this.coreLayer);
  }

  subscribe(state: GameState): void {
    this.unsub = state.onEnemyEntityDeath.subscribe((data: EntityDeathData) => {
      this.spawn(data.x, data.y, data.xpAmount);
    });
  }

  private spawn(x: number, y: number, expectedXp: number): void {
    const gemType = rollGemType(expectedXp);
    const radius = gemType.size / 2;
    const color = gemType.colors.fill;

    const glow = new Graphics();
    glow.circle(0, 0, radius * GLOW_OUTER_RADIUS_MULTIPLIER);
    glow.fill({ color, alpha: GLOW_OUTER_ALPHA });
    glow.circle(0, 0, radius * GLOW_INNER_RADIUS_MULTIPLIER);
    glow.fill({ color, alpha: GLOW_INNER_ALPHA });
    glow.x = x;
    glow.y = y;
    glow.scale.set(0);
    this.glowLayer.addChild(glow);

    const core = new Graphics();
    core.moveTo(0, -radius);
    core.lineTo(radius * 0.65, 0);
    core.lineTo(0, radius);
    core.lineTo(-radius * 0.65, 0);
    core.closePath();
    core.fill({ color });
    core.circle(0, 0, radius * CORE_HIGHLIGHT_RADIUS_MULTIPLIER);
    core.fill({ color: 0xffffff, alpha: 0.7 });
    core.x = x;
    core.y = y;
    core.scale.set(0);
    this.coreLayer.addChild(core);

    this.active.push({
      glow,
      core,
      elapsed: 0,
      x,
      y,
      xpAmount: gemType.xp,
    });
  }

  update(state: GameState, dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const gem = this.active[i];
      gem.elapsed += dt;

      if (gem.elapsed >= GEM_MAX_LIFE) {
        gem.glow.destroy();
        gem.core.destroy();
        this.active.splice(i, 1);
        continue;
      }

      const dx = TARGET_X - gem.x;
      const dy = TARGET_Y - gem.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < COLLECTION_DIST) {
        awardXP(state, gem.xpAmount);
        gem.glow.destroy();
        gem.core.destroy();
        this.active.splice(i, 1);
        continue;
      }

      const t = 1 - Math.exp(-dt * (LERP_START + gem.elapsed * LERP_END));
      gem.x += dx * t;
      gem.y += dy * t;
      gem.glow.x = gem.x;
      gem.glow.y = gem.y;
      gem.core.x = gem.x;
      gem.core.y = gem.y;

      const easeInDur = 0.15;
      const progress = gem.elapsed / easeInDur;
      const scale = gem.elapsed < easeInDur
        ? progress * (2 - progress)
        : 1;
      gem.glow.scale.set(scale);
      gem.core.scale.set(scale);

      const distToTarget = Math.sqrt((TARGET_X - gem.x) ** 2 + (TARGET_Y - gem.y) ** 2);
      const fadeDist = 40;
      const alpha = distToTarget < fadeDist ? distToTarget / fadeDist : 1;
      gem.glow.alpha = alpha;
      gem.core.alpha = alpha;
    }
  }

  destroy(): void {
    this.unsub?.();
    for (const gem of this.active) {
      gem.glow.destroy();
      gem.core.destroy();
    }
    this.active.length = 0;
    this.layer.destroy();
  }
}
