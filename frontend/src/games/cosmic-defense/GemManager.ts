import { Container, Graphics } from "pixi.js";
import { awardXP, type EntityDeathData, type GameState } from "./state";

const POP_SPEED = 100;
const POP_DURATION = 0.3;
const GRAVITY = 200;
const HOVER_DURATION = 1.5;
const GEM_MAX_LIFE = 12.0;
const COLLECTION_DIST = 8;
const LERP_START = 0.5;
const LERP_END = 12;

const TARGET_X = 60;
const TARGET_Y = 20;

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
  { xp: 3,  colors: { fill: 0xa6e3a1, edge: 0x94e2d5 }, size: 10 },
  { xp: 9,  colors: { fill: 0x89b4fa, edge: 0x74c7ec }, size: 14 },
  { xp: 25, colors: { fill: 0xcba6f7, edge: 0xb4befe }, size: 18 },
  { xp: 70, colors: { fill: 0xf9e2af, edge: 0xfab387 }, size: 24 },
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
  g: Graphics;
  elapsed: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  xpAmount: number;
  hoverX: number;
  hoverY: number;
}

export class GemManager {
  readonly layer: Container;

  private active: ActiveGem[] = [];
  private unsub: (() => void) | null = null;

  constructor() {
    this.layer = new Container();
  }

  subscribe(state: GameState): void {
    this.unsub = state.onEnemyEntityDeath.subscribe((data: EntityDeathData) => {
      this.spawn(data.x, data.y, data.xpAmount);
    });
  }

  private spawn(x: number, y: number, expectedXp: number): void {
    const gemType = rollGemType(expectedXp);
    const g = new Graphics();

    const s = gemType.size;
    g.moveTo(0, -s);
    g.lineTo(s * 0.6, -s * 0.2);
    g.lineTo(s * 0.6, s * 0.4);
    g.lineTo(0, s);
    g.lineTo(-s * 0.6, s * 0.4);
    g.lineTo(-s * 0.6, -s * 0.2);
    g.closePath();
    g.fill({ color: gemType.colors.fill, alpha: 0.9 });
    g.stroke({ color: gemType.colors.edge, width: 1.5, alpha: 1 });

    g.moveTo(-s * 0.3, -s * 0.5);
    g.lineTo(s * 0.1, -s * 0.1);
    g.lineTo(-s * 0.2, s * 0.1);
    g.closePath();
    g.fill({ color: 0xffffff, alpha: 0.3 });

    g.x = x;
    g.y = y;
    g.scale.set(0);

    this.layer.addChild(g);

    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
    const speed = POP_SPEED * (0.7 + Math.random() * 0.6);

    this.active.push({
      g,
      elapsed: 0,
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      xpAmount: gemType.xp,
      hoverX: x,
      hoverY: y,
    });
  }

  update(state: GameState, dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const gem = this.active[i];
      gem.elapsed += dt;

      if (gem.elapsed >= GEM_MAX_LIFE) {
        gem.g.destroy();
        this.active.splice(i, 1);
        continue;
      }

      if (gem.elapsed < POP_DURATION) {
        gem.vy += GRAVITY * dt;
        gem.x += gem.vx * dt;
        gem.y += gem.vy * dt;
        gem.hoverX = gem.x;
        gem.hoverY = gem.y;
        gem.g.x = gem.x;
        gem.g.y = gem.y;
      } else if (gem.elapsed < POP_DURATION + HOVER_DURATION) {
        const hoverT = gem.elapsed - POP_DURATION;
        gem.g.x = gem.hoverX;
        gem.g.y = gem.hoverY + Math.sin(hoverT * Math.PI * 2.5) * 4;
      } else {
        const dx = TARGET_X - gem.x;
        const dy = TARGET_Y - gem.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < COLLECTION_DIST) {
          awardXP(state, gem.xpAmount);
          gem.g.destroy();
          this.active.splice(i, 1);
          continue;
        }

        const homingTime = gem.elapsed - POP_DURATION - HOVER_DURATION;
        const t = 1 - Math.exp(-dt * (LERP_START + homingTime * LERP_END));
        gem.x += dx * t;
        gem.y += dy * t;
        gem.g.x = gem.x;
        gem.g.y = gem.y;
      }

      const easeInDur = 0.15;
      if (gem.elapsed < easeInDur) {
        const p = gem.elapsed / easeInDur;
        gem.g.scale.set(p * (2 - p));
      } else {
        gem.g.scale.set(1);
      }

      const distToTarget = Math.sqrt((TARGET_X - gem.x) ** 2 + (TARGET_Y - gem.y) ** 2);
      const fadeDist = 40;
      gem.g.alpha = distToTarget < fadeDist ? distToTarget / fadeDist : 1;
      gem.g.rotation = gem.elapsed * Math.PI * 3;
    }
  }

  destroy(): void {
    this.unsub?.();
    for (const gem of this.active) gem.g.destroy();
    this.active.length = 0;
    this.layer.destroy();
  }
}
