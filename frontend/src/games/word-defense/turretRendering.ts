import { Container, Graphics, Circle } from "pixi.js";
import { TurretType } from "./types";
import type { TurretSlot, TurretVisuals } from "./types";
import {
  EARTH_RADIUS,
  SLOT_INTERACTIVE_RADIUS, SLOT_HIT_BUFFER,
  TURRET_BASE_RADIUS,
} from "./constants";

export function createTurretContainer(slot: TurretSlot): Container {
  const container = new Container();
  const offsetRadius = EARTH_RADIUS + 25;
  container.position.set(
    Math.cos(slot.baseAngle) * offsetRadius,
    Math.sin(slot.baseAngle) * offsetRadius,
  );
  container.rotation = 0;

  let color = 0x94a3b8;
  if (slot.turretType === TurretType.Missile) color = 0xf59e0b;
  else if (slot.turretType === TurretType.Laser) color = 0x60a5fa;
  else if (slot.turretType === TurretType.Railgun) color = 0xa855f7;

  const hex = new Graphics();
  const hexRadius = 15;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(angle) * hexRadius;
    const y = Math.sin(angle) * hexRadius;
    if (i === 0) hex.moveTo(x, y);
    else hex.lineTo(x, y);
  }
  hex.closePath();
  hex.fill({ color: color, alpha: 0.2 });
  hex.stroke({ color: color, width: 2, alpha: 0.9 });
  container.addChild(hex);

  const icon = new Graphics();
  icon.rotation = -Math.PI / 4;

  if (slot.turretType === TurretType.Missile) {
    // Standard Rod Body
    icon.rect(-6, -1.5, 10, 3);
    icon.fill(color);
    
    // Pointy Tip
    icon.moveTo(4, -1.5);
    icon.lineTo(8, 0);
    icon.lineTo(4, 1.5);
    icon.fill(color);

    // Simple Rear Fins
    icon.moveTo(-2, -1.5);
    icon.lineTo(-7, -4.5);
    icon.lineTo(-7, -1.5);
    icon.fill(color);

    icon.moveTo(-2, 1.5);
    icon.lineTo(-7, 4.5);
    icon.lineTo(-7, 1.5);
    icon.fill(color);
  } else if (slot.turretType === TurretType.Laser) {
    // Clean Laser Aperture + Focal Beam
    icon.circle(-3, 0, 4.5);
    icon.stroke({ color: color, width: 2 });
    
    icon.circle(-3, 0, 1.5);
    icon.fill(color);

    icon.moveTo(1.5, 0);
    icon.lineTo(8, 0);
    icon.stroke({ color: color, width: 2.5 });
  } else if (slot.turretType === TurretType.Railgun) {
    icon.moveTo(-7, -3);
    icon.lineTo(7, -3);
    icon.stroke({ color: color, width: 2 });

    icon.moveTo(-7, 3);
    icon.lineTo(7, 3);
    icon.stroke({ color: color, width: 2 });

    icon.rect(2, -2, 4, 4);
    icon.fill(color);
  } else {
    icon.circle(0, 0, 3);
    icon.fill(color);
  }

  container.addChild(icon);

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

  if (visuals.containers[index]) {
    visuals.containers[index]!.destroy({ children: true });
    visuals.containers[index] = null;
  }
  if (visuals.emptySlotGfx[index]) {
    visuals.emptySlotGfx[index]!.destroy();
    visuals.emptySlotGfx[index] = null;
  }

  if (slot.filled) {
    const tc = createTurretContainer(slot);
    parent.addChild(tc);
    visuals.containers[index] = tc;
  } else {
    const eg = createEmptySlotDot(slot);
    parent.addChild(eg);
    visuals.emptySlotGfx[index] = eg;
  }
}
