import {
  BoxRenderable,
  RGBA,
  StyledText,
  TextAttributes,
  TextChunk,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core";
import { THEME } from "./theme";

const complete: TextChunk = {
  fg: RGBA.fromHex(THEME.bg0),
  __isChunk: true,
  text: "",
};
const currentWord: TextChunk = {
  fg: RGBA.fromHex(THEME.fg0),
  __isChunk: true,
  text: "",
};
const incorrect: TextChunk = {
  fg: RGBA.fromHex(THEME.red),
  attributes: TextAttributes.UNDERLINE,
  __isChunk: true,
  text: "",
};
const cursor: TextChunk = {
  fg: RGBA.fromHex("#000000"),
  bg: RGBA.fromHex(THEME.accent),
  __isChunk: true,
  attributes: TextAttributes.BOLD,
  text: "",
};
const incomplete: TextChunk = {
  fg: RGBA.fromHex("#bdae93"),
  __isChunk: true,
  text: "",
};

function computeWordStart(phrase: string, typed: string) {
  let correctUpTo = 0;
  for (let i = 0; i < phrase.length; i++) {
    if (phrase[i] === typed[i]) correctUpTo += 1;
    else break;
  }

  let wordStart = correctUpTo;
  for (let i = wordStart - 1; i >= 0; i--) {
    wordStart = i;
    if (phrase[i] === " ") break;
  }

  return { correctUpTo, wordStart };
}

let chunks: TextChunk[] = [];
function updateText(
  text: TextRenderable,
  phrase: string,
  typed: string,
  cursors: number[],
) {
  const { wordStart } = computeWordStart(phrase, typed);

  chunks.length = 0;
  for (let i = 0; i < phrase.length; i++) {
    if (i < wordStart) {
      chunks.push({ ...complete, text: phrase[i] });
    } else if (i === typed.length) {
      chunks.push({ ...cursor, text: phrase[i] });
    } else if (i < typed.length) {
      if (typed[i] === phrase[i]) {
        chunks.push({ ...currentWord, text: phrase[i] });
      } else {
        chunks.push({ ...incorrect, text: phrase[i] });
      }
    } else {
      chunks.push({ ...incomplete, text: phrase[i] });
    }

    if (cursors.includes(i)) {
      chunks[i].attributes = TextAttributes.UNDERLINE;
    }
  }

  text.content = new StyledText(chunks);
}

export class TypeBox {
  private text: TextRenderable;
  private phrase: string;
  private typed: string;
  private isComplete: boolean;
  private cursors: number[] = [];
  private cleanup: () => void;

  constructor(
    renderer: CliRenderer,
    parent: BoxRenderable,
    phrase: string,
    onProgress: (
      progress: number,
      eventType: "backspace" | "correct" | "incorrect",
    ) => void,
    onComplete: () => void,
  ) {
    this.phrase = phrase;
    const phraseBox = new BoxRenderable(renderer, {
      flexDirection: "row",
      padding: 0,
    });

    this.typed = "";
    this.isComplete = false;

    this.text = new TextRenderable(renderer, {});
    phraseBox.add(this.text);
    parent.add(phraseBox);

    this.rerender();

    renderer.keyInput.on("keypress", (key) => {
      let { wordStart, correctUpTo } = computeWordStart(
        this.phrase,
        this.typed,
      );

      if (key.name === "w" && key.ctrl) {
        this.typed = "";
        onProgress(wordStart + 1, "backspace");
      } else if (key.name === "backspace") {
        this.typed = this.typed.substring(0, this.typed.length - 1);
        onProgress(correctUpTo, "backspace");
      } else {
        this.typed += key.raw[0];
        const newCorrectUpTo = computeWordStart(
          this.phrase,
          this.typed,
        ).correctUpTo;

        const eventType =
          newCorrectUpTo > correctUpTo ? "correct" : "incorrect";
        correctUpTo = newCorrectUpTo;
        onProgress(correctUpTo, eventType);
      }

      if (this.typed.length <= wordStart && wordStart != 0) {
        this.typed = this.phrase.substring(0, wordStart + 1);
      }

      if (correctUpTo >= this.phrase.length && !this.isComplete) {
        this.isComplete = true;
        onComplete();
      }

      this.rerender();
    });

    this.cleanup = () => {
      phraseBox.destroyRecursively();
    };
  }

  public rerender() {
    updateText(this.text, this.phrase, this.typed, this.cursors);
  }

  public setPhrase(phrase: string) {
    if (phrase != this.phrase) {
      this.phrase = phrase;
      this.typed = "";
      this.isComplete = false;
      this.rerender();
    }
  }

  public setCursors(cursors: number[]) {
    this.cursors = cursors;
    this.rerender();
  }

  public reset() {
    this.typed = "";
    this.isComplete = false;
    this.rerender();
  }

  public unMount() {
    this.cleanup();
  }
}
