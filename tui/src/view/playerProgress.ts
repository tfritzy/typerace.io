import {
  BoxRenderable,
  CliRenderer,
  RGBA,
  StyledText,
  TextRenderable,
} from "@opentui/core";
import { TypeBox } from "../typebox";
import { Game, PlayerProgress } from "../stdb";
import { THEME } from "../theme";

export class PlayerProgressView {
  public data: PlayerProgress | undefined;

  private cleanup: () => void;
  private playerName: TextRenderable;
  private wpm: TextRenderable;
  private progress: TextRenderable;
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
      paddingX: 1,
      border: true,
      borderColor: THEME.bg0,
    });

    const playerDetails = new BoxRenderable(renderer, {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    });

    this.playerName = new TextRenderable(renderer, {
      fg: "#504945",
      content: "Waiting...",
    });
    this.wpm = new TextRenderable(renderer, {
      fg: "#bdae93",
    });

    playerDetails.add(this.playerName);
    playerDetails.add(this.wpm);

    this.progress = new TextRenderable(renderer, {
      width: "100%",
      height: 1,
      flexDirection: "row",
      alignItems: "center",
    });

    div.add(playerDetails);
    div.add(this.progress);
    parent.add(div);

    this.cleanup = () => {
      div.destroyRecursively();
    };
  }

  public updateProgress(pp: PlayerProgress) {
    this.data = pp;
    this.playerName.content = pp.playerName;
    this.playerName.fg = "#bdae93";
    this.wpm.content = `${pp.wpm.toFixed(0)} wpm`;

    const charWidth = this.progress.getLayoutNode().getComputedWidth();
    const filledChars = (pp.progressIndex / this.phraseLength) * charWidth;
    this.progress.content = new StyledText([
      {
        text: "▄".repeat(filledChars),
        fg: RGBA.fromHex(THEME.accent),
        __isChunk: true,
      },
      {
        text: "▄".repeat(charWidth - filledChars),
        fg: RGBA.fromHex(THEME.bg0),
        __isChunk: true,
      },
    ]);
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
