import {
  BoxRenderable,
  OptimizedBuffer,
  RenderContext,
  RGBA,
} from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import { THEME } from "../theme";
import { decodeCharacterHistory, getWpmByBucket } from "../util/wpmCalculator";

const dots = {
  "00": "⠀",

  "01": "⢀",
  "02": "⢠",
  "03": "⢰",
  "04": "⢸",

  "10": "⡀",
  "11": "⣀",
  "12": "⣠",
  "13": "⣰",
  "14": "⣸",

  "20": "⡄",
  "21": "⣄",
  "22": "⣤",
  "23": "⣴",
  "24": "⣼",

  "30": "⡆",
  "31": "⣆",
  "32": "⣦",
  "33": "⣶",
  "34": "⣾",

  "40": "⡇",
  "41": "⣇",
  "42": "⣧",
  "43": "⣷",
  "44": "⣿",
} as const;

export class WpmChartInterior extends BoxRenderable {
  private raceStartTime_s: number = 0;
  private playerProgress: PlayerProgress | undefined;

  constructor(ctx: RenderContext) {
    super(ctx, {
      width: "100%",
      height: "100%",
    });
  }

  public updateGame(game: Game) {
    this.raceStartTime_s = Number(game.racingStartedAt / 1_000_000n);
  }

  public updatePlayerProgress(playerProgress: PlayerProgress) {
    this.playerProgress = playerProgress;
  }

  protected renderSelf(buffer: OptimizedBuffer) {
    if (!this.playerProgress) return;

    super.renderSelf(buffer);

    const layoutNode = this.getLayoutNode();
    const width = layoutNode.getComputedWidth();
    const height = layoutNode.getComputedHeight();
    const wpmByBucket = getWpmByBucket(
      decodeCharacterHistory(
        this.playerProgress.characterHistory,
        this.raceStartTime_s,
      ),
      this.raceStartTime_s,
      width * 2,
    );
    const maxWpm = Math.floor(Math.max(...wpmByBucket) * 1.2);

    const bars = new Array<number>(width * 2);
    for (let x = 0; x < width * 2; x++) {
      bars[x] = Math.floor((wpmByBucket[x] / maxWpm) * height * 4);
    }

    console.log(bars);

    for (let x = this.x; x < this.x + width; x++) {
      const firstBar = bars[(x - this.x) * 2];
      const secondBar = bars[(x - this.x) * 2 + 1];
      for (let y = this.y; y < this.y + height; y++) {
        const h = height - 1 - (y - this.y);
        const firstGap = Math.max(Math.min(firstBar - h * 4, 4), 0);
        const secondGap = Math.max(Math.min(secondBar - h * 4, 4), 0);
        const key = firstGap.toString() + secondGap.toString();
        buffer.setCell(
          x,
          y,
          dots[key as keyof typeof dots] || " ",
          RGBA.fromHex(THEME.accent),
          RGBA.fromHex(THEME.bg0_h),
        );
      }
    }
  }
}
