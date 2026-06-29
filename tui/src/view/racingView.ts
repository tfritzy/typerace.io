import { BoxRenderable, CliRenderer } from "@opentui/core";
import { TypeBox } from "../typebox";
import { Game, PlayerProgress } from "../stdb";
import { PlayerProgressView } from "./playerProgress";

export class RacingView {
  private screen: BoxRenderable;
  private typeBox: TypeBox;
  private playerProgresses: PlayerProgressView[] = [];
  public cleanup = () => {};

  constructor(
    renderer: CliRenderer,
    incrementProgress: (progress: number) => void,
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

    const ppBox = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      flexGrow: 1,
      paddingX: 0,
    });

    for (let i = 0; i < 3; i++) {
      const pp = new PlayerProgressView(renderer, ppBox, 0);
      this.playerProgresses.push(pp);
    }

    this.screen.add(ppBox);

    const typeBoxBox = new BoxRenderable(renderer, {
      paddingX: 1,
      width: "100%",
      flexGrow: 9,
      border: true,
      borderColor: "#282828",
    });
    this.screen.add(typeBoxBox);
    this.typeBox = new TypeBox(
      renderer,
      typeBoxBox,
      "",
      incrementProgress,
      () => {},
    );

    renderer.root.add(this.screen);

    this.cleanup = () => {
      this.typeBox.unMount();
      this.screen.destroyRecursively();
    };
  }

  public updateGame(game: Game) {
    this.typeBox.setPhrase(game.phrase);
    this.playerProgresses.forEach((p) => p.setPhraseLength(game.phrase.length));
  }

  public updatePlayerProgress(pp: PlayerProgress) {
    const view = this.playerProgresses.find((p) =>
      p.data?.playerId.isEqual(pp.playerId),
    );
    view?.updateProgress(pp);
  }

  public addPlayerProgress(pp: PlayerProgress) {
    if (
      this.playerProgresses.find((p) => p.data?.playerId.equals(pp.playerId))
    ) {
      this.updatePlayerProgress(pp);
    } else {
      const slot = this.playerProgresses.find((p) => !p.data);
      slot?.updateProgress(pp);
    }
  }

  public setVisible(visible: boolean) {
    this.screen.visible = visible;
  }
}
