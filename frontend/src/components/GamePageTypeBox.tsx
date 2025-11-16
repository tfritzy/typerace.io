import { useCallback, useRef } from "react";
import { TypeBox, type TypeBoxRef } from "./TypeBox";
import { CopyableLink } from "./CopyableLink";
import type { DbConnection } from "../../module_bindings";

type GamePageTypeBoxProps = {
  phrase: string;
  gameId: string;
  shouldShowStartPrompt: boolean;
  conn: DbConnection | null;
  onFinish: () => void;
};

export const GamePageTypeBox = ({ 
  phrase, 
  gameId, 
  shouldShowStartPrompt, 
  conn,
  onFinish 
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

  const handleStartGame = useCallback(() => {
    if (!conn || !gameId) return;
    conn.reducers.startPrivateGame(gameId);
  }, [conn, gameId]);

  const gameUrl = `${window.location.origin}/game/${gameId}`;

  return (
    <>
      <div
        className="text-2xl font-mono" style={{ lineHeight: 1.6 }}
      >
        <TypeBox
          ref={typeBoxRef}
          phrase={shouldShowStartPrompt ? "start game" : phrase}
          onProgress={shouldShowStartPrompt ? undefined : handleProgress}
          onComplete={shouldShowStartPrompt ? handleStartGame : handleComplete}
          style={{ height: '430px', display: 'flex', alignItems: 'flex-start' }}
        />
      </div>
      
      {shouldShowStartPrompt && (
        <CopyableLink url={gameUrl} />
      )}
    </>
  );
};

export type { GamePageTypeBoxProps };
