import { useCallback, useRef } from "react";
import { TypeBox, type TypeBoxRef } from "./TypeBox";
import type { DbConnection } from "../../module_bindings";

type GamePageTypeBoxProps = {
  phrase: string;
  gameId: string;
  conn: DbConnection | null;
  onFinish: () => void;
  disabled?: boolean;
};

export const GamePageTypeBox = ({ 
  phrase, 
  gameId, 
  conn,
  onFinish,
  disabled = false
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
    <div
      className="text-2xl font-mono" style={{ lineHeight: 1.6 }}
    >
      <TypeBox
        ref={typeBoxRef}
        phrase={phrase}
        onProgress={handleProgress}
        onComplete={handleComplete}
        disabled={disabled}
        style={{ height: '430px', display: 'flex', alignItems: 'flex-start' }}
      />
    </div>
  );
};

export type { GamePageTypeBoxProps };
