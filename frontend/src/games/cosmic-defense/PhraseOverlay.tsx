import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CosmicDefenseGame } from "./game";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";

function getLangCode(): string {
  const slug = window.location.pathname.split("/").pop() ?? "";
  return getLanguageFromSlug(slug)?.htmlLang ?? "en";
}

function generatePhrase(wordCount: number): string {
  const langCode = getLangCode();
  const words: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(getRandomWord(langCode));
  }
  return words.join(" ");
}

const CHAR_COUNT = 22;

export const PhraseOverlay = ({
  gameRef,
  visible,
}: {
  gameRef: React.RefObject<CosmicDefenseGame | null>;
  visible: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [typed, setTyped] = useState<string>("");
  const [phrase, setPhrase] = useState<string>(generatePhrase(3));
  const [checkpoint, setCheckpoint] = useState<number>(0);
  const skipTransition = useRef(false);

  useEffect(() => {
    if (!visible) {
      setPhrase("");
      setTyped("");
      setCheckpoint(0);
      if (inputRef.current?.value) {
        inputRef.current!.value = "";
      }
    }
  }, [visible]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      skipTransition.current = false;
      let completed;
      if (event.target.value.length < checkpoint) {
        completed = typed.substring(0, checkpoint);
      } else {
        completed = event.target.value;

        if (completed[completed.length - 1] === phrase[completed.length - 1]) {
          gameRef.current?.onCorrectKeystroke();
        }
      }

      let uPhrase = phrase;
      let uCheckpoint = checkpoint;
      while (uPhrase.length - completed.length < CHAR_COUNT) {
        uPhrase += " " + getRandomWord(getLangCode());
      }

      while (completed.length > CHAR_COUNT * 2) {
        const spaceI = uPhrase.indexOf(" ") + 1;
        uPhrase = uPhrase.substring(spaceI);
        completed = completed.substring(spaceI);
        uCheckpoint -= spaceI;
        skipTransition.current = true;
      }

      setTyped(completed);
      event.target.value = completed;

      if (phrase != uPhrase) {
        setPhrase(uPhrase);
        setCheckpoint(uCheckpoint);
      }
    },
    [typed, phrase],
  );

  const chars = useMemo(() => {
    const c = [];
    for (let i = 0; i < phrase.length; i++) {
      if (i < typed.length) {
        if (i >= checkpoint) {
          if (phrase[i] === " ") {
            setCheckpoint(i + 1);
          }

          if (phrase[i] === typed[i]) {
            c.push(
              <span key={i} className="text-white">
                {phrase[i]}
              </span>,
            );
          } else {
            c.push(
              <span key={i} className="text-destructive">
                {phrase[i]}
              </span>,
            );
          }
        } else {
          c.push(
            <span key={i} className="text-text-untyped opacity-50">
              {phrase[i]}
            </span>,
          );
        }
      } else {
        c.push(
          <span key={i} className="text-text-untyped">
            {phrase[i]}
          </span>,
        );
      }
    }

    return c;
  }, [phrase, typed, checkpoint]);

  if (!visible) {
    return null;
  }

  const offset = CHAR_COUNT - typed.length;

  return (
    <div className="w-full h-full relative">
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div
          className="text-2xl font-mono whitespace-pre relative"
          style={{
            width: `${CHAR_COUNT * 2}ch`,
            overflowX: "hidden",
            maskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          }}
        >
          <div
            style={{
              transform: `translateX(${offset}ch)`,
              transition: skipTransition.current
                ? "none"
                : "transform 80ms ease-out",
              whiteSpace: "pre",
            }}
          >
            {chars}
          </div>
          <input
            ref={inputRef}
            autoFocus
            className="w-full h-full absolute left-0 top-0 outline-none opacity-0"
            onChange={handleChange}
          ></input>
          <div className="absolute border-l border-accent left-1/2 -top-1 h-8 -translate-x-[1px]" />
        </div>
      </div>
    </div>
  );
};
