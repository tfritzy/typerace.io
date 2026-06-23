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

export function mountTypeBox(
  renderer: CliRenderer,
  phrase: string,
  onComplete: () => void,
): void {
  const phraseBox = new BoxRenderable(renderer, {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  });

  let typed = "";
  let isComplete = false;

  const text = new TextRenderable(renderer, {});
  phraseBox.add(text);
  renderer.root.add(phraseBox);

  updateText(text, phrase, typed);

  renderer.keyInput.on("keypress", (key) => {
    const { wordStart, correctUpTo } = computeWordStart(phrase, typed);

    if (key.name === "w" && key.ctrl) {
      typed = "";
    } else if (key.name === "backspace") {
      typed = typed.substring(0, typed.length - 1);
    } else {
      typed += key.raw;
    }

    if (typed.length <= wordStart && wordStart != 0) {
      typed = phrase.substring(0, wordStart + 1);
    }

    console.log(correctUpTo, phrase.length);
    if (correctUpTo >= phrase.length - 1 && !isComplete) {
      isComplete = true;
      onComplete();
    }

    updateText(text, phrase, typed);
  });
}
