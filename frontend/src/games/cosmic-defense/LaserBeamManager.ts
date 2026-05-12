import { BlurFilter, Container, Graphics } from "pixi.js";
import type { GameState } from "./state";

const BEAM_DURATION = 0.35;
const GLOW_BLUR_STRENGTH = 4;
const GLOW_BLUR_QUALITY = 4;

const _glowStrokeOuter = { width: 0, color: 0, alpha: 0 };
const _glowStrokeInner = { width: 0, color: 0, alpha: 0 };
const _coreStrokeMain = { width: 0, color: 0, alpha: 0 };
const _coreStrokeHighlight = { width: 0, color: 0xffffff, alpha: 0 };

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

      _glowStrokeOuter.width = beam.width * 3;
      _glowStrokeOuter.color = beam.color;
      _glowStrokeOuter.alpha = alpha * 0.4;
      _glowStrokeInner.width = beam.width * 1.5;
      _glowStrokeInner.color = beam.color;
      _glowStrokeInner.alpha = alpha * 0.6;
      _coreStrokeMain.width = beam.width * 1.25;
      _coreStrokeMain.color = beam.color;
      _coreStrokeMain.alpha = alpha;
      _coreStrokeHighlight.width = Math.max(0.5, beam.width * 0.4);
      _coreStrokeHighlight.alpha = alpha;

      glow.clear();
      glow.moveTo(beam.x1, beam.y1);
      glow.lineTo(beam.x2, beam.y2);
      glow.stroke(_glowStrokeOuter);
      glow.moveTo(beam.x1, beam.y1);
      glow.lineTo(beam.x2, beam.y2);
      glow.stroke(_glowStrokeInner);

      core.clear();
      core.moveTo(beam.x1, beam.y1);
      core.lineTo(beam.x2, beam.y2);
      core.stroke(_coreStrokeMain);
      core.moveTo(beam.x1, beam.y1);
      core.lineTo(beam.x2, beam.y2);
      core.stroke(_coreStrokeHighlight);
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
