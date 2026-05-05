import { Container, Text } from "pixi.js";
import type { GameState, DamageData } from "./state";

const LIFETIME_S = 1.0;
const GRAVITY = 280;
const INITIAL_SPEED = 160;
const FADE_START = 0.6;
const POP_DURATION = 0.08;
const FONT_SIZE = 24;
const STROKE_WIDTH = 4;

interface ActiveNumber {
  text: Text;
  elapsed: number;
  vx: number;
  vy: number;
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
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
    const vx = Math.cos(angle) * INITIAL_SPEED;
    const vy = Math.sin(angle) * INITIAL_SPEED;

    const fillColor = data.isPlasma ? 0xff4400 : 0xffffff;
    const strokeColor = data.isPlasma ? 0x7a1a00 : 0x000000;

    const text = new Text({
      text: String(Math.round(data.amount)),
      style: {
        fontFamily: "Arial",
        fontSize: FONT_SIZE,
        fontWeight: "700",
        fill: fillColor,
        stroke: { color: strokeColor, width: STROKE_WIDTH },
      },
    });
    text.anchor.set(0.5);
    text.x = data.x;
    text.y = data.y;
    text.scale.set(0);
    text.alpha = 0;

    this.container.addChild(text);
    this.active.push({ text, elapsed: 0, vx, vy });
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const n = this.active[i];
      n.elapsed += dt;
      const t = n.elapsed / LIFETIME_S;

      if (t >= 1) {
        n.text.destroy();
        this.active.splice(i, 1);
        continue;
      }

      if (t < POP_DURATION) {
        const p = t / POP_DURATION;
        n.text.scale.set(p * 1.3);
        n.text.alpha = p;
      } else {
        n.text.scale.set(1);
        n.text.alpha = t < FADE_START ? 1 : 1 - (t - FADE_START) / (1 - FADE_START);
      }

      n.vy += GRAVITY * dt;
      n.text.x += n.vx * dt;
      n.text.y += n.vy * dt;
    }
  }

  destroy(): void {
    this.unsub?.();
    for (const n of this.active) n.text.destroy();
    this.active.length = 0;
    this.container.destroy();
  }
}
