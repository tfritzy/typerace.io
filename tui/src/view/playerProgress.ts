import { BoxRenderable, CliRenderer, TextRenderable } from "@opentui/core";
import { TypeBox } from "../typebox";
import { Game, PlayerProgress } from "../stdb";

export class PlayerProgressView {
  public data: PlayerProgress | undefined;

  private cleanup: () => void;
  private playerName: TextRenderable;
  private wpm: TextRenderable;
  private progress: BoxRenderable;
  private phraseLength: number;

  constructor(
    renderer: CliRenderer,
    parent: BoxRenderable,
    phraseLength: number,
  ) {
    this.phraseLength = phraseLength;

    const div = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    });

    const playerDetails = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    });

    this.playerName = new TextRenderable(renderer, {
      fg: "#bdae93",
      content: "Waiting...",
    });
    this.wpm = new TextRenderable(renderer, {
      fg: "#bdae93",
    });

    playerDetails.add(this.playerName);
    playerDetails.add(this.wpm);

    const progressBar = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#282828",
    });

    this.progress = new BoxRenderable(renderer, {
      width: "0%",
      flexDirection: "row",
      alignItems: "center",
      //   backgroundColor: "#d79921",
      visible: false,
      customBorderChars: {
        topT: "▬",
        topLeft: "▬",
        topRight: "▬",
        bottomLeft: "▬",
        bottomRight: "▬",
        horizontal: "▬",
        vertical: "▬",
        bottomT: "▬",
        leftT: "▬",
        rightT: "▬",
        cross: "▬",
      },
      border: ["top"],
      borderColor: "#d79921",
    });

    progressBar.add(this.progress);

    div.add(playerDetails);
    div.add(progressBar);
    parent.add(div);

    this.cleanup = () => {
      div.destroyRecursively();
    };
  }

  public updateProgress(pp: PlayerProgress) {
    this.playerName.content = pp.playerName;
    this.wpm.content = `${pp.wpm.toFixed(0)} wpm`;
    this.progress.width = `${(pp.progressIndex / this.phraseLength) * 100}%`;
    this.progress.visible = pp.progressIndex > 0;
    this.data = pp;
  }

  public setPhraseLength(phraseLength: number) {
    if (this.phraseLength != phraseLength) {
      this.phraseLength = phraseLength;
      if (this.data) {
        this.updateProgress(this.data);
      }
    }
  }

  public unMount() {
    this.cleanup();
  }
}
