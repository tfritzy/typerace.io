import { memo, useCallback, useMemo, useRef } from "react";
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
import {
  useRaceInput,
  useRaceStateStore,
} from "../contexts/RaceStateContext";

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
    const raceState = useRaceStateStore();
    const input = useRaceInput();
    const initialInputRef = useRef(initialInput);
    const totalWords = useMemo(() => getWordCount(phrase), [phrase]);
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
      [conn, gameId],
    );

    const handleComplete = useCallback(() => {
      onFinish();
    }, [onFinish]);

    const handleValueChange = useCallback(
      (value: string) => raceState.setInput(value),
      [raceState],
    );

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
            initialValue={initialInputRef.current}
            cursorState={cursorState}
            onValueChange={handleValueChange}
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
