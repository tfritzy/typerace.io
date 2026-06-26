import { BoxRenderable, CliRenderer, TextRenderable } from "@opentui/core";
import { TypeBox } from "../typebox";
import { Game, PlayerProgress } from "../stdb";

export class PlayerProgressView {
  public data: PlayerProgress | undefined;

  private cleanup: () => void;
  private playerName: TextRenderable;
  private wpm: TextRenderable;
  private progress: TextRenderable;

  constructor(renderer: CliRenderer, parent: BoxRenderable) {
    const div = new BoxRenderable(renderer, {
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    const playerDetails = new BoxRenderable(renderer, {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    });

    this.playerName = new TextRenderable(renderer, { content: "hello?" });
    this.wpm = new TextRenderable(renderer, { content: "hello?" });

    playerDetails.add(this.playerName);
    playerDetails.add(this.wpm);

    const playerProgress = new BoxRenderable(renderer, {
      flexDirection: "row",
      alignItems: "center",
    });

    this.progress = new TextRenderable(renderer, { content: "hello?" });

    playerProgress.add(this.progress);

    div.add(playerProgress);
    div.add(playerDetails);
    parent.add(div);

    this.cleanup = () => {
      div.destroyRecursively();
    };
  }

  public updateProgress(pp: PlayerProgress) {
    this.playerName.content = pp.playerName;
    this.wpm.content = pp.wpm.toString();
    this.progress.content = pp.progressIndex.toString();
    this.data = pp;
  }

  public unMount() {
    this.cleanup();
  }
}
