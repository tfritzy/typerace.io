import { Container, Graphics } from "pixi.js";
import type { GameState, DamageData } from "./state";
import { CANVAS_WIDTH } from "./constants";

const GEM_LIFETIME = 0.8;
const GEM_SIZE = 6;

const TARGET_X = CANVAS_WIDTH - 60;
const TARGET_Y = 20;

interface GemColors {
  fill: number;
  edge: number;
  glow: number;
}

const GEM_TIERS: { minXp: number; colors: GemColors; size: number }[] = [
  { minXp: 20, colors: { fill: 0xf9e2af, edge: 0xfab387, glow: 0xf9e2af }, size: 10 },
  { minXp: 10, colors: { fill: 0xcba6f7, edge: 0xb4befe, glow: 0xcba6f7 }, size: 8 },
  { minXp: 5, colors: { fill: 0x89b4fa, edge: 0x74c7ec, glow: 0x89b4fa }, size: 7 },
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
  startX: number;
  startY: number;
  cpX: number;
  cpY: number;
}

export class GemManager {
  readonly layer: Container;

  private active: ActiveGem[] = [];
  private unsub: (() => void) | null = null;

  constructor() {
    this.layer = new Container();
  }

  subscribe(state: GameState): void {
    this.unsub = state.onDamageDealt.subscribe((data: DamageData) => {
      if (data.killed) {
        this.spawn(data.x, data.y, data.amount);
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

    const midX = (x + TARGET_X) / 2 + (Math.random() - 0.5) * 200;
    const midY = Math.min(y, TARGET_Y) - 80 - Math.random() * 120;

    this.active.push({
      g,
      elapsed: 0,
      startX: x,
      startY: y,
      cpX: midX,
      cpY: midY,
    });
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const gem = this.active[i];
      gem.elapsed += dt;
      const t = Math.min(1, gem.elapsed / GEM_LIFETIME);

      if (t >= 1) {
        gem.g.destroy();
        this.active.splice(i, 1);
        continue;
      }

      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const u = 1 - ease;
      gem.g.x = u * u * gem.startX + 2 * u * ease * gem.cpX + ease * ease * TARGET_X;
      gem.g.y = u * u * gem.startY + 2 * u * ease * gem.cpY + ease * ease * TARGET_Y;

      if (t < 0.1) {
        gem.g.scale.set(t / 0.1);
        gem.g.alpha = 1;
      } else if (t > 0.75) {
        const fade = (t - 0.75) / 0.25;
        gem.g.scale.set(1 - fade * 0.5);
        gem.g.alpha = 1 - fade * 0.3;
      } else {
        gem.g.scale.set(1);
        gem.g.alpha = 1;
      }

      gem.g.rotation = t * Math.PI * 2;
    }
  }

  destroy(): void {
    this.unsub?.();
    for (const gem of this.active) gem.g.destroy();
    this.active.length = 0;
    this.layer.destroy();
  }
}
