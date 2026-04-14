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
  const [typedCount, setTypedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cursorCharRef = useRef<HTMLSpanElement>(null);
  const offsetRef = useRef(0);

  const phraseRef = useRef(phrase);
  const typedCountRef = useRef(typedCount);
  phraseRef.current = phrase;
  typedCountRef.current = typedCount;

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const game = gameRef.current;
      if (!game) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return;

      const text = phraseRef.current;
      const tc = typedCountRef.current;
      const normalizedKey = e.key.toLowerCase();
      const correct = tc < text.length && normalizedKey === text[tc].toLowerCase();

      if (correct) {
        const newTc = tc + 1;
        game.onCorrectKeystroke();
        setTypedCount(newTc);

        if (newTc > PHRASE_BUFFER_SIZE && text.length - newTc < PHRASE_BUFFER_SIZE) {
          const extra = generatePhrase(PHRASE_BUFFER_SIZE);
          setPhrase(text + " " + extra);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [gameRef, visible]);

  useEffect(() => {
    if (visible) {
      setPhrase(generatePhrase(PHRASE_BUFFER_SIZE));
      setTypedCount(0);
    }
  }, [visible]);

  useLayoutEffect(() => {
    if (!visible) return;

    const box = boxRef.current;
    const track = trackRef.current;
    const charEl = cursorCharRef.current;
    if (!box || !track || !charEl) return;

    if (typedCount === 0) {
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
  }, [typedCount, phrase, visible]);

  if (!visible) return null;

  return (
    <div
      ref={boxRef}
      onClick={() => inputRef.current?.focus()}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-80 text-sm leading-[2.4] h-[2.4em] overflow-hidden px-5 border-2 border-[#4a5568] z-10 whitespace-nowrap"
      style={{ background: "rgba(10, 10, 26, 0.9)" }}
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
        <span className="text-[#90ee90]">
          {phrase.slice(0, typedCount)}
        </span>
        <span ref={cursorCharRef} className="text-white shadow-[-2px_0_0_0_#4a5568]">
          {typedCount < phrase.length ? phrase[typedCount] : ""}
        </span>
        <span className="text-white">
          {phrase.slice(typedCount + 1)}
        </span>
      </div>
    </div>
  );
};
