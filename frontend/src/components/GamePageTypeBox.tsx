import { useCallback, useRef } from "react";
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

export const GamePageTypeBox = ({
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
    <div className="text-2xl font-mono leading-[1.6]">
      <TypeBox
        ref={typeBoxRef}
        phrase={phrase}
        onProgress={handleProgress}
        onComplete={handleComplete}
        disabled={disabled}
        height="430px"
        initialProgress={initialProgress}
      />
      {attribution && (
        <div className="mt-4 text-sm text-white/40 font-sans italic text-center select-none">
          — {attribution}
        </div>
      )}
    </div>
  );
};

export type { GamePageTypeBoxProps };
