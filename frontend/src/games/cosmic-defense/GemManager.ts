import { Container, Graphics } from "pixi.js";
import { awardXP, type GameState, type DamageData } from "./state";

const GEM_SIZE = 4;
const POP_SPEED = 100;
const POP_DURATION = 0.3;
const GRAVITY = 200;
const GEM_MAX_LIFE = 3.0;
const COLLECTION_DIST = 8;
const LERP_START = 0.5;
const LERP_END = 12;

const TARGET_X = 60;
const TARGET_Y = 20;

interface GemColors {
  fill: number;
  edge: number;
  glow: number;
}

const GEM_TIERS: { minXp: number; colors: GemColors; size: number }[] = [
  { minXp: 20, colors: { fill: 0xf9e2af, edge: 0xfab387, glow: 0xf9e2af }, size: 7 },
  { minXp: 10, colors: { fill: 0xcba6f7, edge: 0xb4befe, glow: 0xcba6f7 }, size: 6 },
  { minXp: 5, colors: { fill: 0x89b4fa, edge: 0x74c7ec, glow: 0x89b4fa }, size: 5 },
  { minXp: 0, colors: { fill: 0xa6e3a1, edge: 0x94e2d5, glow: 0xa6e3a1 }, size: GEM_SIZE },
];

function getTier(xp: number): typeof GEM_TIERS[number] {
  for (const tier of GEM_TIERS) {
    if (xp >= tier.minXp) return tier;
  }
  return GEM_TIERS[GEM_TIERS.length - 1];
}

interface ActiveGem {
  g: Graphics;
  elapsed: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  xpAmount: number;
}

export class GemManager {
  readonly layer: Container;

  private active: ActiveGem[] = [];
  private unsub: (() => void) | null = null;
  private state!: GameState;

  constructor() {
    this.layer = new Container();
  }

  subscribe(state: GameState): void {
    this.state = state;
    this.unsub = state.onDamageDealt.subscribe((data: DamageData) => {
      if (data.killed && data.xpDropped > 0) {
        this.spawn(data.x, data.y, data.xpDropped);
      }
    });
  }

  private spawn(x: number, y: number, xpAmount: number): void {
    const tier = getTier(xpAmount);
    const g = new Graphics();

    const s = tier.size;
    g.moveTo(0, -s);
    g.lineTo(s * 0.6, -s * 0.2);
    g.lineTo(s * 0.6, s * 0.4);
    g.lineTo(0, s);
    g.lineTo(-s * 0.6, s * 0.4);
    g.lineTo(-s * 0.6, -s * 0.2);
    g.closePath();
    g.fill({ color: tier.colors.fill, alpha: 0.9 });
    g.stroke({ color: tier.colors.edge, width: 1.5, alpha: 1 });

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
      xpAmount,
    });
  }

  update(dt: number): void {
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
      } else {
        const dx = TARGET_X - gem.x;
        const dy = TARGET_Y - gem.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < COLLECTION_DIST) {
          awardXP(this.state, gem.xpAmount);
          gem.g.destroy();
          this.active.splice(i, 1);
          continue;
        }

        const homingTime = gem.elapsed - POP_DURATION;
        const t = 1 - Math.exp(-dt * (LERP_START + homingTime * LERP_END));
        gem.x += dx * t;
        gem.y += dy * t;
      }

      gem.g.x = gem.x;
      gem.g.y = gem.y;

      const easeInDur = 0.15;
      if (gem.elapsed < easeInDur) {
        const p = gem.elapsed / easeInDur;
        gem.g.scale.set(p * (2 - p));
      } else {
        gem.g.scale.set(1);
      }

      const dist = Math.sqrt((TARGET_X - gem.x) ** 2 + (TARGET_Y - gem.y) ** 2);
      const fadeDist = 40;
      gem.g.alpha = dist < fadeDist ? dist / fadeDist : 1;
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
