import { BoxRenderable, CliRenderer, TextRenderable } from "@opentui/core";
import { ResultBox } from "./resultBox";

export class ResultsView {
  private screen: BoxRenderable;
  public cleanup = () => {};

  constructor(
    renderer: CliRenderer,
    navMainMenu: () => void,
    navGame: (game: string) => void,
  ) {
    this.screen = new BoxRenderable(renderer, {
      width: "90%",
      maxWidth: 128,
      height: "100%",
      marginX: "auto",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    const actionBar = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginX: "auto",
    });

    new ResultBox(
      renderer,
      actionBar,
      new TextRenderable(renderer, { content: "Main menu (m)", fg: "#bdae93" }),
    );

    new ResultBox(
      renderer,
      actionBar,
      new TextRenderable(renderer, { content: "Replay (r)", fg: "#bdae93" }),
    );

    new ResultBox(
      renderer,
      actionBar,
      new TextRenderable(renderer, { content: "New match (n)", fg: "#bdae93" }),
    );

    this.screen.add(actionBar);

    renderer.root.add(this.screen);

    const keyListener = (key: { name: string }) => {
      if (!this.screen.visible) {
        return;
      }

      if (key.name === "m") {
        navMainMenu();
      }

      if (key.name === "n") {
        navGame("todo");
      }
    };
    renderer.keyInput.on("keypress", keyListener);

    this.cleanup = () => {
      renderer.keyInput.removeListener("keypress", keyListener);
      this.screen.destroyRecursively();
    };
  }

  public setVisible(visible: boolean) {
    this.screen.visible = visible;
  }
}
