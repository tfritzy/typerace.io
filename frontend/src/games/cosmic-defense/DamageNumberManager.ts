import { Container, Text } from "pixi.js";
import type { GameState, DamageData } from "./state";
import { PIXEL_FONT_FAMILY } from "./constants";

const DURATION_S = 0.9;
const FLY_DISTANCE = 60;
const FONT_SIZE = 24;
const STROKE_WIDTH = 4;

interface ActiveNumber {
  text: Text;
  elapsed: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

export class DamageNumberManager {
  readonly container: Container;

  private active: ActiveNumber[] = [];
  private unsub: (() => void) | null = null;

  constructor() {
    this.container = new Container();
  }

  subscribe(state: GameState): void {
    this.unsub = state.onDamageDealt.subscribe((data: DamageData) => {
      this.spawn(data);
    });
  }

  private spawn(data: DamageData): void {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const dx = Math.cos(angle) * FLY_DISTANCE;
    const dy = Math.sin(angle) * FLY_DISTANCE;

    const text = new Text({
      text: String(Math.round(data.amount)),
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: FONT_SIZE,
        fontWeight: "400",
        fill: data.killed ? 0xfbbf24 : 0xffffff,
        stroke: { color: 0x000000, width: STROKE_WIDTH },
      },
    });
    text.anchor.set(0.5);
    text.x = data.x;
    text.y = data.y;
    text.scale.set(0);
    text.alpha = 0;

    this.container.addChild(text);
    this.active.push({
      text,
      elapsed: 0,
      startX: data.x,
      startY: data.y,
      dx,
      dy,
    });
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const n = this.active[i];
      n.elapsed += dt;
      const t = n.elapsed / DURATION_S;

      if (t >= 1) {
        n.text.destroy();
        this.active.splice(i, 1);
        continue;
      }

      if (t < 0.12) {
        const p = t / 0.12;
        n.text.scale.set(p * 1.5);
        n.text.alpha = p;
      } else if (t < 0.25) {
        const p = (t - 0.12) / (0.25 - 0.12);
        n.text.scale.set(1.5 - 0.5 * p);
        n.text.alpha = 1;
      } else {
        const p = (t - 0.25) / (1 - 0.25);
        const ease = 1 - (1 - p) * (1 - p);
        n.text.x = n.startX + n.dx * ease;
        n.text.y = n.startY + n.dy * ease;
        n.text.scale.set(1 - 0.6 * ease);
        n.text.alpha = 1 - p;
      }
    }
  }

  destroy(): void {
    this.unsub?.();
    for (const n of this.active) n.text.destroy();
    this.active.length = 0;
    this.container.destroy();
  }
}
