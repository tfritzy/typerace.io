import {
  BoxRenderable,
  OptimizedBuffer,
  RenderContext,
  RGBA,
} from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import { THEME } from "../theme";
import { decodeCharacterHistory, getWpmByBucket } from "../util/wpmCalculator";

const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

const dots = {
  "44": "⣿",
  "43": "⣷",
  "42": "⣧",
  "41": "⣇",
  "40": "⡇",
  "34": "⣾",
  "24": "⣼",
  "14": "⣸",
  "04": "⢸",
};

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
      const firstBar = bars[x - this.x * 2];
      const secondBar = bars[x - this.x * 2 + 1];
      for (let y = this.y; y < this.y + height; y++) {
        const h = y - this.y;
        if (firstBar > h * 4 && secondBar > h * 4) {
          buffer.setCell(
            x,
            y,
            "⣿",
            RGBA.fromHex(THEME.bg0_s),
            RGBA.fromHex(THEME.bg0_h),
          );
        }
      }
    }
  }
}
