import { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  TypeBox,
  type TypeBoxCursorState,
  type TypeBoxInputState,
} from "./TypeBox";
import type { DbConnection } from "../../module_bindings";
import { Countdown } from "./Countdown";
import { getCompletedWordCount, getWordCount } from "@/utils/typeBoxCore";
import { AutofixRow } from "./AutofixRow";

type GamePageTypeBoxProps = {
  phrase: string;
  attribution?: string;
  gameId: string;
  conn: DbConnection | null;
  onFinish: () => void;
  inputState?: TypeBoxInputState;
  initialProgress?: number;
  autofixesRemaining: number;
  onAutofixesConsumed: (count: number) => void;
  isParticipant?: boolean;
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
    autofixesRemaining,
    onAutofixesConsumed,
    isParticipant = true,
    cursorState = "auto",
    raceStartsAt,
  }: GamePageTypeBoxProps) => {
    const totalWords = useMemo(() => getWordCount(phrase), [phrase]);
    const [completedWords, setCompletedWords] = useState(() =>
      getCompletedWordCount(phrase, initialProgress),
    );
    const completedWordsRef = useRef(completedWords);
    const handleProgress = useCallback(
      (
        correctCharCount: number,
        eventType: "Correct" | "Incorrect" | "Backspace",
      ) => {
        const nextCompletedWords = getCompletedWordCount(
          phrase,
          correctCharCount,
        );
        if (nextCompletedWords !== completedWordsRef.current) {
          completedWordsRef.current = nextCompletedWords;
          setCompletedWords(nextCompletedWords);
        }
        if (!conn || !gameId) return;

        const eventTypeEnum = { tag: eventType };
        conn.reducers.updateProgress({
          gameId,
          newIndex: correctCharCount,
          eventType: eventTypeEnum,
        });
      },
      [conn, gameId, phrase],
    );

    const handleComplete = useCallback(() => {
      onFinish();
    }, [onFinish]);

    return (
      <div className="mt-6 min-h-[550px] text-2xl leading-[1.6] sm:mt-8">
        {isParticipant && (
          <AutofixRow
            remaining={autofixesRemaining}
            completedWords={completedWords}
            totalWords={totalWords}
          />
        )}
        <div className="relative">
          <TypeBox
            phrase={phrase}
            attribution={attribution}
            onProgress={handleProgress}
            onComplete={handleComplete}
            inputState={inputState}
            height="430px"
            initialProgress={initialProgress}
            cursorState={cursorState}
            autofixesRemaining={autofixesRemaining}
            onAutofixesConsumed={onAutofixesConsumed}
          />
          <Countdown raceStartsAt={raceStartsAt} />
        </div>
      </div>
    );
  },
);

export type { GamePageTypeBoxProps };
