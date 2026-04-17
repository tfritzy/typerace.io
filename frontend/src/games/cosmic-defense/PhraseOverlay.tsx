import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CosmicDefenseGame } from "./game";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";

const PHRASE_BUFFER_SIZE = 500;

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

export const PhraseOverlay = ({
  gameRef,
  visible,
}: {
  gameRef: React.RefObject<CosmicDefenseGame | null>;
  visible: boolean;
}) => {
  const [phrase, setPhrase] = useState(() => generatePhrase(PHRASE_BUFFER_SIZE));
  const [typedText, setTypedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorCharRef = useRef<HTMLSpanElement>(null);
  const offsetRef = useRef(0);

  const phraseRef = useRef(phrase);
  const typedTextRef = useRef(typedText);
  phraseRef.current = phrase;
  typedTextRef.current = typedText;

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current;
      if (!game) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        return;
      }
      if (e.key.length !== 1) return;
      e.preventDefault();

      const text = phraseRef.current;
      const tc = typedTextRef.current.length;
      const normalizedKey = e.key.toLowerCase();
      const correct = tc < text.length && normalizedKey === text[tc].toLowerCase();
      const newTypedText = typedTextRef.current + e.key;

      if (correct) {
        game.onCorrectKeystroke();
      }

      setTypedText(newTypedText);
      if (inputRef.current) inputRef.current.value = "";

      if (newTypedText.length > PHRASE_BUFFER_SIZE && text.length - newTypedText.length < PHRASE_BUFFER_SIZE) {
        const extra = generatePhrase(PHRASE_BUFFER_SIZE);
        setPhrase(text + " " + extra);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [gameRef, visible]);

  useEffect(() => {
    if (visible) {
      setPhrase(generatePhrase(PHRASE_BUFFER_SIZE));
      setTypedText("");
    }
  }, [visible]);

  useLayoutEffect(() => {
    if (!visible) return;

    const box = boxRef.current;
    const track = trackRef.current;
    const charEl = cursorCharRef.current;
    if (!box || !track || !charEl) return;

    if (typedText.length === 0) {
      offsetRef.current = 0;
    }

    const boxRect = box.getBoundingClientRect();
    const charRect = charEl.getBoundingClientRect();
    const boxCenter = boxRect.width / 2;
    const prevOffset = offsetRef.current;
    const naturalCharCenter =
      charRect.left - prevOffset - boxRect.left + charRect.width / 2;
    const newOffset = boxCenter - naturalCharCenter;

    offsetRef.current = newOffset;
    track.style.transform = `translateX(${newOffset}px)`;
  }, [phrase, typedText.length, visible]);

  if (!visible) return null;

  let lastCompletedWordEnd = 0;
  for (let i = 0; i < typedText.length && i < phrase.length; i++) {
    if (typedText[i] !== phrase[i]) break;
    if (phrase[i] === " ") lastCompletedWordEnd = i + 1;
  }

  return (
    <div
      ref={boxRef}
      onClick={() => inputRef.current?.focus()}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-80 text-[32px] font-light tracking-wide leading-[2.4] h-[2.4em] overflow-hidden px-5 z-10 whitespace-nowrap"
    >
      <input
        ref={inputRef}
        autoFocus
        className="absolute opacity-0 w-0 h-0 pointer-events-none"
        onInput={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
      />
      <div
        ref={trackRef}
        className="inline-block whitespace-nowrap transition-transform duration-[80ms] ease-out"
      >
        {phrase.split("").map((char, i) => {
          const isTyped = i < typedText.length;
          const isCorrect = isTyped && typedText[i] === char;
          const isCursor = i === typedText.length;
          const isInCompletedWord = i < lastCompletedWordEnd;
          const isInCurrentWord =
            i >= lastCompletedWordEnd && i < typedText.length && isCorrect;

          let colorClass = "text-text-untyped";
          if (isTyped && !isCorrect) {
            colorClass = "text-destructive";
          } else if (isInCompletedWord) {
            colorClass = "text-text-completed";
          } else if (isInCurrentWord) {
            colorClass = "text-foreground";
          }

          return (
            <span
              key={i}
              ref={isCursor ? cursorCharRef : null}
              className={`${colorClass} ${isTyped && !isCorrect ? "underline decoration-2 decoration-destructive" : ""} ${isCursor ? "shadow-[-1px_0_0_0_#4a5568]" : ""}`}
            >
              {char}
            </span>
          );
        })}
      </div>
    </div>
  );
};
