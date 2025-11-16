import { useCallback, useRef } from "react";
import { TypeBox, type TypeBoxRef } from "./TypeBox";
import { CopyableLink } from "./CopyableLink";
import type { DbConnection } from "../../module_bindings";

type GamePageTypeBoxProps = {
  phrase: string;
  gameId: string;
  isLobby: boolean;
  conn: DbConnection | null;
  onFinish: () => void;
};

export const GamePageTypeBox = ({ 
  phrase, 
  gameId, 
  isLobby, 
  conn,
  onFinish 
}: GamePageTypeBoxProps) => {
  const typeBoxRef = useRef<TypeBoxRef>(null);

  const handleStartGame = useCallback(() => {
    if (!conn || !gameId) return;
    conn.reducers.startPrivateGame(gameId);
  }, [conn, gameId]);

  const gameUrl = `${window.location.origin}/game/${gameId}`;

  if (isLobby) {
    return (
      <>
        <div
          className="text-2xl font-mono" style={{ lineHeight: 1.6 }}
        >
          <TypeBox
            ref={typeBoxRef}
            phrase="start game"
            onComplete={handleStartGame}
            style={{ height: '430px', display: 'flex', alignItems: 'flex-start' }}
          />
        </div>
        
        <CopyableLink url={gameUrl} />
      </>
    );
  }

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
        style={{ height: '430px', display: 'flex', alignItems: 'flex-start' }}
      />
    </div>
  );
};

export type { GamePageTypeBoxProps };
