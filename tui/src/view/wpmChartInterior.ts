import {
  BoxRenderable,
  OptimizedBuffer,
  RenderContext,
  RGBA,
} from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import { THEME } from "../theme";
import { decodeCharacterHistory, getWpmByBucket } from "../util/wpmCalculator";
import { braille } from "../util/braille";

function mapGap(gap: number) {
  switch (gap) {
    case 5:
      return 0;
    case 4:
      return 0;
    case 3:
      return 4;
    case 2:
      return 2;
    case 1:
      return 1;
    default:
      return 0;
  }
}

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
      bars[x] = Math.round((wpmByBucket[x] / maxWpm) * height * 4);
    }

    console.log(bars);

    for (let x = this.x; x < this.x + width; x++) {
      const firstBar = bars[(x - this.x) * 2];
      const secondBar = bars[(x - this.x) * 2 + 1];
      for (let y = this.y; y < this.y + height; y++) {
        const h = height - 1 - (y - this.y);
        const firstBin = mapGap(firstBar - h * 4);
        const secondBin = mapGap(secondBar - h * 4);

        const index = (firstBin << 4) | secondBin;

        buffer.setCell(
          x,
          y,
          braille[index],
          RGBA.fromHex(THEME.accent),
          RGBA.fromHex(THEME.bg0_h),
        );
      }
    }
  }
}
