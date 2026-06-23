import { CliRenderer } from "@opentui/core";
import { Database } from "./database";
import { mountMainMenu } from "./mainMenu";

export function mountApp(renderer: CliRenderer) {
  renderer.setBackgroundColor("#1d2021");
  const database = new Database();
  const mainMenu = mountMainMenu(renderer, database);
  renderer.root.add(mainMenu);
  database.connect();
}
