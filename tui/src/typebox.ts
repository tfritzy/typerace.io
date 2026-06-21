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
  fg: RGBA.fromHex("#3c3836"),
  __isChunk: true,
  text: "",
};
const currentWord = {
  fg: "#fbf1c7",
  __isChunk: true,
  text: "",
};
const incorrect = {
  fg: "#fb4934",
  attributes: TextAttributes.UNDERLINE,
  __isChunk: true,
  text: "",
};
const cursor = {
  fg: "#000000",
  bg: "#fabd2f",
  __isChunk: true,
  text: "",
};
const incomplete = {
  fg: "#bdae93",
  __isChunk: true,
  text: "",
};

export function mountTypeBox(
  renderer: CliRenderer,
  phrase: string,
  onComplete: () => void,
): void {
  const phraseBox = new BoxRenderable(renderer, {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  });

  const text = new TextRenderable(renderer, {});

  let chunks: TextChunk[] = [];
  const updateTexts = (
    wordStart: number,
    progress: number,
    errorCount: number,
  ) => {
    text.clear();

    chunks.length = 0;
    for (let i = 0; i < phrase.length; i++) {
      if (i < wordStart) {
        chunks.push({ ...complete, text: phrase[i] });
      }

      if (phrase[i] === typed[i]) {
        chunks.push({ text: phrase[i], ...complete, __isChunk: true });
      }
    }
  };

  phraseBox.add(text);
  renderer.root.add(phraseBox);

  let typed = "";
  renderer.keyInput.on("keypress", (key) => {
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

    let wordEnd = correctUpTo;
    for (let i = wordEnd; i < phrase.length; i++) {
      wordEnd = i;
      if (phrase[i] === " ") break;
    }

    if (key.name === "w" && key.ctrl) {
      typed = "";
    } else if (key.name === "backspace") {
      typed = typed.substring(0, typed.length - 1);
    } else {
      if (errorCount > 0) {
        errorCount += 1;
      } else {
        console.log("expected", phrase[progress], "actual", key.raw);
        if (phrase[progress] === key.raw) {
          progress += 1;
        } else {
          errorCount = 1;
        }
      }
    }

    progress = Math.max(0, progress);
    progress = Math.max(progress, wordStart > 0 ? wordStart + 1 : 0);

    updateTexts(wordStart, progress, errorCount);
  });
}
