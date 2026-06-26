import { BoxRenderable, CliRenderer } from "@opentui/core";
import { TypeBox } from "../typebox";
import { Game, PlayerProgress } from "../stdb";
import { PlayerProgressView } from "./playerProgress";

export class GameView {
  private renderer: CliRenderer;
  private screen: BoxRenderable;
  private typeBox: TypeBox;
  private playerProgresses: PlayerProgressView[] = [];

  constructor(renderer: CliRenderer) {
    this.renderer = renderer;

    this.screen = new BoxRenderable(renderer, {
      width: "100%",
      height: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    for (let i = 0; i < 3; i++) {
      const pp = new PlayerProgressView(renderer, this.screen);
      this.playerProgresses.push(pp);
    }

    this.typeBox = new TypeBox(renderer, this.screen, "", () => {});

    renderer.root.add(this.screen);
  }

  public updateGame(game: Game) {
    this.typeBox.setPhrase(game.phrase);
  }

  public updatePlayerProgress(pp: PlayerProgress) {
    const view = this.playerProgresses.find(
      (p) => p.data?.playerId === pp.playerId,
    );
    view?.updateProgress(pp);
  }

  public addPlayerProgress(pp: PlayerProgress) {
    const slot = this.playerProgresses.find((p) => !p.data);
    slot?.updateProgress(pp);
  }
}
