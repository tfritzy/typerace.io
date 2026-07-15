import {
  BoxRenderable,
  OptimizedBuffer,
  RenderContext,
  RGBA,
} from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import { THEME } from "../theme";
import { getWpmByBucket } from "../util/wpmCalculator";

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

export class WpmChart extends BoxRenderable {
  private gameStartTime: bigint = BigInt(0);
  private playerProgress: PlayerProgress | undefined;

  constructor(ctx: RenderContext) {
    super(ctx, {
      width: "100%",
      height: 10,
      minHeight: 10,
      flexShrink: 0,
      flexGrow: 0,
      backgroundColor: THEME.fg0,
    });
  }

  public updateGame(game: Game) {
    this.gameStartTime = game.racingStartedAt;
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
      this.playerProgress.characterHistory,
      this.gameStartTime,
      width * 2,
    );

    const maxWpm = Math.floor(Math.max(...wpmByBucket) * 1.2);
    console.log(wpmByBucket);
    for (let y = this.y; y < this.y + height; y++) {
      for (let x = this.x; x < this.x + width; x++) {
        const wpm = wpmByBucket[Math.round(x * 2)];

        console.log(wpm, maxWpm, y, this.y + height);

        buffer.setCell(
          x,
          y,
          wpm / maxWpm > y / height ? "⣿" : "n",
          RGBA.fromHex(THEME.accent),
          RGBA.fromHex(THEME.bg0_h),
        );
      }
    }
  }
}
