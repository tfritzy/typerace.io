import { type CliRenderer } from "@opentui/core";
import { DbConnection, SubscriptionHandle } from "../module_bindings";
import { GameView } from "./view/gameView";
import { Game, PlayerProgress } from "./stdb";

export class GamePage {
  public cleanup: () => void;
  private gameView: GameView;
  private game: Game | undefined;

  constructor(
    renderer: CliRenderer,
    conn: DbConnection,
    gameId: string,
    navMainMenu: () => void,
    navGame: (game: string) => void,
  ) {
    const subscription = conn
      .subscriptionBuilder()
      .onApplied(() => console.log("applied"))
      .onError((err) => console.error("sub error", err))
      .subscribe([
        `SELECT * FROM playerprogress where GameId='${gameId}'`,
        `SELECT * FROM playerprogress where JoinCode='${gameId}'`,
        `SELECT * FROM game where Id='${gameId}'`,
      ]);

    const onGameInsert = (_: any, game: Game) => {
      if (game.id === gameId) {
        this.gameView.updateGame(game);
        this.game = game;
      }
    };
    conn.db.game.onInsert(onGameInsert);

    const onGameUpdate = (_: any, _old: Game, game: Game) => {
      if (game.id === gameId) {
        this.gameView.updateGame(game);
        this.game = game;
      }
    };
    conn.db.game.onUpdate(onGameUpdate);

    const onPpInsert = (_: any, playerProgress: PlayerProgress) => {
      if (playerProgress.gameId === gameId) {
        this.gameView.addPlayerProgress(playerProgress);
      }

      if (
        playerProgress.joinCode === gameId &&
        gameId != playerProgress.gameId
      ) {
        navGame(playerProgress.gameId);
      }
    };
    conn.db.playerprogress.onInsert(onPpInsert);

    const onPpUpdate = (_: any, _old: any, playerProgress: PlayerProgress) => {
      if (playerProgress.gameId === gameId) {
        this.gameView.updatePlayerProgress(playerProgress);
      }
    };
    conn.db.playerprogress.onUpdate(onPpUpdate);

    const requestNewGame = () => {
      conn.reducers.joinGame({
        gameMode: this.game?.gameMode || { tag: "English500" },
        gameType: this.game?.gameType || { tag: "Public" },
        joinCode: gameId,
      });
    };
    this.gameView = new GameView(
      renderer,
      conn.identity!,
      (progress) => {
        conn.reducers.updateProgress({
          gameId: gameId,
          newIndex: progress,
          eventType: { tag: "Correct" },
        });
      },
      navMainMenu,
      requestNewGame,
    );

    this.cleanup = () => {
      subscription.unsubscribe();
      conn.db.game.removeOnInsert(onGameInsert);
      conn.db.game.removeOnUpdate(onGameUpdate);
      conn.db.playerprogress.removeOnInsert(onPpInsert);
      conn.db.playerprogress.removeOnUpdate(onPpUpdate);
      this.gameView.cleanup();
    };
  }
}
