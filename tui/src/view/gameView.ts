import { CliRenderer } from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import { RacingView } from "./racingView";
import { ResultsView } from "./resultsView";
import { Identity } from "spacetimedb";
import { Countdown } from "./countdown";

export class GameView {
  private racingView: RacingView;
  private resultsView: ResultsView;
  private ownIdentity: Identity;
  private countdown: Countdown;

  constructor(
    renderer: CliRenderer,
    ownIdentity: Identity,
    incrementProgress: (progress: number) => void,
    navMainMenu: () => void,
    requestNewGame: () => void,
  ) {
    this.racingView = new RacingView(renderer, incrementProgress);
    this.resultsView = new ResultsView(renderer, navMainMenu, requestNewGame);
    this.countdown = new Countdown(renderer);
    this.ownIdentity = ownIdentity;
    this.resultsView.setVisible(false);
  }

  public updateGame(game: Game, prevGame: Game | undefined) {
    this.racingView.updateGame(game);

    if (game.placements.some((pl) => this.ownIdentity.equals(pl))) {
      this.racingView.setVisible(false);
      this.resultsView.setVisible(true);
    }

    if (prevGame?.state.tag != "Countdown" && game.state.tag === "Countdown") {
      this.countdown.start(Number(game.countdownDurationMs));
    }

    this.resultsView.updateGame(game);
  }

  public updatePlayerProgress(pp: PlayerProgress) {
    this.racingView.updatePlayerProgress(pp);

    if (pp.playerId.isEqual(this.ownIdentity)) {
      this.resultsView.updateOwnPlayerProgress(pp);
    }
  }

  public addPlayerProgress(pp: PlayerProgress) {
    this.racingView.addPlayerProgress(pp);
  }

  public cleanup() {
    this.racingView.cleanup();
    this.resultsView.cleanup();
  }
}
