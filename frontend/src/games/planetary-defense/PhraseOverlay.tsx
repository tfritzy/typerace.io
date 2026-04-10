import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PlanetaryDefenseGame } from "./game";
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
  gameRef: React.RefObject<PlanetaryDefenseGame | null>;
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

      game.handleTypedCharacter(e.key);

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
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "320px",
        fontSize: "14px",
        lineHeight: "2.4",
        height: "2.4em",
        overflow: "hidden",
        background: "rgba(10, 10, 26, 0.9)",
        padding: "0 20px",
        border: "2px solid #4a5568",
        zIndex: 10,
        whiteSpace: "nowrap",
      }}
    >
      <input
        ref={inputRef}
        autoFocus
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
          pointerEvents: "none",
        }}
        onInput={(e) => {
          (e.target as HTMLInputElement).value = "";
        }}
      />
      <div
        ref={trackRef}
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          transition: "transform 0.08s ease-out",
        }}
      >
        <span style={{ color: "#90ee90" }}>
          {phrase.slice(0, typedCount)}
        </span>
        <span ref={cursorCharRef} style={{ color: "#ffffff", boxShadow: "-2px 0 0 0 #4a5568" }}>
          {typedCount < phrase.length ? phrase[typedCount] : ""}
        </span>
        <span style={{ color: "#ffffff" }}>
          {phrase.slice(typedCount + 1)}
        </span>
      </div>
    </div>
  );
};
