import { Container, Text, Graphics } from "pixi.js";
import { CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_FONT_FAMILY } from "./constants";
import type { GameState } from "./state";
import { WavePhase } from "./state";

const FONT_SIZE = 16;
const LINE_HEIGHT = FONT_SIZE * 2.4;
const BOX_PADDING_X = 24;
const BOX_PADDING_Y = 12;
const BOX_WIDTH = CANVAS_WIDTH * 0.8;
const BOX_X = (CANVAS_WIDTH - BOX_WIDTH) / 2;
const BOX_Y = CANVAS_HEIGHT - BOX_PADDING_Y * 2 - LINE_HEIGHT * 2 - 30;
const TYPED_COLOR = 0x90ee90;
const UNTYPED_COLOR = 0xffffff;
const BG_COLOR = 0x0a0a1a;
const BORDER_COLOR = 0x4a5568;

interface LineDisplay {
  typedText: Text;
  untypedText: Text;
}

export class PhraseManager {
  readonly container: Container;

  private bg: Graphics;
  private lineDisplays: LineDisplay[] = [];

  constructor() {
    this.container = new Container();

    this.bg = new Graphics();
    this.drawBackground();
    this.container.addChild(this.bg);

    for (let i = 0; i < 2; i++) {
      const typedText = new Text({
        text: "",
        style: {
          fontFamily: PIXEL_FONT_FAMILY,
          fontSize: FONT_SIZE,
          fill: TYPED_COLOR,
        },
      });
      const untypedText = new Text({
        text: "",
        style: {
          fontFamily: PIXEL_FONT_FAMILY,
          fontSize: FONT_SIZE,
          fill: UNTYPED_COLOR,
        },
      });

      const lineY = BOX_Y + BOX_PADDING_Y + i * LINE_HEIGHT;
      typedText.x = BOX_X + BOX_PADDING_X;
      typedText.y = lineY;
      untypedText.y = lineY;

      this.container.addChild(typedText);
      this.container.addChild(untypedText);

      this.lineDisplays.push({ typedText, untypedText });
    }
  }

  private drawBackground(): void {
    const totalHeight = BOX_PADDING_Y * 2 + LINE_HEIGHT * 2;
    this.bg.clear();
    this.bg.roundRect(BOX_X, BOX_Y, BOX_WIDTH, totalHeight, 0);
    this.bg.fill({ color: BG_COLOR, alpha: 0.9 });
    this.bg.stroke({ color: BORDER_COLOR, width: 2 });
  }

  update(state: GameState): void {
    const waveActive = state.wave.phase !== WavePhase.Idle;
    this.container.visible = waveActive;
    if (!waveActive) return;

    const phrase = state.phrase;

    for (let i = 0; i < this.lineDisplays.length; i++) {
      const display = this.lineDisplays[i];
      const line = phrase.lines[i];

      if (!line) {
        display.typedText.text = "";
        display.untypedText.text = "";
        continue;
      }

      let typedInLine = 0;
      if (i === 0) {
        typedInLine = Math.min(phrase.typedCount, line.text.length);
      }

      display.typedText.text = line.text.slice(0, typedInLine);
      display.untypedText.text = line.text.slice(typedInLine);
      display.untypedText.x = display.typedText.x + display.typedText.width;
    }
  }

  destroy(): void {
    for (const d of this.lineDisplays) {
      d.typedText.destroy();
      d.untypedText.destroy();
    }
    this.bg.destroy();
    this.container.destroy();
  }
}
