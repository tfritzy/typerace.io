import { BoxRenderable, type CliRenderer } from "@opentui/core";
import { DbConnection } from "../module_bindings";
import { TypeBox } from "./typebox";
import { PlayerProgress } from "./stdb";

export class MainMenu {
  private screen: BoxRenderable;
  private cleanup: () => void;

  constructor(
    renderer: CliRenderer,
    conn: DbConnection,
    navigateToGame: (gameId: string) => void,
  ) {
    this.screen = new BoxRenderable(renderer, {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    const typeBox = new TypeBox(renderer, this.screen, "Hell", () => {
      conn.reducers.joinGame({
        gameMode: { tag: "English500" },
        joinCode: crypto.randomUUID(),
        gameType: { tag: "Public" },
      });
    });

    const handleNavigate = (_: any, pp: PlayerProgress) => {
      navigateToGame(pp.gameId);
    };
    conn.db.playerprogress.onInsert(handleNavigate);

    const subscription = conn
      .subscriptionBuilder()
      .onApplied(() => console.log("applied"))
      .onError((err) => console.error("sub error", err))
      .subscribe([
        `SELECT * FROM playerprogress where PlayerId='${conn.identity}'`,
      ]);

    this.cleanup = () => {
      subscription.unsubscribe();
      conn.db.playerprogress.removeOnInsert(handleNavigate);
      typeBox.unMount();
      this.screen.destroyRecursively();
    };

    renderer.root.add(this.screen);
  }

  public unMount() {
    this.cleanup();
  }
}
