import { type CliRenderer } from "@opentui/core";
import { DbConnection, SubscriptionHandle } from "../module_bindings";
import { GameView } from "./view/gameView";

export class GamePage {
  private subscription: SubscriptionHandle;
  private gameView: GameView;

  constructor(renderer: CliRenderer, conn: DbConnection, gameId: string) {
    this.subscription = conn
      .subscriptionBuilder()
      .onApplied(() => console.log("applied"))
      .onError((err) => console.error("sub error", err))
      .subscribe([
        `SELECT * FROM playerprogress where GameId='${gameId}'`,
        `SELECT * FROM game where Id='${gameId}'`,
      ]);

    conn.db.game.onInsert((_, game) => {
      if (game.id === gameId) this.gameView.updateGame(game);
    });
    conn.db.game.onUpdate((_ctx, _oldGame, game) => {
      if (game.id === gameId) this.gameView.updateGame(game);
    });

    conn.db.playerprogress.onInsert((_, playerProgress) => {
      if (playerProgress.gameId === gameId) {
        this.gameView.addPlayerProgress(playerProgress);
      }
    });
    conn.db.playerprogress.onUpdate((_ctx, _old, playerProgress) => {
      if (playerProgress.gameId === gameId) {
        this.gameView.updatePlayerProgress(playerProgress);
      }
    });

    this.gameView = new GameView(renderer);
    renderer.root.add(this.gameView);
  }

  public unMount() {
    this.subscription.unsubscribe();
  }
}
