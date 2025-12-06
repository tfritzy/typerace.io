import { memo, useCallback, useRef } from "react";
import { TypeBox, type TypeBoxRef } from "./TypeBox";
import type { DbConnection } from "../../module_bindings";

type GamePageTypeBoxProps = {
  phrase: string;
  attribution?: string;
  gameId: string;
  conn: DbConnection | null;
  onFinish: () => void;
  disabled?: boolean;
  initialProgress?: number;
};

export const GamePageTypeBox = memo(({
  phrase,
  attribution,
  gameId,
  conn,
  onFinish,
  disabled = false,
  initialProgress = 0
}: GamePageTypeBoxProps) => {
  const typeBoxRef = useRef<TypeBoxRef>(null);

  const handleProgress = useCallback((correctCharCount: number, eventType: "Correct" | "Incorrect" | "Backspace") => {
    if (!conn || !gameId) return;

    const eventTypeEnum = { tag: eventType };
    conn.reducers.updateProgress(gameId, correctCharCount, eventTypeEnum);
  }, [conn, gameId]);

  const handleComplete = useCallback(() => {
    onFinish();
  }, [onFinish]);

  return (
    <div className="text-2xl leading-[1.6]">
      <TypeBox
        ref={typeBoxRef}
        phrase={phrase}
        attribution={attribution}
        onProgress={handleProgress}
        onComplete={handleComplete}
        disabled={disabled}
        height="430px"
        initialProgress={initialProgress}
      />
    </div>
  );
});

export type { GamePageTypeBoxProps };
