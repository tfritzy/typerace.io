import { Container, Graphics, Sprite, Text } from "pixi.js";
import { NineSlicePanel } from "./NineSlicePanel";
import { PIXEL_FONT_FAMILY } from "./constants";
import type { AssetManager } from "./assetManager";
import type { Item, ItemType } from "./itemConfig";
import { getItemDisplay } from "./itemConfig";
import { RelicType, RELIC_CONFIGS } from "./relicConfig";
import type { RelicTypeConfig } from "./relicConfig";

const PANEL_WIDTH = 440;
const PANEL_PADDING = 28;
const ICON_SIZE = 128;
const PANEL_SCALE = 4;
const TITLE_FONT_SIZE = 18;
const STAT_FONT_SIZE = 12;
const DESC_FONT_SIZE = 11;
const LINE_HEIGHT = 22;
const SECTION_GAP = 14;
const ICON_GAP = 8;

const TITLE_COLOR = 0xffd866;
const DAMAGE_COLOR = 0xff4444;
const EFFECT_COLOR = 0xccccdd;
const SEPARATOR_COLOR = 0x5a5a8e;
const PIERCE_COLOR = 0x66ddff;
const CHAIN_COLOR = 0x66ddff;
const EXPLOSION_COLOR = 0xff9944;
const BLEED_COLOR = 0xff6666;
const PLASMA_COLOR = 0xcc66ff;
const SLOW_COLOR = 0x66aaff;
const FREEZE_COLOR = 0x88eeff;
const CHARGE_COLOR = 0xffcc44;
const BUFF_COLOR = 0x44ff88;

interface EffectLine {
  text: string;
  color: number;
  drawIcon: (g: Graphics) => void;
}

function isRelicType(type: ItemType): type is RelicType {
  return typeof type === "number" && type in RelicType;
}

function drawSwordIcon(g: Graphics): void {
  g.moveTo(3, 11);
  g.lineTo(9, 5);
  g.stroke({ color: 0xcccccc, width: 2 });
  g.moveTo(9, 5);
  g.lineTo(11, 3);
  g.stroke({ color: 0xffffff, width: 2 });
  g.rect(5, 8, 4, 2);
  g.fill(0x888888);
}

function drawKeyboardIcon(g: Graphics): void {
  g.roundRect(1, 3, 12, 8, 1);
  g.stroke({ color: 0xaabbcc, width: 1 });
  g.rect(3, 5, 2, 2);
  g.fill(0xaabbcc);
  g.rect(6, 5, 2, 2);
  g.fill(0xaabbcc);
  g.rect(9, 5, 2, 2);
  g.fill(0xaabbcc);
  g.rect(4, 8, 6, 1);
  g.fill(0xaabbcc);
}

function drawPierceIcon(g: Graphics): void {
  g.moveTo(2, 7);
  g.lineTo(12, 7);
  g.stroke({ color: PIERCE_COLOR, width: 2 });
  g.moveTo(9, 4);
  g.lineTo(12, 7);
  g.lineTo(9, 10);
  g.stroke({ color: PIERCE_COLOR, width: 2 });
}

function drawChainIcon(g: Graphics): void {
  g.circle(4, 7, 3);
  g.stroke({ color: CHAIN_COLOR, width: 1.5 });
  g.circle(10, 7, 3);
  g.stroke({ color: CHAIN_COLOR, width: 1.5 });
}

function drawExplosionIcon(g: Graphics): void {
  g.star(7, 7, 6, 5, 2.5);
  g.fill(EXPLOSION_COLOR);
}

function drawBleedIcon(g: Graphics): void {
  g.moveTo(7, 2);
  g.bezierCurveTo(7, 2, 12, 7, 7, 12);
  g.bezierCurveTo(2, 7, 7, 2, 7, 2);
  g.fill(BLEED_COLOR);
}

function drawPlasmaIcon(g: Graphics): void {
  g.moveTo(7, 2);
  g.lineTo(5, 6);
  g.lineTo(8, 6);
  g.lineTo(6, 12);
  g.lineTo(9, 7);
  g.lineTo(6, 7);
  g.lineTo(7, 2);
  g.fill(PLASMA_COLOR);
}

function drawSlowIcon(g: Graphics): void {
  g.circle(7, 7, 5);
  g.stroke({ color: SLOW_COLOR, width: 1.5 });
  g.moveTo(7, 4);
  g.lineTo(7, 7);
  g.lineTo(10, 7);
  g.stroke({ color: SLOW_COLOR, width: 1.5 });
}

function drawFreezeIcon(g: Graphics): void {
  g.moveTo(7, 2);
  g.lineTo(7, 12);
  g.stroke({ color: FREEZE_COLOR, width: 1.5 });
  g.moveTo(3, 4);
  g.lineTo(11, 10);
  g.stroke({ color: FREEZE_COLOR, width: 1.5 });
  g.moveTo(3, 10);
  g.lineTo(11, 4);
  g.stroke({ color: FREEZE_COLOR, width: 1.5 });
}

function drawChargeIcon(g: Graphics): void {
  g.moveTo(7, 2);
  g.lineTo(4, 7);
  g.lineTo(6, 7);
  g.lineTo(4, 12);
  g.lineTo(10, 6);
  g.lineTo(8, 6);
  g.lineTo(10, 2);
  g.lineTo(7, 2);
  g.fill(CHARGE_COLOR);
}

function drawBuffIcon(g: Graphics): void {
  g.moveTo(7, 2);
  g.lineTo(2, 12);
  g.lineTo(12, 12);
  g.closePath();
  g.stroke({ color: BUFF_COLOR, width: 1.5 });
  g.moveTo(7, 5);
  g.lineTo(7, 9);
  g.stroke({ color: BUFF_COLOR, width: 1.5 });
  g.circle(7, 10.5, 0.8);
  g.fill(BUFF_COLOR);
}

function buildEffectLines(config: RelicTypeConfig): EffectLine[] {
  const lines: EffectLine[] = [];

  if (config.multiShotCount > 1) {
    lines.push({
      text: "Pierces through enemies",
      color: PIERCE_COLOR,
      drawIcon: drawPierceIcon,
    });
  }

  if (config.chainCount > 0) {
    lines.push({
      text: `Chains to ${config.chainCount} nearby ${config.chainCount === 1 ? "enemy" : "enemies"}`,
      color: CHAIN_COLOR,
      drawIcon: drawChainIcon,
    });
  }

  if (config.explosionRange > 0) {
    const radiusKm = (config.explosionRange / 100).toFixed(1);
    lines.push({
      text: `Explosion radius: ${radiusKm} km`,
      color: EXPLOSION_COLOR,
      drawIcon: drawExplosionIcon,
    });
  }

  if (config.bleedApplicationChance > 0) {
    lines.push({
      text: `${Math.round(config.bleedApplicationChance * 100)}% chance to apply bleed`,
      color: BLEED_COLOR,
      drawIcon: drawBleedIcon,
    });
  }

  if (config.plasmaStacks > 0) {
    lines.push({
      text: `Applies ${config.plasmaStacks} ${config.plasmaStacks === 1 ? "stack" : "stacks"} of plasma`,
      color: PLASMA_COLOR,
      drawIcon: drawPlasmaIcon,
    });
  }

  if (config.slowStacks > 0) {
    lines.push({
      text: `Applies ${config.slowStacks} ${config.slowStacks === 1 ? "stack" : "stacks"} of slow`,
      color: SLOW_COLOR,
      drawIcon: drawSlowIcon,
    });
  }

  if (config.freezeStacks > 0) {
    lines.push({
      text: `Applies ${config.freezeStacks} ${config.freezeStacks === 1 ? "stack" : "stacks"} of freeze`,
      color: FREEZE_COLOR,
      drawIcon: drawFreezeIcon,
    });
  }

  if (config.chargesNeighbors) {
    lines.push({
      text: "Charges neighboring weapon slots",
      color: CHARGE_COLOR,
      drawIcon: drawChargeIcon,
    });
  }

  if (config.damageBuffAll) {
    lines.push({
      text: `Boosts all weapons by ${Math.round(config.damageBuffMultiplier * 100)}%`,
      color: BUFF_COLOR,
      drawIcon: drawBuffIcon,
    });
  } else if (config.damageBuffMultiplier > 0) {
    lines.push({
      text: `Boosts adjacent weapons by ${Math.round(config.damageBuffMultiplier * 100)}%`,
      color: BUFF_COLOR,
      drawIcon: drawBuffIcon,
    });
  }

  return lines;
}

export class ItemTooltip {
  readonly container: Container;
  private panel: NineSlicePanel | null = null;
  private content: Container;
  private assets: AssetManager;

  constructor(assets: AssetManager) {
    this.assets = assets;
    this.container = new Container();
    this.container.visible = false;
    this.container.eventMode = "none";
    this.content = new Container();
  }

  show(item: Item, globalX: number, globalY: number, canvasWidth?: number, canvasHeight?: number): void {
    this.clear();

    const displayName = getItemDisplay(item.type);
    const config = isRelicType(item.type) ? RELIC_CONFIGS[item.type] : null;
    const effects = config ? buildEffectLines(config) : [];
    const contentWidth = PANEL_WIDTH - PANEL_PADDING * 2;

    let cursorY = PANEL_PADDING;

    const title = new Text({
      text: displayName,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: TITLE_FONT_SIZE,
        fill: TITLE_COLOR,
        wordWrap: true,
        wordWrapWidth: contentWidth,
        align: "center",
      },
    });
    title.anchor.set(0.5, 0);
    title.x = PANEL_WIDTH / 2;
    title.y = cursorY;
    this.content.addChild(title);
    cursorY += title.height + SECTION_GAP;

    this.drawSeparator(cursorY);
    cursorY += SECTION_GAP;

    const texture = this.assets.getItemTexture(displayName);
    if (texture) {
      texture.source.scaleMode = "nearest";
      const icon = new Sprite(texture);
      icon.width = ICON_SIZE;
      icon.height = ICON_SIZE;
      icon.anchor.set(0.5, 0);
      icon.x = PANEL_WIDTH / 2;
      icon.y = cursorY;
      this.content.addChild(icon);
      cursorY += ICON_SIZE + SECTION_GAP;
    }

    this.drawSeparator(cursorY);
    cursorY += SECTION_GAP;

    if (config) {
      const damageIcon = new Graphics();
      drawSwordIcon(damageIcon);
      damageIcon.scale.set(2.5);
      damageIcon.x = PANEL_PADDING;
      damageIcon.y = cursorY;
      this.content.addChild(damageIcon);

      const damageLabel = new Text({
        text: "DAMAGE",
        style: {
          fontFamily: PIXEL_FONT_FAMILY,
          fontSize: STAT_FONT_SIZE,
          fill: EFFECT_COLOR,
        },
      });
      damageLabel.x = PANEL_PADDING + 38;
      damageLabel.y = cursorY + 4;
      this.content.addChild(damageLabel);

      const damageValue = new Text({
        text: `${config.damage}`,
        style: {
          fontFamily: PIXEL_FONT_FAMILY,
          fontSize: STAT_FONT_SIZE,
          fill: DAMAGE_COLOR,
        },
      });
      damageValue.anchor.set(1, 0);
      damageValue.x = PANEL_WIDTH - PANEL_PADDING;
      damageValue.y = cursorY + 4;
      this.content.addChild(damageValue);
      cursorY += LINE_HEIGHT + 4;

      const charsIcon = new Graphics();
      drawKeyboardIcon(charsIcon);
      charsIcon.scale.set(2.5);
      charsIcon.x = PANEL_PADDING;
      charsIcon.y = cursorY;
      this.content.addChild(charsIcon);

      const charsLabel = new Text({
        text: "CHARS TO FIRE",
        style: {
          fontFamily: PIXEL_FONT_FAMILY,
          fontSize: STAT_FONT_SIZE,
          fill: EFFECT_COLOR,
        },
      });
      charsLabel.x = PANEL_PADDING + 38;
      charsLabel.y = cursorY + 4;
      this.content.addChild(charsLabel);

      const charsValue = new Text({
        text: `${config.charsToFire}`,
        style: {
          fontFamily: PIXEL_FONT_FAMILY,
          fontSize: STAT_FONT_SIZE,
          fill: 0xffffff,
        },
      });
      charsValue.anchor.set(1, 0);
      charsValue.x = PANEL_WIDTH - PANEL_PADDING;
      charsValue.y = cursorY + 4;
      this.content.addChild(charsValue);
      cursorY += LINE_HEIGHT + 4;
    }

    if (effects.length > 0) {
      cursorY += 2;
      this.drawSeparator(cursorY);
      cursorY += SECTION_GAP;

      for (const effect of effects) {
        const iconGraphics = new Graphics();
        effect.drawIcon(iconGraphics);
        iconGraphics.scale.set(2.5);
        iconGraphics.x = PANEL_PADDING;
        iconGraphics.y = cursorY;
        this.content.addChild(iconGraphics);

        const effectText = new Text({
          text: effect.text,
          style: {
            fontFamily: PIXEL_FONT_FAMILY,
            fontSize: DESC_FONT_SIZE,
            fill: effect.color,
            wordWrap: true,
            wordWrapWidth: contentWidth - ICON_GAP - 38,
          },
        });
        effectText.x = PANEL_PADDING + 38;
        effectText.y = cursorY + 4;
        this.content.addChild(effectText);
        cursorY += Math.max(LINE_HEIGHT, effectText.height + 4) + 2;
      }
    }

    cursorY += PANEL_PADDING;

    const panelHeight = cursorY;

    this.panel = new NineSlicePanel({
      texture: this.assets.uiPanel9Slice,
      width: PANEL_WIDTH,
      height: panelHeight,
      scale: PANEL_SCALE,
    });
    this.container.addChild(this.panel.container);
    this.container.addChild(this.content);

    let posX = globalX + 16;
    let posY = globalY - panelHeight / 2;

    if (canvasWidth && posX + PANEL_WIDTH > canvasWidth) {
      posX = globalX - PANEL_WIDTH - 16;
    }
    if (canvasHeight) {
      if (posY + panelHeight > canvasHeight) {
        posY = canvasHeight - panelHeight;
      }
      if (posY < 0) posY = 0;
    }

    this.container.x = posX;
    this.container.y = posY;
    this.container.visible = true;
  }

  hide(): void {
    this.container.visible = false;
    this.clear();
  }

  private drawSeparator(y: number): void {
    const line = new Graphics();
    const x1 = PANEL_PADDING + 12;
    const x2 = PANEL_WIDTH - PANEL_PADDING - 12;
    const lineWidth = x2 - x1;

    line.moveTo(0, 0);
    line.lineTo(lineWidth, 0);
    line.stroke({ color: SEPARATOR_COLOR, width: 2, alpha: 0.6 });

    line.circle(lineWidth / 2, 0, 3);
    line.fill({ color: SEPARATOR_COLOR, alpha: 0.8 });

    line.x = x1;
    line.y = y;
    this.content.addChild(line);
  }

  private clear(): void {
    if (this.panel) {
      this.panel.destroy();
      this.panel = null;
    }
    this.content.removeChildren();
    this.container.removeChildren();
    this.container.addChild(this.content);
  }

  destroy(): void {
    this.clear();
    this.container.destroy();
  }
}
