import {
  BoxRenderable,
  RGBA,
  StyledText,
  TextAttributes,
  TextChunk,
  TextRenderable,
  type CliRenderer,
} from "@opentui/core";

const complete: TextChunk = {
  fg: RGBA.fromHex("#282828"),
  __isChunk: true,
  text: "",
};
const currentWord: TextChunk = {
  fg: RGBA.fromHex("#fbf1c7"),
  __isChunk: true,
  text: "",
};
const incorrect: TextChunk = {
  fg: RGBA.fromHex("#fb4934"),
  attributes: TextAttributes.UNDERLINE,
  __isChunk: true,
  text: "",
};
const cursor: TextChunk = {
  fg: RGBA.fromHex("#000000"),
  bg: RGBA.fromHex("#fabd2f"),
  __isChunk: true,
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
function updateText(text: TextRenderable, phrase: string, typed: string) {
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
  }

  text.content = new StyledText(chunks);
}

export class TypeBox {
  private text: TextRenderable;
  private phrase: string;
  private typed: string;
  private isComplete: boolean;
  private cleanup: () => void;

  constructor(
    renderer: CliRenderer,
    parent: BoxRenderable,
    phrase: string,
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

    updateText(this.text, this.phrase, this.typed);

    renderer.keyInput.on("keypress", (key) => {
      const { wordStart, correctUpTo } = computeWordStart(
        this.phrase,
        this.typed,
      );

      if (key.name === "w" && key.ctrl) {
        this.typed = "";
      } else if (key.name === "backspace") {
        this.typed = this.typed.substring(0, this.typed.length - 1);
      } else {
        this.typed += key.raw;
      }

      if (this.typed.length <= wordStart && wordStart != 0) {
        this.typed = this.phrase.substring(0, wordStart + 1);
      }

      if (correctUpTo >= this.phrase.length - 1 && !this.isComplete) {
        this.isComplete = true;
        onComplete();
      }

      updateText(this.text, this.phrase, this.typed);
    });

    this.cleanup = () => {
      phraseBox.destroyRecursively();
    };
  }

  public setPhrase(phrase: string) {
    if (phrase != this.phrase) {
      this.phrase = phrase;
      this.typed = "";
      this.isComplete = false;
      updateText(this.text, this.phrase, this.typed);
    }
  }

  public unMount() {
    this.cleanup();
  }
}
