import { BoxRenderable, TextRenderable, type CliRenderer } from "@opentui/core";
import { mountTypeBox } from "./typebox";
import { Database } from "./database";

export function mountMainMenu(renderer: CliRenderer, database: Database): void {
  const screen = new BoxRenderable(renderer, {
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  });

  const typeBox = mountTypeBox(renderer, "Hello world", () => {
    console.log("search for game", database.connection?.isActive);
    database.connection?.reducers.joinGame({
      gameMode: { tag: "English500" },
      joinCode: "asdf",
      gameType: { tag: "Public" },
    });
  });

  screen.add(typeBox);
  renderer.root.add(screen);
}
