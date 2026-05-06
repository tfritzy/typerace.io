import { BlurFilter, Container, Graphics } from "pixi.js";
import type { GameState } from "./state";

const DEFAULT_PROJECTILE_SIZE = 5;
const GLOW_BLUR_STRENGTH = 10;
const GLOW_BLUR_QUALITY = 3;
const DEFAULT_COLOR = 0xffd700;
const GLOW_OUTER_RADIUS_MULTIPLIER = 3;
const GLOW_INNER_RADIUS_MULTIPLIER = 1.8;
const GLOW_OUTER_ALPHA = 0.35;
const GLOW_INNER_ALPHA = 0.6;
const CORE_HIGHLIGHT_RADIUS_MULTIPLIER = 0.45;
const CORE_HIGHLIGHT_COLOR = 0xffffff;

function getProjectileColor(state: GameState, shooterId: number): number {
  return state.entityById.get(shooterId)?.projectileColor ?? DEFAULT_COLOR;
}

function getProjectileSize(state: GameState, shooterId: number): number {
  return state.entityById.get(shooterId)?.projectileSize ?? DEFAULT_PROJECTILE_SIZE;
}

export class ProjectileManager {
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

    for (const proj of state.projectiles) {
      this.activeIds.add(proj.id);

      let glow = this.glowObjects.get(proj.id);
      let core = this.coreObjects.get(proj.id);
      if (!glow || !core) {
        const color = getProjectileColor(state, proj.shooterId);
        const size = getProjectileSize(state, proj.shooterId);
        if (!glow) {
          glow = new Graphics();
          glow.circle(0, 0, size * GLOW_OUTER_RADIUS_MULTIPLIER);
          glow.fill({ color, alpha: GLOW_OUTER_ALPHA });
          glow.circle(0, 0, size * GLOW_INNER_RADIUS_MULTIPLIER);
          glow.fill({ color, alpha: GLOW_INNER_ALPHA });
          this.glowContainer.addChild(glow);
          this.glowObjects.set(proj.id, glow);
        }
        if (!core) {
          core = new Graphics();
          core.circle(0, 0, size);
          core.fill({ color });
          core.circle(0, 0, size * CORE_HIGHLIGHT_RADIUS_MULTIPLIER);
          core.fill({ color: CORE_HIGHLIGHT_COLOR });
          this.coreContainer.addChild(core);
          this.coreObjects.set(proj.id, core);
        }
      }

      glow.x = proj.x;
      glow.y = proj.y;
      core.x = proj.x;
      core.y = proj.y;
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
