import { memo, useCallback, useRef, useState } from "react";
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
  }: GamePageTypeBoxProps) => {
    const typeBoxRef = useRef<TypeBoxRef>(null);
    const [xpIndicators, setXpIndicators] = useState<XpIndicatorInstance[]>([]);
    const xpIndicatorIdCounter = useRef(0);

    const handleProgress = useCallback(
      (
        correctCharCount: number,
        eventType: "Correct" | "Incorrect" | "Backspace"
      ) => {
        if (!conn || !gameId) return;

        const eventTypeEnum = { tag: eventType };
        conn.reducers.updateProgress(gameId, correctCharCount, eventTypeEnum);
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
        />
      </div>
    );
  }
);

export type { GamePageTypeBoxProps };
