import { CliRenderer } from "@opentui/core";
import { MainMenu } from "./mainMenu";
import { DbConnection } from "../module_bindings";
import { GamePage } from "./game";

export function mountApp(renderer: CliRenderer) {
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

  let mainMenu: MainMenu;
  connect.then((conn) => {
    mainMenu = new MainMenu(renderer, conn, (gameId) => {
      mainMenu.unMount();

      renderer.root.add(new GamePage(renderer, conn, gameId));
    });
    renderer.root.add(mainMenu);
  });
}
