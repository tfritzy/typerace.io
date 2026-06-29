import { type CliRenderer } from "@opentui/core";
import { DbConnection, SubscriptionHandle } from "../module_bindings";
import { GameView } from "./view/gameView";
import { Game, PlayerProgress } from "./stdb";

export class GamePage {
  public cleanup: () => void;
  private gameView: GameView;

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
        `SELECT * FROM game where Id='${gameId}'`,
      ]);

    const onGameInsert = (_: any, game: Game) => {
      if (game.id === gameId) this.gameView.updateGame(game);
    };
    conn.db.game.onInsert(onGameInsert);

    const onGameUpdate = (_: any, _old: Game, game: Game) => {
      if (game.id === gameId) this.gameView.updateGame(game);
    };
    conn.db.game.onUpdate(onGameUpdate);

    const onPpInsert = (_: any, playerProgress: PlayerProgress) => {
      if (playerProgress.gameId === gameId) {
        this.gameView.addPlayerProgress(playerProgress);
      }
    };
    conn.db.playerprogress.onInsert(onPpInsert);

    const onPpUpdate = (_: any, _old: any, playerProgress: PlayerProgress) => {
      if (playerProgress.gameId === gameId) {
        this.gameView.updatePlayerProgress(playerProgress);
      }
    };
    conn.db.playerprogress.onUpdate(onPpUpdate);

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
      navGame,
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
