import {
  BoxRenderable,
  OptimizedBuffer,
  RenderContext,
  RGBA,
  TextRenderable,
} from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import { THEME } from "../theme";
import {
  decodeCharacterHistory,
  getWpmByBucket,
  getWpmPerKeystroke,
} from "../util/wpmCalculator";
import { WpmChartInterior } from "./wpmChartInterior";

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
  private raceStartTime_s: number = 0;
  private playerProgress: PlayerProgress | undefined;
  private highWpm: TextRenderable;
  private midWpm: TextRenderable;
  private interior: WpmChartInterior;

  constructor(ctx: RenderContext) {
    super(ctx, {
      width: "100%",
      height: 10,
      minHeight: 10,
    });

    const chart = new BoxRenderable(ctx, {
      flexDirection: "row",
      width: "100%",
      height: "100%",
    });
    const yLegend = new BoxRenderable(ctx, {
      width: 3,
      height: "100%",
      justifyContent: "space-between",
      paddingBottom: 1,
    });
    this.highWpm = new TextRenderable(ctx, { content: "100", fg: THEME.fg0 });
    this.midWpm = new TextRenderable(ctx, { content: "50", fg: THEME.fg0 });
    yLegend.add(this.highWpm);
    yLegend.add(this.midWpm);
    yLegend.add(new TextRenderable(ctx, { content: "0", fg: THEME.fg0 }));
    chart.add(yLegend);
    const interiorContainer = new BoxRenderable(ctx, {
      border: ["left", "bottom"],
      borderColor: THEME.bg0,
      width: "100%",
    });
    this.interior = new WpmChartInterior(ctx);
    interiorContainer.add(this.interior);
    chart.add(interiorContainer);
    this.add(chart);
  }

  public updateGame(game: Game) {
    this.raceStartTime_s = Number(game.racingStartedAt / 1_000_000n);
    this.interior.updateGame(game);
  }

  public updatePlayerProgress(playerProgress: PlayerProgress) {
    this.playerProgress = playerProgress;
    this.interior.updatePlayerProgress(playerProgress);
    const wpmPerKeystroke = getWpmPerKeystroke(
      decodeCharacterHistory(
        playerProgress.characterHistory,
        this.raceStartTime_s,
      ),
      this.raceStartTime_s,
    );
    const maxWpm = Math.ceil(
      Math.max(...wpmPerKeystroke.map((w) => w[1])) * 1.2,
    );

    this.highWpm.content = maxWpm.toFixed(0);
    this.midWpm.content = (Math.floor(maxWpm) / 2).toFixed(0);
  }
}
