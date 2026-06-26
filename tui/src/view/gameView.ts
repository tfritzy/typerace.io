import { BoxRenderable, CliRenderer } from "@opentui/core";
import { TypeBox } from "../typebox";
import { Game, PlayerProgress } from "../stdb";
import { PlayerProgressView } from "./playerProgress";

export class GameView {
  private screen: BoxRenderable;
  private typeBox: TypeBox;
  private playerProgresses: PlayerProgressView[] = [];

  constructor(renderer: CliRenderer) {
    this.screen = new BoxRenderable(renderer, {
      width: "50%",
      height: "100%",
      marginX: "auto",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    });

    const ppBox = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      flexGrow: 1,
      gap: 2,
      paddingY: 2,
      paddingX: 0,
    });

    for (let i = 0; i < 3; i++) {
      const pp = new PlayerProgressView(renderer, ppBox, 0);
      this.playerProgresses.push(pp);
    }

    this.screen.add(ppBox);

    const typeBoxBox = new BoxRenderable(renderer, {
      paddingY: 1,
      paddingX: 0,
      flexGrow: 2,
    });
    this.screen.add(typeBoxBox);
    this.typeBox = new TypeBox(renderer, typeBoxBox, "", () => {});

    renderer.root.add(this.screen);
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
}
