import { CliRenderer } from "@opentui/core";
import { MainMenu } from "./mainMenu";
import { DbConnection } from "../module_bindings";
import { GamePage } from "./game";
import { Session } from "@opentui/ssh";

export function mountApp(renderer: CliRenderer, session: Session) {
  renderer.setBackgroundColor("#1d2021");

  let builder = DbConnection.builder()
    .withUri(process.env.VITE_SPACETIMEDB_URI || "ws://localhost:3000")
    .withModuleName(process.env.VITE_SPACETIMEDB_MODULE || "typerace");

  const connect = new Promise<DbConnection>((resolve, reject) => {
    builder
      .onConnect((c) => {
        console.log("Connected to SpacetimeDB");
        resolve(c);
      })
      .onConnectError((e) => {
        console.error("Failed to connect to stdb", e);
        reject();
      })
      .onDisconnect(() => {
        console.warn("Disconnected from SpacetimeDB");
      })
      .build();
  });

  let connection: DbConnection;
  let mainMenu: MainMenu;

  renderer.keyInput.on("keypress", (key) => {
    if (key.name === "c" && key.ctrl) {
      connection?.disconnect();
      session.end();
    }
  });

  connect.then((conn) => {
    connection = conn;

    mainMenu = new MainMenu(renderer, conn, (gameId) => {
      mainMenu.unMount();

      new GamePage(renderer, conn, gameId);
    });
  });
}
