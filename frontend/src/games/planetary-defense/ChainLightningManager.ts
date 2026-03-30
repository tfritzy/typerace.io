import { Container, Graphics } from "pixi.js";
import type { GameState, ChainHitData } from "./state";

const CHAIN_DURATION = 0.15;
const CHAIN_COLOR = 0xfbbf24;
const CHAIN_WIDTH = 2;

interface ActiveChain {
  graphics: Graphics;
  elapsed: number;
}

export class ChainLightningManager {
  readonly container: Container;
  private active: ActiveChain[] = [];
  private unsub: (() => void) | null = null;

  constructor() {
    this.container = new Container();
  }

  subscribe(state: GameState): void {
    this.unsub = state.onChainHit.subscribe((data: ChainHitData) => {
      this.spawn(data);
    });
  }

  private spawn(data: ChainHitData): void {
    const g = new Graphics();
    g.moveTo(data.fromX, data.fromY);
    g.lineTo(data.toX, data.toY);
    g.stroke({ color: CHAIN_COLOR, width: CHAIN_WIDTH });

    this.container.addChild(g);
    this.active.push({ graphics: g, elapsed: 0 });
  }

  update(dt: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const chain = this.active[i];
      chain.elapsed += dt;
      const t = chain.elapsed / CHAIN_DURATION;

      if (t >= 1) {
        chain.graphics.destroy();
        this.active.splice(i, 1);
        continue;
      }

      chain.graphics.alpha = 1 - t;
    }
  }

  destroy(): void {
    this.unsub?.();
    for (const chain of this.active) chain.graphics.destroy();
    this.active.length = 0;
    this.container.destroy();
  }
}
