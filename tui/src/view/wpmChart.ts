import {
  BoxRenderable,
  OptimizedBuffer,
  RenderContext,
  RGBA,
} from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import { getAggWpmBySecond } from "../util/wpmCalculator";
import { THEME } from "../theme";

export class WpmChart extends BoxRenderable {
  private gameStartTime: bigint = BigInt(0);
  private playerProgress: PlayerProgress | undefined;

  constructor(ctx: RenderContext) {
    super(ctx, { width: "100%", height: 20 });
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
    const aggWpmBySecond = getAggWpmBySecond(
      this.playerProgress.characterHistory,
      this.gameStartTime,
    );

    const maxWpm = Math.floor(Math.max(...aggWpmBySecond) * 1.2);

    for (let y = this.y; y < height; y++) {
      for (let x = this.x; x < width; x++) {
        buffer.setCell(
          x,
          y,
          "h",
          RGBA.fromHex(THEME.accent),
          RGBA.fromHex(THEME.bg0_h),
        );
      }
    }
  }
}
