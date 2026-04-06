import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PlanetaryDefenseGame } from "./game";
import { getRandomWord } from "../../utils/wordLists";
import { getLanguageFromSlug } from "../../utils/modes";

const PHRASE_BUFFER_SIZE = 500;
const CURSOR_LERP = 0.22;
const CURSOR_BLINK_DELAY = 500;

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

function findFirstLineBreak(
  typedNode: Text | null,
  untypedNode: Text | null,
  typedLen: number
): number {
  const range = document.createRange();
  let firstTop: number | null = null;
  if (typedNode && typedNode.textContent) {
    for (let i = 0; i < typedNode.textContent.length; i++) {
      range.setStart(typedNode, i);
      range.setEnd(typedNode, i + 1);
      const top = range.getBoundingClientRect().top;
      if (firstTop === null) firstTop = top;
      else if (top > firstTop) return i;
    }
  }
  if (untypedNode && untypedNode.textContent) {
    for (let i = 0; i < untypedNode.textContent.length; i++) {
      range.setStart(untypedNode, i);
      range.setEnd(untypedNode, i + 1);
      const top = range.getBoundingClientRect().top;
      if (firstTop === null) firstTop = top;
      else if (top > firstTop) return typedLen + i;
    }
  }
  return -1;
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
  const typedRef = useRef<HTMLSpanElement>(null);
  const untypedRef = useRef<HTMLSpanElement>(null);
  const cursorTargetRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorPos = useRef({ x: 0, y: 0 });
  const cursorTargetXY = useRef({ x: 0, y: 0 });
  const cursorInitialized = useRef(false);
  const lastCursorMoveTime = useRef(0);
  const isBlinking = useRef(false);

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

  useEffect(() => {
    if (!visible) return;
    const typedNode = typedRef.current?.firstChild as Text | null;
    const untypedNode = untypedRef.current?.firstChild as Text | null;
    const lineBreak = findFirstLineBreak(typedNode, untypedNode, typedCount);
    if (lineBreak > 0 && typedCount >= lineBreak) {
      const remaining = phraseRef.current.slice(lineBreak);
      let newPhrase = remaining;
      if (remaining.length < PHRASE_BUFFER_SIZE * 2) {
        newPhrase = remaining + " " + generatePhrase(PHRASE_BUFFER_SIZE);
      }
      setPhrase(newPhrase);
      setTypedCount(typedCount - lineBreak);
    }
  }, [typedCount, phrase, visible]);

  useLayoutEffect(() => {
    if (!visible) {
      cursorInitialized.current = false;
      return;
    }

    lastCursorMoveTime.current = Date.now();
    isBlinking.current = false;

    let rafId = 0;

    const animate = () => {
      const box = boxRef.current;
      const target = cursorTargetRef.current;
      const cursor = cursorRef.current;
      if (!box || !target || !cursor) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      const boxRect = box.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const newX = targetRect.left - boxRect.left;
      const newY =
        targetRect.top -
        boxRect.top +
        (targetRect.height - cursor.offsetHeight) / 2;

      const dx = Math.abs(newX - cursorTargetXY.current.x);
      const dy = Math.abs(newY - cursorTargetXY.current.y);
      if (dx > 0.5 || dy > 0.5) {
        lastCursorMoveTime.current = Date.now();
        if (isBlinking.current) {
          isBlinking.current = false;
          cursor.classList.remove("animate-blink");
          cursor.style.opacity = "1";
        }
      }
      cursorTargetXY.current = { x: newX, y: newY };

      if (!cursorInitialized.current) {
        cursorPos.current = { ...cursorTargetXY.current };
        cursorInitialized.current = true;
      } else {
        cursorPos.current.x +=
          (cursorTargetXY.current.x - cursorPos.current.x) * CURSOR_LERP;
        cursorPos.current.y +=
          (cursorTargetXY.current.y - cursorPos.current.y) * CURSOR_LERP;
      }

      cursor.style.transform = `translate(${cursorPos.current.x}px, ${cursorPos.current.y}px)`;

      if (
        !isBlinking.current &&
        Date.now() - lastCursorMoveTime.current >= CURSOR_BLINK_DELAY
      ) {
        isBlinking.current = true;
        cursor.classList.add("animate-blink");
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={boxRef}
      onClick={() => inputRef.current?.focus()}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "10%",
        right: "10%",
        fontSize: "14px",
        lineHeight: "2.4",
        height: "4.8em",
        overflow: "hidden",
        background: "rgba(10, 10, 26, 0.9)",
        padding: "10px 20px",
        border: "2px solid #4a5568",
        zIndex: 10,
        overflowWrap: "break-word",
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
      <span ref={typedRef} style={{ color: "#90ee90" }}>
        {phrase.slice(0, typedCount)}
      </span>
      <span ref={cursorTargetRef}>{"\u200b"}</span>
      <span ref={untypedRef} style={{ color: "#ffffff" }}>
        {phrase.slice(typedCount)}
      </span>
      <div
        ref={cursorRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "2px",
          height: "1.2em",
          background: "var(--accent)",
          pointerEvents: "none",
          opacity: 1,
        }}
      />
    </div>
  );
};
