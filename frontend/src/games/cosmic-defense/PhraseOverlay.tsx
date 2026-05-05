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
const HOTKEYS = new Set(["1", "2", "3"]);

export const PhraseOverlay = ({
  gameRef,
  isPaused,
}: {
  gameRef: React.RefObject<CosmicDefenseGame | null>;
  isPaused: boolean;
}) => {
  const [autoTyperWpm, setAutoTyperWpm] = useState(150);
  const [typed, setTyped] = useState<string>("");
  const [phrase, setPhrase] = useState<string>(() => generatePhrase(5));
  const [checkpoint, setCheckpoint] = useState<number>(0);
  const skipTransition = useRef(false);
  const typedRef = useRef(typed);
  const phraseRef = useRef(phrase);
  const checkpointRef = useRef(checkpoint);
  const inputRef = useRef<HTMLInputElement>(null);

  const processInput = useCallback(
    (key: string, ctrlKey: boolean) => {
      skipTransition.current = false;
      let currentTyped = typedRef.current;
      let currentPhrase = phraseRef.current;
      let currentCheckpoint = checkpointRef.current;

      if (key === "Backspace") {
        if (ctrlKey) {
          const lastSpace = currentTyped.lastIndexOf(
            " ",
            currentTyped.length - 2,
          );
          currentTyped =
            lastSpace >= 0 ? currentTyped.substring(0, lastSpace + 1) : "";
        } else {
          currentTyped = currentTyped.substring(0, currentTyped.length - 1);
        }
        if (currentTyped.length < currentCheckpoint) {
          currentTyped = typedRef.current.substring(0, currentCheckpoint);
        }
      } else {
        currentTyped = currentTyped + key;
        const typedPos = currentTyped.length - 1;
        const phraseChar = currentPhrase[typedPos];
        if (key === phraseChar) {
          gameRef.current?.onCorrectKeystroke();
          if (phraseChar === " ") {
            const wordStart = currentPhrase.lastIndexOf(" ", typedPos - 1) + 1;
            let perfect = true;
            for (let i = wordStart; i < typedPos; i++) {
              if (currentTyped[i] !== currentPhrase[i]) {
                perfect = false;
                break;
              }
            }
            gameRef.current?.onWordCompleted(perfect);
          }
        }
      }

      while (currentPhrase.length - currentTyped.length < CHAR_COUNT) {
        currentPhrase += " " + getRandomWord(getLangCode());
      }

      while (currentTyped.length > CHAR_COUNT * 2) {
        const spaceI = currentPhrase.indexOf(" ") + 1;
        currentPhrase = currentPhrase.substring(spaceI);
        currentTyped = currentTyped.substring(spaceI);
        currentCheckpoint -= spaceI;
        skipTransition.current = true;
      }

      typedRef.current = currentTyped;
      phraseRef.current = currentPhrase;
      checkpointRef.current = currentCheckpoint;
      setTyped(currentTyped);
      setPhrase(currentPhrase);
      setCheckpoint(currentCheckpoint);
    },
    [gameRef],
  );

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (isPaused) return;
      if (e.target === inputRef.current) return;
      if (HOTKEYS.has(e.key)) return;
      if (e.metaKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        processInput("Backspace", e.ctrlKey);
      } else if (e.key.length === 1) {
        e.preventDefault();
        processInput(e.key, false);
      }
    },
    [isPaused, processInput],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (isPaused) return;
    const intervalMs = Math.round(60000 / (autoTyperWpm * 5));
    const interval = setInterval(() => {
      const nextChar = phraseRef.current[typedRef.current.length];
      if (nextChar !== undefined) {
        processInput(nextChar, false);
      }
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isPaused, processInput, autoTyperWpm]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const onInput = () => {
      if (isPaused) {
        input.value = "";
        return;
      }
      const val = input.value;
      if (val.length > 0) {
        for (const char of val) {
          processInput(char, false);
        }
        input.value = "";
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;
      if (HOTKEYS.has(e.key)) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        processInput("Backspace", e.ctrlKey);
      }
    };

    input.addEventListener("input", onInput);
    input.addEventListener("keydown", onKeyDown);
    return () => {
      input.removeEventListener("input", onInput);
      input.removeEventListener("keydown", onKeyDown);
    };
  }, [isPaused, processInput]);

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
              <span key={i} style={{ color: "rgba(255,255,255,1)" }}>
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
            <span key={i} style={{ color: "rgba(255,255,255,0.3)" }}>
              {phrase[i]}
            </span>,
          );
        }
      } else {
        c.push(
          <span key={i} style={{ color: "rgba(255,255,255,0.5)" }}>
            {phrase[i]}
          </span>,
        );
      }
    }

    return c;
  }, [phrase, typed, checkpoint]);

  const offset = CHAR_COUNT - typed.length;

  return (
    <div className="w-full h-full relative" style={{ pointerEvents: "none" }}>
      <input
        ref={inputRef}
        type="text"
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        style={{
          position: "absolute",
          opacity: 0,
          width: 1,
          height: 1,
          top: "50%",
          left: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ pointerEvents: "auto", cursor: "text", visibility: isPaused ? "hidden" : "visible" }}
        onClick={() => inputRef.current?.focus()}
      >
        <div
          className="text-3xl font-mono whitespace-pre relative"
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
              textShadow:
                "0 0 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7), 0 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            {chars}
          </div>
          <div
            className="absolute left-1/2 top-0 h-[2.25rem] -translate-x-px"
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.7)",
              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))",
            }}
          />
        </div>
      </div>
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2"
        style={{ pointerEvents: "auto" }}
      >
        <span className="text-[11px] text-[rgba(255,255,255,0.6)] font-mono whitespace-nowrap">
          {autoTyperWpm} wpm
        </span>
        <input
          type="range"
          min={10}
          max={300}
          step={10}
          value={autoTyperWpm}
          onChange={(e) => setAutoTyperWpm(Number(e.target.value))}
          style={{ width: 120, accentColor: "rgba(249,226,175,0.8)" }}
        />
      </div>
    </div>
  );
};
