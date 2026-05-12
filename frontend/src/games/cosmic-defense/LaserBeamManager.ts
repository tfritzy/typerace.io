import { BlurFilter, Container, Graphics } from "pixi.js";
import type { GameState } from "./state";

const BEAM_DURATION = 0.35;
const GLOW_BLUR_STRENGTH = 4;
const GLOW_BLUR_QUALITY = 4;

const GLOW_STROKE_OUTER = { width: 0, color: 0, alpha: 0 };
const GLOW_STROKE_INNER = { width: 0, color: 0, alpha: 0 };
const CORE_STROKE_MAIN = { width: 0, color: 0, alpha: 0 };
const CORE_STROKE_HIGHLIGHT = { width: 0, color: 0xffffff, alpha: 0 };

export class LaserBeamManager {
  readonly layer: Container;

  private glowContainer: Container;
  private coreContainer: Container;
  private glowObjects = new Map<number, Graphics>();
  private coreObjects = new Map<number, Graphics>();
  private activeIds = new Set<number>();

  constructor() {
    this.layer = new Container();
    this.glowContainer = new Container();
    this.coreContainer = new Container();
    this.glowContainer.filters = [new BlurFilter({ strength: GLOW_BLUR_STRENGTH, quality: GLOW_BLUR_QUALITY })];
    this.layer.addChild(this.glowContainer);
    this.layer.addChild(this.coreContainer);
  }

  update(state: GameState): void {
    this.activeIds.clear();

    for (const beam of state.laserBeams) {
      this.activeIds.add(beam.id);

      let glow = this.glowObjects.get(beam.id);
      if (!glow) {
        glow = new Graphics();
        this.glowContainer.addChild(glow);
        this.glowObjects.set(beam.id, glow);
      }

      let core = this.coreObjects.get(beam.id);
      if (!core) {
        core = new Graphics();
        this.coreContainer.addChild(core);
        this.coreObjects.set(beam.id, core);
      }

      const age = state.time.time - beam.time;
      const alpha = Math.max(0, 1 - age / BEAM_DURATION);

      GLOW_STROKE_OUTER.width = beam.width * 3;
      GLOW_STROKE_OUTER.color = beam.color;
      GLOW_STROKE_OUTER.alpha = alpha * 0.4;
      GLOW_STROKE_INNER.width = beam.width * 1.5;
      GLOW_STROKE_INNER.color = beam.color;
      GLOW_STROKE_INNER.alpha = alpha * 0.6;
      CORE_STROKE_MAIN.width = beam.width * 1.25;
      CORE_STROKE_MAIN.color = beam.color;
      CORE_STROKE_MAIN.alpha = alpha;
      CORE_STROKE_HIGHLIGHT.width = Math.max(0.5, beam.width * 0.4);
      CORE_STROKE_HIGHLIGHT.alpha = alpha;

      glow.clear();
      glow.moveTo(beam.x1, beam.y1);
      glow.lineTo(beam.x2, beam.y2);
      glow.stroke(GLOW_STROKE_OUTER);
      glow.moveTo(beam.x1, beam.y1);
      glow.lineTo(beam.x2, beam.y2);
      glow.stroke(GLOW_STROKE_INNER);

      core.clear();
      core.moveTo(beam.x1, beam.y1);
      core.lineTo(beam.x2, beam.y2);
      core.stroke(CORE_STROKE_MAIN);
      core.moveTo(beam.x1, beam.y1);
      core.lineTo(beam.x2, beam.y2);
      core.stroke(CORE_STROKE_HIGHLIGHT);
    }

    for (const [id, g] of this.glowObjects) {
      if (!this.activeIds.has(id)) {
        g.destroy();
        this.glowObjects.delete(id);
      }
    }
    for (const [id, g] of this.coreObjects) {
      if (!this.activeIds.has(id)) {
        g.destroy();
        this.coreObjects.delete(id);
      }
    }
  }

  destroy(): void {
    for (const g of this.glowObjects.values()) g.destroy();
    this.glowObjects.clear();
    for (const g of this.coreObjects.values()) g.destroy();
    this.coreObjects.clear();
    this.layer.destroy();
  }
}
