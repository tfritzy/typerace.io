import { memo, useCallback, useEffect, useRef, useState } from "react";
import { TypeBox, type TypeBoxRef } from "./TypeBox";
import type { DbConnection } from "../../module_bindings";
import type { Game } from "../types/stdb";
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
  }: GamePageTypeBoxProps) => {
    const typeBoxRef = useRef<TypeBoxRef>(null);
    const [xpIndicators, setXpIndicators] = useState<XpIndicatorInstance[]>([]);
    const xpIndicatorIdCounter = useRef(0);
    const [game, setGame] = useState<Game | null>(null);
    const [countdownTick, setCountdownTick] = useState(0);

    useEffect(() => {
      if (!conn || !gameId) return;
      const handleInsert = (_ctx: any, g: Game) => {
        if (g.id.toString() === gameId) setGame(g);
      };
      const handleUpdate = (_ctx: any, _o: Game, g: Game) => {
        if (g.id.toString() === gameId) setGame(g);
      };
      conn.db.game.onInsert(handleInsert);
      conn.db.game.onUpdate(handleUpdate);
      const current = conn.db.game.id.find(gameId);
      if (current) setGame(current);
      return () => {
        conn.db.game.removeOnInsert(handleInsert);
        conn.db.game.removeOnUpdate(handleUpdate);
      };
    }, [conn, gameId]);

    const tag = game?.state?.tag;
    const isCountdownState = tag === "Countdown";
    const isRacing = tag === "Racing";

    useEffect(() => {
      if (!isCountdownState) return;
      setCountdownTick((t) => t + 1);
      const interval = setInterval(() => {
        setCountdownTick((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }, [isCountdownState]);

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
        <div className="relative">
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
          />
          {isCountdownState && (
            <div
              key={countdownTick}
              aria-hidden="true"
              className="type-box-border-pulse type-box-border-pulse--tick"
            />
          )}
          {isRacing && (
            <div
              aria-hidden="true"
              className="type-box-border-pulse type-box-border-pulse--active"
            />
          )}
        </div>
      </div>
    );
  }
);

export type { GamePageTypeBoxProps };
