import { useCallback, useRef, useState } from "react";
import { TypeBox, type TypeBoxRef } from "./TypeBox";
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
  const [linkCopied, setLinkCopied] = useState(false);

  const handleStartGame = useCallback(() => {
    if (!conn || !gameId) return;
    conn.reducers.startPrivateGame(gameId);
  }, [conn, gameId]);

  const handleProgress = useCallback((correctCharCount: number, eventType: "Correct" | "Incorrect" | "Backspace") => {
    if (!conn || !gameId) return;

    const eventTypeEnum = { tag: eventType };
    conn.reducers.updateProgress(gameId, correctCharCount, eventTypeEnum);
  }, [conn, gameId]);

  const handleComplete = useCallback(() => {
    onFinish();
  }, [onFinish]);

  const gameUrl = `${window.location.origin}/game/${gameId}`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(gameUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [gameUrl]);

  if (isLobby) {
    return (
      <div
        className="box w-full rounded-lg px-8 py-6"
        style={{ minHeight: '430px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem' }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-white)' }}>
            Waiting for players...
          </h2>
          <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Share the link below with friends. Click start when everyone's here!
          </p>
        </div>

        <div 
          className="rounded-lg px-6 py-4 cursor-pointer transition-all"
          onClick={handleCopyLink}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm mb-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Share this link:
              </div>
              <div className="font-mono text-sm break-all" style={{ color: 'var(--color-white)' }}>
                {gameUrl}
              </div>
            </div>
            <div className="ml-4 text-2xl">
              {linkCopied ? "✓" : "📋"}
            </div>
          </div>
          {linkCopied && (
            <div className="text-sm mt-2" style={{ color: '#10b981' }}>
              Link copied to clipboard!
            </div>
          )}
        </div>

        <button
          onClick={handleStartGame}
          className="rounded-lg px-6 py-4 font-semibold text-lg transition-all"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: '#000000',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 191, 36, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Start Game
        </button>
      </div>
    );
  }

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
