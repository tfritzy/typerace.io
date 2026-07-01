import { CliRenderer } from "@opentui/core";
import { Game, PlayerProgress } from "../stdb";
import { RacingView } from "./racingView";
import { ResultsView } from "./resultsView";
import { Identity } from "spacetimedb";

export class GameView {
  private racingView: RacingView;
  private resultsView: ResultsView;
  private ownIdentity: Identity;

  constructor(
    renderer: CliRenderer,
    ownIdentity: Identity,
    incrementProgress: (progress: number) => void,
    navMainMenu: () => void,
    requestNewGame: () => void,
  ) {
    this.racingView = new RacingView(renderer, incrementProgress);
    this.resultsView = new ResultsView(renderer, navMainMenu, requestNewGame);
    this.ownIdentity = ownIdentity;
    this.resultsView.setVisible(false);
  }

  public updateGame(game: Game) {
    this.racingView.updateGame(game);
    game.placements;
    if (game.placements.some((pl) => this.ownIdentity.equals(pl))) {
      this.racingView.setVisible(false);
      this.resultsView.setVisible(true);
    }
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
