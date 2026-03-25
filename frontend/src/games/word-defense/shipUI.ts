import { Container, Graphics, Text } from "pixi.js";
import type { TurretConfig, SupplyShip, TurretSlot } from "./types";
import { TurretType } from "./types";
import { CANVAS_WIDTH, CANVAS_HEIGHT, UPGRADE_SCALING } from "./constants";
import { rarityColor, rarityLabel } from "./turretPool";

const SHIP_WIDTH = 60;
const SHIP_HEIGHT = 30;
const SHIP_SPEED = 120;
const SHIP_ARM_LENGTH = 25;

export function createShipGraphics(): Container {
  const container = new Container();

  const body = new Graphics();
  body.roundRect(-SHIP_WIDTH / 2, -SHIP_HEIGHT / 2, SHIP_WIDTH, SHIP_HEIGHT, 6);
  body.fill({ color: 0x64748b, alpha: 0.8 });
  body.stroke({ color: 0x94a3b8, width: 2 });
  container.addChild(body);

  const cockpit = new Graphics();
  cockpit.roundRect(-10, -SHIP_HEIGHT / 2 - 6, 20, 10, 3);
  cockpit.fill({ color: 0x60a5fa, alpha: 0.6 });
  cockpit.stroke({ color: 0x93c5fd, width: 1 });
  container.addChild(cockpit);

  const arms = new Graphics();
  const armSpacing = SHIP_WIDTH / 3;
  for (let i = -1; i <= 1; i++) {
    const ax = i * armSpacing * 0.4;
    arms.moveTo(ax, SHIP_HEIGHT / 2);
    arms.lineTo(ax + i * 6, SHIP_HEIGHT / 2 + SHIP_ARM_LENGTH);
    arms.stroke({ color: 0x94a3b8, width: 2 });
    arms.circle(ax + i * 6, SHIP_HEIGHT / 2 + SHIP_ARM_LENGTH, 3);
    arms.fill({ color: 0xf59e0b, alpha: 0.7 });
  }
  container.addChild(arms);

  const label = new Text({
    text: "SUPPLY",
    style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 8, fill: 0xffffff },
  });
  label.anchor.set(0.5);
  label.position.set(0, 0);
  label.alpha = 0.6;
  container.addChild(label);

  return container;
}

export function updateShipPosition(ship: SupplyShip, dt: number): boolean {
  switch (ship.phase) {
    case "approaching": {
      ship.y += SHIP_SPEED * dt;
      if (ship.y >= ship.targetY) {
        ship.y = ship.targetY;
        ship.phase = "hovering";
      }
      return false;
    }
    case "hovering":
      return false;
    case "departing": {
      ship.y -= SHIP_SPEED * 1.5 * dt;
      if (ship.y < -80) {
        ship.phase = "gone";
        return true;
      }
      return false;
    }
    case "gone":
      return true;
  }
}

function drawTurretIcon(g: Graphics, type: TurretType, color: number, size: number) {
  const s = size / 15;
  g.rotation = 0;

  if (type === TurretType.Missile) {
    g.rect(-6 * s, -1.5 * s, 10 * s, 3 * s);
    g.fill(color);
    g.moveTo(4 * s, -1.5 * s);
    g.lineTo(8 * s, 0);
    g.lineTo(4 * s, 1.5 * s);
    g.fill(color);
    g.moveTo(-2 * s, -1.5 * s);
    g.lineTo(-7 * s, -4.5 * s);
    g.lineTo(-7 * s, -1.5 * s);
    g.fill(color);
    g.moveTo(-2 * s, 1.5 * s);
    g.lineTo(-7 * s, 4.5 * s);
    g.lineTo(-7 * s, 1.5 * s);
    g.fill(color);
  } else if (type === TurretType.Laser) {
    g.circle(0, 0, 4.5 * s);
    g.stroke({ color, width: 2 * s });
    g.circle(0, 0, 1.5 * s);
    g.fill(color);
    g.moveTo(4.5 * s, 0);
    g.lineTo(8 * s, 0);
    g.stroke({ color, width: 2.5 * s });
  } else if (type === TurretType.Railgun) {
    g.moveTo(-7 * s, -3 * s);
    g.lineTo(7 * s, -3 * s);
    g.stroke({ color, width: 2 * s });
    g.moveTo(-7 * s, 3 * s);
    g.lineTo(7 * s, 3 * s);
    g.stroke({ color, width: 2 * s });
    g.rect(2 * s, -2 * s, 4 * s, 4 * s);
    g.fill(color);
  } else if (type === TurretType.NuclearMissile) {
    g.circle(0, 0, 5 * s);
    g.fill({ color, alpha: 0.4 });
    g.circle(0, 0, 5 * s);
    g.stroke({ color, width: 2 * s });
    g.circle(0, 0, 2 * s);
    g.fill(color);
  } else {
    g.circle(0, 0, 3 * s);
    g.fill(color);
  }
}

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;
const CARD_GAP = 30;

export function createCardUI(
  offerings: TurretConfig[],
  existingSlots: TurretSlot[],
  onSelect: (config: TurretConfig) => void,
  onClose: () => void,
): Container {
  const overlay = new Container();

  const bg = new Graphics();
  bg.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  bg.fill({ color: 0x000000, alpha: 0.6 });
  bg.eventMode = "static";
  overlay.addChild(bg);

  const totalWidth = offerings.length * CARD_WIDTH + (offerings.length - 1) * CARD_GAP;
  const startX = (CANVAS_WIDTH - totalWidth) / 2;
  const cardY = (CANVAS_HEIGHT - CARD_HEIGHT) / 2 - 20;

  const title = new Text({
    text: "Choose a Turret",
    style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 28, fill: 0xffffff },
  });
  title.anchor.set(0.5, 1);
  title.position.set(CANVAS_WIDTH / 2, cardY - 20);
  overlay.addChild(title);

  for (let i = 0; i < offerings.length; i++) {
    const config = offerings[i];
    const cx = startX + i * (CARD_WIDTH + CARD_GAP) + CARD_WIDTH / 2;
    const card = createCard(config, cx, cardY, existingSlots, () => onSelect(config));
    overlay.addChild(card);
  }

  const skipBtn = new Container();
  skipBtn.position.set(CANVAS_WIDTH / 2, cardY + CARD_HEIGHT + 40);
  skipBtn.eventMode = "static";
  skipBtn.cursor = "pointer";
  skipBtn.on("pointertap", onClose);
  const skipBg = new Graphics();
  skipBg.roundRect(-60, -16, 120, 32, 6);
  skipBg.fill({ color: 0x374151, alpha: 0.8 });
  skipBg.stroke({ color: 0x6b7280, width: 1 });
  skipBtn.addChild(skipBg);
  const skipText = new Text({
    text: "Skip",
    style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 14, fill: 0x9ca3af },
  });
  skipText.anchor.set(0.5);
  skipBtn.addChild(skipText);
  overlay.addChild(skipBtn);

  return overlay;
}

function createCard(
  config: TurretConfig,
  cx: number,
  y: number,
  existingSlots: TurretSlot[],
  onSelect: () => void,
): Container {
  const card = new Container();
  card.position.set(cx, y);
  card.eventMode = "static";
  card.cursor = "pointer";
  card.on("pointertap", onSelect);

  const rColor = rarityColor(config.rarity);
  const cardLeft = -CARD_WIDTH / 2;

  const border = new Graphics();
  border.roundRect(cardLeft, 0, CARD_WIDTH, CARD_HEIGHT, 10);
  border.fill({ color: 0x1e293b, alpha: 0.95 });
  border.stroke({ color: rColor, width: 2 });
  card.addChild(border);

  const topSection = new Graphics();
  topSection.roundRect(cardLeft + 2, 2, CARD_WIDTH - 4, 110, 8);
  topSection.fill({ color: 0x0f172a, alpha: 0.6 });
  card.addChild(topSection);

  const iconGfx = new Graphics();
  iconGfx.position.set(0, 50);
  drawTurretIcon(iconGfx, config.type, config.color, 30);
  card.addChild(iconGfx);

  const hexBg = new Graphics();
  const hexRadius = 28;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
    const hx = Math.cos(angle) * hexRadius;
    const hy = Math.sin(angle) * hexRadius + 50;
    if (i === 0) hexBg.moveTo(hx, hy);
    else hexBg.lineTo(hx, hy);
  }
  hexBg.closePath();
  hexBg.fill({ color: config.color, alpha: 0.1 });
  hexBg.stroke({ color: config.color, alpha: 0.4, width: 1.5 });
  card.addChild(hexBg);
  card.addChild(iconGfx);

  const nameText = new Text({
    text: config.name,
    style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 16, fill: 0xffffff },
  });
  nameText.anchor.set(0.5, 0);
  nameText.position.set(0, 118);
  card.addChild(nameText);

  const rLabel = new Text({
    text: rarityLabel(config.rarity),
    style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 11, fill: rColor },
  });
  rLabel.anchor.set(0.5, 0);
  rLabel.position.set(0, 138);
  card.addChild(rLabel);

  const statsY = 162;
  const statEntries: [string, string][] = [
    ["Damage", `${config.damage}`],
    ["Fire Rate", config.fireRate],
    ["Special", config.special],
  ];

  for (let si = 0; si < statEntries.length; si++) {
    const [label, value] = statEntries[si];
    const sy = statsY + si * 22;

    const sep = new Graphics();
    sep.moveTo(cardLeft + 12, sy - 3);
    sep.lineTo(cardLeft + CARD_WIDTH - 12, sy - 3);
    sep.stroke({ color: 0xffffff, alpha: 0.08, width: 1 });
    card.addChild(sep);

    const statLabel = new Text({
      text: label,
      style: { fontFamily: "monospace", fontSize: 11, fill: 0x9ca3af },
    });
    statLabel.position.set(cardLeft + 14, sy);
    card.addChild(statLabel);

    const statValue = new Text({
      text: value,
      style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 11, fill: 0xffffff },
    });
    statValue.anchor.set(1, 0);
    statValue.position.set(cardLeft + CARD_WIDTH - 14, sy);
    card.addChild(statValue);
  }

  const matchingSlots = existingSlots.filter(s => s.filled && !s.destroyed && s.turretType === config.type);
  if (matchingSlots.length > 0) {
    const bestLevel = Math.max(...matchingSlots.map(s => s.level));
    const upgradeHint = new Text({
      text: `Can upgrade (Lv.${bestLevel} → ${bestLevel + 1})`,
      style: { fontFamily: "monospace", fontSize: 10, fill: 0x4ade80 },
    });
    upgradeHint.anchor.set(0.5, 0);
    upgradeHint.position.set(0, CARD_HEIGHT - 34);
    card.addChild(upgradeHint);
  }

  const hoverBorder = new Graphics();
  hoverBorder.roundRect(cardLeft, 0, CARD_WIDTH, CARD_HEIGHT, 10);
  hoverBorder.stroke({ color: 0xffffff, alpha: 0, width: 3 });
  card.addChild(hoverBorder);

  card.on("pointerover", () => {
    hoverBorder.clear();
    hoverBorder.roundRect(cardLeft, 0, CARD_WIDTH, CARD_HEIGHT, 10);
    hoverBorder.stroke({ color: 0xffffff, alpha: 0.3, width: 3 });
    card.scale.set(1.03);
  });
  card.on("pointerout", () => {
    hoverBorder.clear();
    hoverBorder.roundRect(cardLeft, 0, CARD_WIDTH, CARD_HEIGHT, 10);
    hoverBorder.stroke({ color: 0xffffff, alpha: 0, width: 3 });
    card.scale.set(1.0);
  });

  return card;
}

export function createPlacementUI(
  config: TurretConfig,
  slots: TurretSlot[],
): Container {
  const container = new Container();

  const banner = new Container();
  banner.position.set(CANVAS_WIDTH / 2, 30);
  container.addChild(banner);

  const bannerBg = new Graphics();
  bannerBg.roundRect(-220, -18, 440, 36, 8);
  bannerBg.fill({ color: 0x1e293b, alpha: 0.9 });
  bannerBg.stroke({ color: config.color, width: 2 });
  banner.addChild(bannerBg);

  const hasUpgradeable = slots.some(
    s => s.filled && !s.destroyed && s.turretType === config.type
  );

  let instructionStr = `Click an empty slot to place ${config.name}`;
  if (hasUpgradeable) {
    instructionStr = `Click empty slot to place, or same turret to upgrade`;
  }

  const text = new Text({
    text: instructionStr,
    style: { fontFamily: "monospace", fontWeight: "bold", fontSize: 13, fill: 0xffffff },
  });
  text.anchor.set(0.5);
  banner.addChild(text);

  const cancelBtn = new Container();
  cancelBtn.position.set(CANVAS_WIDTH / 2, 70);
  cancelBtn.eventMode = "static";
  cancelBtn.cursor = "pointer";
  container.addChild(cancelBtn);

  const cancelBg = new Graphics();
  cancelBg.roundRect(-40, -12, 80, 24, 5);
  cancelBg.fill({ color: 0x374151, alpha: 0.8 });
  cancelBtn.addChild(cancelBg);

  const cancelText = new Text({
    text: "Cancel",
    style: { fontFamily: "monospace", fontSize: 12, fill: 0x9ca3af },
  });
  cancelText.anchor.set(0.5);
  cancelBtn.addChild(cancelText);

  return container;
}

export function getScaledDamage(baseDamage: number, level: number): number {
  return Math.round(baseDamage * Math.pow(UPGRADE_SCALING, level - 1));
}
