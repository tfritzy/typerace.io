import { useCallback, useEffect, useRef, useState } from "react";
import { createPlanetaryDefenseGame } from "./game";
import type { PlanetaryDefenseGame } from "./game";
import { startNextWave } from "./state";
import { LabelOverlay } from "./LabelOverlay";
import { PIXEL_FONT } from "./constants";
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

const PlanetHealthBar = ({ ratio }: { ratio: number }) => {
  const pct = Math.max(0, Math.min(100, ratio * 100));
  const barColor = pct > 60 ? "#4ade80" : pct > 30 ? "#fbbf24" : "#ef4444";

  return (
    <div className="absolute top-3 right-3 z-10">
      <div
        style={{
          background: "rgba(10, 10, 26, 0.85)",
          padding: "10px 14px",
          imageRendering: "pixelated",
        }}
      >
        <div
          style={{
            fontSize: "9px",
            color: "#cdd6f4",
            marginBottom: "8px",
            letterSpacing: "1px",
            whiteSpace: "nowrap",
          }}
        >
          PLANET HABITABILITY
        </div>
        <div
          style={{
            background: "#0f0f23",
            border: "2px solid #4a5568",
            height: "14px",
            width: "180px",
          }}
        >
          <div
            style={{
              background: barColor,
              height: "100%",
              width: `${pct}%`,
              transition: "width 0.3s, background-color 0.5s",
              imageRendering: "pixelated",
            }}
          />
        </div>
        <div
          style={{
            fontSize: "8px",
            color: "#a6adc8",
            marginTop: "6px",
            textAlign: "right",
          }}
        >
          {Math.round(pct)}%
        </div>
      </div>
    </div>
  );
};

const PhraseOverlay = ({
  gameRef,
  visible,
}: {
  gameRef: React.RefObject<PlanetaryDefenseGame | null>;
  visible: boolean;
}) => {
  const [phrase, setPhrase] = useState(() => generatePhrase(PHRASE_BUFFER_SIZE));
  const [typedCount, setTypedCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

        if (newTc > text.length / 2) {
          const remaining = text.slice(newTc);
          const extra = generatePhrase(PHRASE_BUFFER_SIZE);
          setPhrase(remaining + " " + extra);
          setTypedCount(0);
        } else {
          setTypedCount(newTc);
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

  if (!visible) return null;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "80%",
        fontFamily: PIXEL_FONT,
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
      <span style={{ color: "#90ee90" }}>{phrase.slice(0, typedCount)}</span>
      <span style={{ color: "#ffffff" }}>{phrase.slice(typedCount)}</span>
    </div>
  );
};

export const GameCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<PlanetaryDefenseGame | null>(null);
  const [healthRatio, setHealthRatio] = useState(1);
  const [waveNumber, setWaveNumber] = useState(0);
  const [waveActive, setWaveActive] = useState(false);

  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let cancelled = false;
    let unsubDamage: (() => void) | null = null;
    let unsubWaveComplete: (() => void) | null = null;

    createPlanetaryDefenseGame(div)
      .then((game) => {
        if (cancelled) {
          game.destroy();
          return;
        }
        gameRef.current = game;
        unsubDamage = game.state.onPlanetDamaged.subscribe(() => {
          setHealthRatio(game.state.planetHealth / game.state.maxPlanetHealth);
        });
        unsubWaveComplete = game.state.onWaveComplete.subscribe(() => {
          setWaveNumber(game.state.wave.wave);
          setWaveActive(false);
        });
      })
      .catch((err) => {
        console.error("Failed to initialize Planetary Defense:", err);
      });

    return () => {
      cancelled = true;
      unsubDamage?.();
      unsubWaveComplete?.();
      gameRef.current?.destroy();
      gameRef.current = null;
    };
  }, []);

  const waveActiveRef = useRef(false);
  waveActiveRef.current = waveActive;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (waveActiveRef.current) return;
      const game = gameRef.current;
      if (!game) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length !== 1) return;
      game.handleTypedCharacter(e.key);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleNextWave = useCallback(() => {
    const game = gameRef.current;
    if (game) {
      startNextWave(game.state);
      setWaveNumber(game.state.wave.wave);
      setWaveActive(true);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      style={{ fontFamily: PIXEL_FONT }}
    >
      <LabelOverlay gameRef={gameRef} />
      <PhraseOverlay gameRef={gameRef} visible={waveActive} />
      <PlanetHealthBar ratio={healthRatio} />
      <div className="absolute top-3 left-3 z-10">
        <div
          style={{
            background: "rgba(10, 10, 26, 0.85)",
            padding: "10px 14px",
            imageRendering: "pixelated",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "#cdd6f4",
              letterSpacing: "1px",
              whiteSpace: "nowrap",
            }}
          >
            WAVE {waveNumber}
          </div>
        </div>
        {!waveActive && (
          <button
            onClick={handleNextWave}
            style={{
              fontSize: "10px",
              letterSpacing: "1px",
              imageRendering: "pixelated",
              background: "rgba(74, 222, 128, 0.85)",
              color: "#0a0a1a",
              padding: "8px 14px",
              marginTop: "6px",
              display: "block",
              width: "100%",
            }}
            className="cursor-pointer hover:brightness-125"
          >
            {waveNumber === 0 ? "START" : "NEXT WAVE"}
          </button>
        )}
      </div>
    </div>
  );
};
