import { memo, useCallback, useRef, useState } from "react";
import {
  TypeBox,
  type TypeBoxCursorState,
  type TypeBoxInputState,
  type TypeBoxRef,
} from "./TypeBox";
import type { DbConnection } from "../../module_bindings";
import { Countdown } from "./Countdown";
import { WordXpIndicator } from "./WordXpIndicator";
import { getLanguageFromSlug } from "@/utils/modes";
import { useParams } from "react-router-dom";

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
  inputState?: TypeBoxInputState;
  initialProgress?: number;
  isAnonymous?: boolean;
  cursorState?: TypeBoxCursorState;
  raceStartsAt: number | null;
};

export const GamePageTypeBox = memo(
  ({
    phrase,
    attribution,
    gameId,
    conn,
    onFinish,
    inputState = "enabled",
    initialProgress = 0,
    isAnonymous = true,
    cursorState = "auto",
    raceStartsAt,
  }: GamePageTypeBoxProps) => {
    const typeBoxRef = useRef<TypeBoxRef>(null);
    const [xpIndicators, setXpIndicators] = useState<XpIndicatorInstance[]>([]);
    const xpIndicatorIdCounter = useRef(0);
    const lang = useParams().lang;
    const language = getLanguageFromSlug(lang);
    const noSpacesLang = language.hasNoSpaces;

    const handleProgress = useCallback(
      (
        correctCharCount: number,
        eventType: "Correct" | "Incorrect" | "Backspace",
      ) => {
        if (!conn || !gameId) return;

        const eventTypeEnum = { tag: eventType };
        conn.reducers.updateProgress({
          gameId,
          newIndex: correctCharCount,
          eventType: eventTypeEnum,
        });
      },
      [conn, gameId],
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
      [isAnonymous],
    );

    const handleXpIndicatorComplete = useCallback((id: number) => {
      setXpIndicators((prev) =>
        prev.filter((indicator) => indicator.id !== id),
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
            inputState={inputState}
            height="430px"
            initialProgress={initialProgress}
            cursorState={cursorState}
            noSpacesInPhrase={noSpacesLang}
          />
          <Countdown raceStartsAt={raceStartsAt} />
        </div>
      </div>
    );
  },
);

export type { GamePageTypeBoxProps };
