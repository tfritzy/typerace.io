import { Container, Graphics, Sprite, Text } from "pixi.js";
import { NineSlicePanel } from "./NineSlicePanel";
import { PIXEL_FONT_FAMILY } from "./constants";
import type { AssetManager } from "./assetManager";
import type { Item, ItemType } from "./itemConfig";
import { getItemDisplay } from "./itemConfig";
import { RelicType, RELIC_CONFIGS, RELIC_DEFAULTS } from "./relicConfig";
import type { RelicTypeConfig } from "./relicConfig";

const TOOLTIP_PADDING = 24;
const ICON_SIZE = 56;
const LINE_HEIGHT = 16;
const TITLE_FONT_SIZE = 10;
const STAT_FONT_SIZE = 8;
const PANEL_SCALE = 4;
const TITLE_COLOR = 0xffd700;
const STAT_LABEL_COLOR = 0xaaaacc;
const STAT_VALUE_COLOR = 0xffffff;
const SPECIAL_COLOR = 0x66ddff;
const SEPARATOR_COLOR = 0x4a4a7e;
const MIN_PANEL_WIDTH = 260;

interface StatLine {
  label: string;
  value: string;
  color: number;
}

function isRelicType(type: ItemType): type is RelicType {
  return typeof type === "number" && type in RelicType;
}

function buildRelicStats(config: RelicTypeConfig): StatLine[] {
  const lines: StatLine[] = [];

  if (config.damage > 0) {
    lines.push({ label: "Damage", value: `${config.damage}`, color: STAT_VALUE_COLOR });
  }

  lines.push({ label: "Chars to Fire", value: `${config.charsToFire}`, color: STAT_VALUE_COLOR });

  if (config.projectileSpeed !== RELIC_DEFAULTS.projectileSpeed) {
    lines.push({ label: "Proj. Speed", value: `${config.projectileSpeed}`, color: STAT_VALUE_COLOR });
  }

  if (config.multiShotCount > 1) {
    lines.push({ label: "Multi-shot", value: `x${config.multiShotCount}`, color: SPECIAL_COLOR });
  }

  if (config.chainCount > 0) {
    lines.push({ label: "Chain", value: `${config.chainCount}`, color: SPECIAL_COLOR });
  }

  if (config.explosionRange > 0) {
    lines.push({ label: "Explosion", value: `${config.explosionRange}px`, color: SPECIAL_COLOR });
  }

  if (config.bleedApplicationChance > 0) {
    lines.push({ label: "Bleed Chance", value: `${Math.round(config.bleedApplicationChance * 100)}%`, color: 0xff6666 });
  }

  if (config.plasmaStacks > 0) {
    lines.push({ label: "Plasma", value: `${config.plasmaStacks}`, color: 0xcc66ff });
  }

  if (config.slowStacks > 0) {
    lines.push({ label: "Slow", value: `${config.slowStacks}`, color: 0x66aaff });
  }

  if (config.freezeStacks > 0) {
    lines.push({ label: "Freeze", value: `${config.freezeStacks}`, color: 0x88eeff });
  }

  if (config.chargesNeighbors) {
    lines.push({ label: "Charges Neighbors", value: "Yes", color: 0xffcc44 });
  }

  if (config.damageBuffAll) {
    lines.push({ label: "Buff All", value: `+${Math.round(config.damageBuffMultiplier * 100)}%`, color: 0x44ff88 });
  } else if (config.damageBuffMultiplier > 0) {
    lines.push({ label: "Buff Adjacent", value: `+${Math.round(config.damageBuffMultiplier * 100)}%`, color: 0x44ff88 });
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
    const stats = isRelicType(item.type) ? buildRelicStats(RELIC_CONFIGS[item.type]) : [];

    const title = new Text({
      text: displayName,
      style: {
        fontFamily: PIXEL_FONT_FAMILY,
        fontSize: TITLE_FONT_SIZE,
        fill: TITLE_COLOR,
        wordWrap: true,
        wordWrapWidth: 180,
      },
    });
    title.x = TOOLTIP_PADDING + ICON_SIZE + 12;
    title.y = TOOLTIP_PADDING + (ICON_SIZE - title.height) / 2;
    this.content.addChild(title);

    const texture = this.assets.getItemTexture(displayName);
    if (texture) {
      texture.source.scaleMode = "nearest";
      const icon = new Sprite(texture);
      icon.width = ICON_SIZE;
      icon.height = ICON_SIZE;
      icon.x = TOOLTIP_PADDING;
      icon.y = TOOLTIP_PADDING;
      this.content.addChild(icon);
    }

    let headerWidth = TOOLTIP_PADDING + ICON_SIZE + 12 + title.width + TOOLTIP_PADDING;
    let maxWidth = Math.max(headerWidth, MIN_PANEL_WIDTH);

    const valueTexts: Text[] = [];
    const headerHeight = ICON_SIZE + TOOLTIP_PADDING;

    let cursorY = TOOLTIP_PADDING + headerHeight;

    if (stats.length > 0) {
      const separatorLine = new Graphics();
      this.content.addChild(separatorLine);

      cursorY += 4;

      for (const stat of stats) {
        const labelText = new Text({
          text: stat.label,
          style: {
            fontFamily: PIXEL_FONT_FAMILY,
            fontSize: STAT_FONT_SIZE,
            fill: STAT_LABEL_COLOR,
          },
        });
        labelText.x = TOOLTIP_PADDING;
        labelText.y = cursorY;
        this.content.addChild(labelText);

        const valueText = new Text({
          text: stat.value,
          style: {
            fontFamily: PIXEL_FONT_FAMILY,
            fontSize: STAT_FONT_SIZE,
            fill: stat.color,
          },
        });
        valueText.y = cursorY;
        this.content.addChild(valueText);
        valueTexts.push(valueText);

        const lineWidth = labelText.width + 24 + valueText.width + TOOLTIP_PADDING * 2;
        if (lineWidth > maxWidth) maxWidth = lineWidth;

        cursorY += LINE_HEIGHT;
      }

      for (const vt of valueTexts) {
        vt.x = maxWidth - TOOLTIP_PADDING - vt.width;
      }

      separatorLine.moveTo(TOOLTIP_PADDING, TOOLTIP_PADDING + headerHeight - 4);
      separatorLine.lineTo(maxWidth - TOOLTIP_PADDING, TOOLTIP_PADDING + headerHeight - 4);
      separatorLine.stroke({ color: SEPARATOR_COLOR, width: 1 });
    }

    const panelWidth = maxWidth;
    const panelHeight = cursorY + TOOLTIP_PADDING;

    this.panel = new NineSlicePanel({
      texture: this.assets.uiPanel9Slice,
      width: panelWidth,
      height: panelHeight,
      scale: PANEL_SCALE,
    });
    this.container.addChild(this.panel.container);
    this.container.addChild(this.content);

    let posX = globalX + 16;
    let posY = globalY - panelHeight / 2;

    if (canvasWidth && posX + panelWidth > canvasWidth) {
      posX = globalX - panelWidth - 16;
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
