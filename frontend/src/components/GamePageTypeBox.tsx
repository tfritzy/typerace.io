import { memo, useCallback, useMemo, useState } from "react";
import {
  TypeBox,
  type TypeBoxCursorState,
  type TypeBoxInputState,
} from "./TypeBox";
import type { DbConnection } from "../../module_bindings";
import { Countdown } from "./Countdown";
import {
  analyzeTypeBoxInput,
  getCompletedWordCount,
  getWordCount,
} from "@/utils/typeBoxCore";
import { AllowedErrorsRow } from "./AllowedErrorsRow";

type GamePageTypeBoxProps = {
  phrase: string;
  attribution?: string;
  gameId: string;
  conn: DbConnection | null;
  onFinish: () => void;
  inputState?: TypeBoxInputState;
  initialInput?: string;
  totalAllowedErrors: number;
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
    initialInput = "",
    totalAllowedErrors,
    isParticipant = true,
    cursorState = "auto",
    raceStartsAt,
  }: GamePageTypeBoxProps) => {
    const totalWords = useMemo(() => getWordCount(phrase), [phrase]);
    const [input, setInput] = useState(initialInput);
    const analysis = analyzeTypeBoxInput(
      phrase,
      input,
      totalAllowedErrors,
    );
    const completedWords = getCompletedWordCount(
      phrase,
      analysis.completedThrough,
    );
    const showFixWarning = analysis.errorsToFix > 0;
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
      [conn, gameId, phrase],
    );

    const handleComplete = useCallback(() => {
      onFinish();
    }, [onFinish]);

    return (
      <div className="mt-6 min-h-[550px] text-2xl leading-[1.6] sm:mt-8">
        {isParticipant && (
          <AllowedErrorsRow
            total={totalAllowedErrors}
            remaining={Math.max(0, totalAllowedErrors - analysis.errorsUsed)}
            showFixWarning={showFixWarning}
            errorsToFix={analysis.errorsToFix}
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
            initialValue={initialInput}
            cursorState={cursorState}
            onValueChange={setInput}
            totalAllowedErrors={totalAllowedErrors}
          />
          <Countdown
            raceStartsAt={raceStartsAt}
            errorBorder={showFixWarning}
          />
        </div>
      </div>
    );
  },
);

export type { GamePageTypeBoxProps };
