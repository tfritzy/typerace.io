import { BoxRenderable, CliRenderer, Renderable } from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import playerprogress_table from "../../module_bindings/playerprogress_table";
import { getAggWpmBySecond } from "../util/wpmCalculator";

export class WpmChart {
  private div: BoxRenderable;
  private renderer: CliRenderer;
  private gameStartTime: bigint = BigInt(0);

  constructor(renderer: CliRenderer, parent: Renderable) {
    this.div = new BoxRenderable(renderer, { width: "100%", height: "100%" });
    parent.add(this.div);

    this.renderer = renderer;
  }

  public updateGame(game: Game) {
    this.gameStartTime = game.racingStartedAt;
  }

  public updatePlayerProgress(playerProgress: PlayerProgress) {
    const width = this.div.getLayoutNode().getComputedWidth();
    const height = this.div.getLayoutNode().getComputedHeight();

    const aggWpmBySecond = getAggWpmBySecond(
      playerProgress.characterHistory,
      this.gameStartTime,
    );

    const maxWpm = Math.floor(Math.max(...aggWpmBySecond) * 1.2);

    const buffer = this.renderer.currentRenderBuffer;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < aggWpmBySecond.length; x++) {}
    }
  }
}
