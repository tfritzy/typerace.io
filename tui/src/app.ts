import { CliRenderer } from "@opentui/core";
import { MainMenu } from "./mainMenu";
import { DbConnection } from "../module_bindings";
import { GamePage } from "./game";
import { Session } from "@opentui/ssh";
import { Countdown } from "./view/countdown";

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
  let gamePage: GamePage | null;

  renderer.keyInput.on("keypress", (key) => {
    if (key.name === "c" && key.ctrl) {
      connection?.disconnect();
      session.end();
    }
  });

  const navigateToMainMenu = () => {
    console.log("nav to main menu");
    mainMenu.setVisible(true);
    gamePage?.cleanup();
    gamePage = null;
  };

  const navigateToGame = (game: string) => {
    console.log("nav to game", game);
    mainMenu.setVisible(false);
    gamePage?.cleanup();
    gamePage = new GamePage(
      renderer,
      connection,
      game,
      navigateToMainMenu,
      navigateToGame,
    );
  };

  connect.then((conn) => {
    connection = conn;

    mainMenu = new MainMenu(renderer, conn, navigateToGame);
  });
}
