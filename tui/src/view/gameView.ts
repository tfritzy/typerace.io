import { BoxRenderable, CliRenderer } from "@opentui/core";
import { TypeBox } from "../typebox";
import { Game } from "../stdb";

export class GameView {
  private renderer: CliRenderer;
  private screen: BoxRenderable;
  private typeBox: TypeBox;

  constructor(renderer: CliRenderer) {
    this.renderer = renderer;

    this.screen = new BoxRenderable(renderer, {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    this.typeBox = new TypeBox(renderer, "", () => {});
    this.screen.add(this.typeBox);
    renderer.root.add(this.screen);
  }

  public updateGame(game: Game) {
    this.typeBox.setPhrase(game.phrase);
  }
}
