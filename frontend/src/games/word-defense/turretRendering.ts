import { Container, Graphics, Circle } from "pixi.js";
import { TurretType } from "./types";
import type { TurretSlot, TurretVisuals } from "./types";
import {
  EARTH_RADIUS,
  TURRET_BARREL_LENGTH, TURRET_BARREL_WIDTH, TURRET_BASE_RADIUS,
  SLOT_INTERACTIVE_RADIUS, SLOT_HIT_BUFFER,
  MISSILE_RENDER_LENGTH,
} from "./constants";

export function createTurretContainer(slot: TurretSlot): Container {
  const container = new Container();
  container.position.set(
    Math.cos(slot.baseAngle) * EARTH_RADIUS,
    Math.sin(slot.baseAngle) * EARTH_RADIUS,
  );

  if (slot.turretType === TurretType.Missile) {
    const barrel = new Graphics();
    barrel.rect(0, -TURRET_BARREL_WIDTH / 2, MISSILE_RENDER_LENGTH + 4, TURRET_BARREL_WIDTH + 2);
    barrel.fill(0x8b4513);
    barrel.rotation = slot.baseAngle;
    container.addChild(barrel);

    const base = new Graphics();
    base.circle(0, 0, TURRET_BASE_RADIUS + 2);
    base.fill(0xcc5500);
    container.addChild(base);
  } else if (slot.turretType === TurretType.Laser) {
    const barrel = new Graphics();
    barrel.rect(0, -TURRET_BARREL_WIDTH / 2, TURRET_BARREL_LENGTH + 2, TURRET_BARREL_WIDTH - 1);
    barrel.fill(0xcc0000);
    barrel.rotation = slot.baseAngle;
    container.addChild(barrel);

    const base = new Graphics();
    base.circle(0, 0, TURRET_BASE_RADIUS + 1);
    base.fill(0xff2222);
    container.addChild(base);
  } else if (slot.turretType === TurretType.Railgun) {
    const barrel = new Graphics();
    barrel.rect(0, -TURRET_BARREL_WIDTH / 2, TURRET_BARREL_LENGTH + 6, TURRET_BARREL_WIDTH);
    barrel.fill(0x2266cc);
    barrel.rotation = slot.baseAngle;
    container.addChild(barrel);

    const base = new Graphics();
    base.circle(0, 0, TURRET_BASE_RADIUS + 2);
    base.fill(0x44aaff);
    container.addChild(base);
  } else {
    const barrel = new Graphics();
    barrel.rect(0, -TURRET_BARREL_WIDTH / 2, TURRET_BARREL_LENGTH, TURRET_BARREL_WIDTH);
    barrel.fill(0x6b7280);
    barrel.rotation = slot.baseAngle;
    container.addChild(barrel);

    const base = new Graphics();
    base.circle(0, 0, TURRET_BASE_RADIUS);
    base.fill(0x9ca3af);
    container.addChild(base);
  }

  return container;
}

export function createEmptySlotDot(slot: TurretSlot): Graphics {
  const g = new Graphics();
  g.circle(0, 0, 2);
  g.fill({ color: 0xffffff, alpha: 0.15 });
  g.position.set(
    Math.cos(slot.baseAngle) * EARTH_RADIUS,
    Math.sin(slot.baseAngle) * EARTH_RADIUS,
  );
  return g;
}

export function createSlotHitArea(slot: TurretSlot): Graphics {
  const g = new Graphics();
  g.eventMode = "static";
  g.cursor = "pointer";
  g.hitArea = new Circle(0, 0, SLOT_INTERACTIVE_RADIUS + SLOT_HIT_BUFFER);
  g.position.set(
    Math.cos(slot.baseAngle) * EARTH_RADIUS,
    Math.sin(slot.baseAngle) * EARTH_RADIUS,
  );
  g.visible = false;
  return g;
}

export function drawSlotInteractive(g: Graphics, isSelected: boolean, isHovered: boolean) {
  g.clear();
  const circleAlpha = isSelected ? 0.8 : isHovered ? 0.5 : 0.3;
  const plusAlpha = isSelected ? 0.7 : isHovered ? 0.4 : 0.2;

  g.circle(0, 0, SLOT_INTERACTIVE_RADIUS);
  g.stroke({ color: 0xffffff, alpha: circleAlpha, width: isSelected ? 2 : 1.5 });

  g.moveTo(-4, 0);
  g.lineTo(4, 0);
  g.moveTo(0, -4);
  g.lineTo(0, 4);
  g.stroke({ color: 0xffffff, alpha: plusAlpha, width: 1.5 });
}

export function drawHighlightRing(gfx: Graphics, x: number, y: number, isSelected: boolean) {
  gfx.circle(x, y, TURRET_BASE_RADIUS + 5);
  gfx.stroke({
    color: 0xffffff,
    alpha: isSelected ? 0.8 : 0.4,
    width: 2,
  });
}

export function buildTurretVisuals(slots: TurretSlot[], parent: Container): TurretVisuals {
  const containers: (Container | null)[] = [];
  const emptySlotGfx: (Graphics | null)[] = [];
  const hitAreas: Graphics[] = [];

  for (const slot of slots) {
    if (slot.filled) {
      const tc = createTurretContainer(slot);
      parent.addChild(tc);
      containers.push(tc);
      emptySlotGfx.push(null);
    } else {
      const eg = createEmptySlotDot(slot);
      parent.addChild(eg);
      containers.push(null);
      emptySlotGfx.push(eg);
    }

    const hitArea = createSlotHitArea(slot);
    parent.addChild(hitArea);
    hitAreas.push(hitArea);
  }

  return { containers, emptySlotGfx, hitAreas };
}

export function rebuildSlotVisual(
  index: number,
  slots: TurretSlot[],
  visuals: TurretVisuals,
  parent: Container,
) {
  const slot = slots[index];

  if (slot.destroyed) {
    if (visuals.containers[index]) {
      visuals.containers[index]!.destroy({ children: true });
      visuals.containers[index] = null;
    }
    if (visuals.emptySlotGfx[index]) {
      visuals.emptySlotGfx[index]!.destroy();
      visuals.emptySlotGfx[index] = null;
    }
    visuals.hitAreas[index].visible = false;
    visuals.hitAreas[index].eventMode = "none";
    return;
  }

  if (slot.filled && !visuals.containers[index]) {
    if (visuals.emptySlotGfx[index]) {
      visuals.emptySlotGfx[index]!.destroy();
      visuals.emptySlotGfx[index] = null;
    }
    const tc = createTurretContainer(slot);
    parent.addChild(tc);
    visuals.containers[index] = tc;
  } else if (!slot.filled && visuals.containers[index]) {
    visuals.containers[index]!.destroy({ children: true });
    visuals.containers[index] = null;
    const eg = createEmptySlotDot(slot);
    parent.addChild(eg);
    visuals.emptySlotGfx[index] = eg;
  }
}
