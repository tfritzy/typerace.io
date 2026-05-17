import { memo, useCallback, useEffect, useRef, useState } from "react";
import { TypeBox, type TypeBoxRef } from "./TypeBox";
import type { DbConnection } from "../../module_bindings";
import { WordXpIndicator } from "./WordXpIndicator";

interface XpIndicatorInstance {
  id: number;
  xp: number;
  position: { x: number; y: number };
}

type GamePageTypeBoxProps = {
  phrase: string;
  attribution?: string;
  gameId: string;
  conn: DbConnection | null;
  onFinish: () => void;
  disabled?: boolean;
  initialProgress?: number;
  isAnonymous?: boolean;
  hideCursor?: boolean;
  borderState?: "off" | "countdown" | "active";
};

export const GamePageTypeBox = memo(
  ({
    phrase,
    attribution,
    gameId,
    conn,
    onFinish,
    disabled = false,
    initialProgress = 0,
    isAnonymous = true,
    hideCursor = false,
    borderState = "off",
  }: GamePageTypeBoxProps) => {
    const typeBoxRef = useRef<TypeBoxRef>(null);
    const [xpIndicators, setXpIndicators] = useState<XpIndicatorInstance[]>([]);
    const xpIndicatorIdCounter = useRef(0);

    const [countdownBright, setCountdownBright] = useState(false);

    useEffect(() => {
      if (borderState !== "countdown") {
        setCountdownBright(false);
        return;
      }

      const PERIOD_MS = 1000;
      let rafId: number | null = null;

      const tick = () => {
        setCountdownBright(true);
        rafId = requestAnimationFrame(() => {
          rafId = requestAnimationFrame(() => setCountdownBright(false));
        });
      };

      tick();
      const interval = setInterval(tick, PERIOD_MS);

      return () => {
        clearInterval(interval);
        if (rafId !== null) cancelAnimationFrame(rafId);
        setCountdownBright(false);
      };
    }, [borderState]);

    const borderHighlight =
      borderState === "active" ||
      (borderState === "countdown" && countdownBright);

    const handleProgress = useCallback(
      (
        correctCharCount: number,
        eventType: "Correct" | "Incorrect" | "Backspace"
      ) => {
        if (!conn || !gameId) return;

        const eventTypeEnum = { tag: eventType };
        conn.reducers.updateProgress({
            gameId,
            newIndex: correctCharCount,
            eventType: eventTypeEnum
        });
      },
      [conn, gameId]
    );

    const handleComplete = useCallback(() => {
      onFinish();
    }, [onFinish]);

    const handleWordComplete = useCallback(
      (wordXp: number, position: { x: number; y: number }) => {
        if (isAnonymous) return;

        const newIndicator: XpIndicatorInstance = {
          id: xpIndicatorIdCounter.current++,
          xp: wordXp,
          position,
        };
        setXpIndicators((prev) => [...prev, newIndicator]);
      },
      [isAnonymous]
    );

    const handleXpIndicatorComplete = useCallback((id: number) => {
      setXpIndicators((prev) =>
        prev.filter((indicator) => indicator.id !== id)
      );
    }, []);

    return (
      <div className="text-2xl leading-[1.6]">
        {xpIndicators.map((indicator) => (
          <WordXpIndicator
            key={indicator.id}
            xp={indicator.xp}
            position={indicator.position}
            onComplete={() => handleXpIndicatorComplete(indicator.id)}
          />
        ))}
        <TypeBox
          ref={typeBoxRef}
          phrase={phrase}
          attribution={attribution}
          onProgress={handleProgress}
          onComplete={handleComplete}
          onWordComplete={handleWordComplete}
          disabled={disabled}
          height="430px"
          initialProgress={initialProgress}
          hideCursor={hideCursor}
          borderHighlight={borderHighlight}
        />
      </div>
    );
  }
);

export type { GamePageTypeBoxProps };
