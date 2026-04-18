import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CosmicDefenseGame } from "./game";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";

const MAX_COMPLETED_DISPLAY_CHARS = 160;

function getLangCode(): string {
  const slug = window.location.pathname.split("/").pop() ?? "";
  return getLanguageFromSlug(slug)?.htmlLang ?? "en";
}

function generateWord(): string {
  return getRandomWord(getLangCode());
}

function trimCompletedWords(words: string[]): string[] {
  const spacesCount = Math.max(words.length - 1, 0);
  let totalChars = words.reduce((sum, word) => sum + word.length, 0) + spacesCount;
  let start = 0;

  while (totalChars > MAX_COMPLETED_DISPLAY_CHARS && start < words.length - 1) {
    totalChars -= words[start].length + 1;
    start++;
  }

  const trimmedWords = start === 0 ? words : words.slice(start);
  if (trimmedWords.length === 1 && trimmedWords[0].length > MAX_COMPLETED_DISPLAY_CHARS) {
    return [trimmedWords[0].slice(-MAX_COMPLETED_DISPLAY_CHARS)];
  }

  return trimmedWords;
}

function charsMatch(typedChar: string, targetChar: string): boolean {
  return typedChar.toLowerCase() === targetChar.toLowerCase();
}

export const PhraseOverlay = ({
  gameRef,
  visible,
}: {
  gameRef: React.RefObject<CosmicDefenseGame | null>;
  visible: boolean;
}) => {
  const [completedWords, setCompletedWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState(() => generateWord());
  const [typedWord, setTypedWord] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorCharRef = useRef<HTMLSpanElement>(null);
  const offsetRef = useRef(0);

  const completedWordsRef = useRef(completedWords);
  const currentWordRef = useRef(currentWord);
  const typedWordRef = useRef(typedWord);
  completedWordsRef.current = completedWords;
  currentWordRef.current = currentWord;
  typedWordRef.current = typedWord;

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current;
      if (!game) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        if (typedWordRef.current.length > 0) {
          setTypedWord(typedWordRef.current.slice(0, -1));
        }
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        if (typedWordRef.current.length === 0) return;
        setCompletedWords(trimCompletedWords([...completedWordsRef.current, typedWordRef.current]));
        setTypedWord("");
        setCurrentWord(generateWord());
        if (inputRef.current) inputRef.current.value = "";
        return;
      }

      if (e.key.length !== 1) return;
      e.preventDefault();

      const normalizedKey = e.key.toLowerCase();
      const typedLength = typedWordRef.current.length;
      const targetWord = currentWordRef.current;
      const correct =
        typedLength < targetWord.length && normalizedKey === targetWord[typedLength].toLowerCase();
      const newTypedWord = typedWordRef.current + e.key;

      if (correct) {
        game.onCorrectKeystroke();
      }

      setTypedWord(newTypedWord);
      if (inputRef.current) inputRef.current.value = "";
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [gameRef, visible]);

  useEffect(() => {
    if (visible) {
      setCompletedWords([]);
      setCurrentWord(generateWord());
      setTypedWord("");
    }
  }, [visible]);

  useLayoutEffect(() => {
    if (!visible) return;

    const box = boxRef.current;
    const track = trackRef.current;
    const charEl = cursorCharRef.current;
    if (!box || !track || !charEl) return;

    if (completedWords.length === 0 && typedWord.length === 0) {
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
  }, [completedWords, currentWord, typedWord.length, visible]);

  if (!visible) return null;

  const completedText = completedWords.length > 0 ? `${completedWords.join(" ")} ` : "";
  const displayWordLength = Math.max(currentWord.length, typedWord.length);

  return (
    <div
      ref={boxRef}
      onClick={() => inputRef.current?.focus()}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[640px] text-[32px] font-light tracking-wide leading-[2.4] h-[2.4em] overflow-hidden px-5 z-10 whitespace-nowrap"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
      }}
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
        {completedText.length > 0 && (
          <span className="text-text-completed">{completedText}</span>
        )}
        {Array.from({ length: displayWordLength }).map((_, i) => {
          const targetChar = currentWord[i];
          const typedChar = typedWord[i];
          const displayChar = targetChar ?? typedChar;
          const isTyped = i < typedWord.length;
          const isCorrect = isTyped && targetChar !== undefined && charsMatch(typedChar, targetChar);
          const isCursor = i === typedWord.length;

          let colorClass = "text-text-untyped";
          if (isTyped && !isCorrect) {
            colorClass = "text-destructive";
          } else if (isTyped) {
            colorClass = "text-foreground";
          }

          return (
            <span
              key={i}
              ref={isCursor ? cursorCharRef : null}
              className={`${colorClass} ${isTyped && !isCorrect ? "underline decoration-2 decoration-destructive" : ""} ${isCursor ? "shadow-[-1px_0_0_0_#4a5568]" : ""}`}
            >
              {displayChar}
            </span>
          );
        })}
        {typedWord.length >= displayWordLength && (
          <span
            ref={cursorCharRef}
            className="text-text-untyped shadow-[-1px_0_0_0_#4a5568]"
          >
            {" "}
          </span>
        )}
      </div>
    </div>
  );
};
