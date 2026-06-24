import { BoxRenderable, TextRenderable, type CliRenderer } from "@opentui/core";
import { mountTypeBox } from "./typebox";
import { DbConnection } from "../module_bindings";

export function mountMainMenu(renderer: CliRenderer, conn: DbConnection): void {
  const screen = new BoxRenderable(renderer, {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  });

  const typeBox = mountTypeBox(renderer, "Hello world", () => {
    console.log("search for game", conn.isActive);
    conn.reducers.joinGame({
      gameMode: { tag: "English500" },
      joinCode: crypto.randomUUID(),
      gameType: { tag: "Public" },
    });
  });

  conn.db.playerprogress.onInsert((_, pp) => {
    console.log(`New player progress`, pp);
  });

  conn
    .subscriptionBuilder()
    .onApplied(() => console.log("applied"))
    .onError((err) => console.error("sub error", err))
    .subscribe([
      `SELECT * FROM playerprogress where PlayerId='${conn.identity}'`,
    ]);

  screen.add(typeBox);
  renderer.root.add(screen);
}
