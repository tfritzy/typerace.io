import { useCallback, useState } from "react";
import type { DbConnection } from "../../module_bindings";

type GameLobbyProps = {
  gameId: string;
  conn: DbConnection | null;
};

export const GameLobby = ({ gameId, conn }: GameLobbyProps) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleStartGame = useCallback(() => {
    if (!conn || !gameId) return;
    conn.reducers.startPrivateGame(gameId);
  }, [conn, gameId]);

  const gameUrl = `${window.location.origin}/game/${gameId}`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(gameUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [gameUrl]);

  return (
    <div
      className="box w-full rounded-lg px-8 py-6 min-h-[430px] flex flex-col justify-center gap-6"
    >
      <div className="text-center">
        <h2 className="text-[28px] font-bold mb-3 text-white">
          Waiting for players...
        </h2>
        <p className="text-base text-white/60 leading-relaxed">
          Share this link with friends to invite them to your race
        </p>
      </div>

      <div
        onClick={handleCopyLink}
        className="rounded-lg p-5 cursor-pointer transition-all duration-200 relative"
        style={{
          backgroundColor: 'var(--color-box-bg)',
          border: linkCopied ? '1px solid var(--color-accent)' : '1px solid var(--color-box-border)'
        }}
        onMouseEnter={(e) => {
          if (!linkCopied) {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          if (!linkCopied) {
            e.currentTarget.style.borderColor = 'var(--color-box-border)';
          }
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div
              className="text-[11px] uppercase tracking-[1.2px] mb-2 font-semibold transition-colors duration-200"
              style={{ color: linkCopied ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)' }}
            >
              {linkCopied ? 'Copied!' : 'Click to Copy Link'}
            </div>
            <div className="font-mono text-sm text-white overflow-hidden text-ellipsis whitespace-nowrap">
              {gameUrl}
            </div>
          </div>
          <div
            className="text-2xl flex-shrink-0 transition-all duration-200"
            style={{ color: linkCopied ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.6)' }}
          >
            {linkCopied ? "✓" : "📋"}
          </div>
        </div>
      </div>

      <button
        onClick={handleStartGame}
        className="bg-transparent text-white border rounded-lg p-4 text-lg font-semibold cursor-pointer transition-all duration-200"
        style={{ borderColor: 'var(--color-box-border)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-box-border)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Start Game
      </button>
    </div>
  );
};

export type { GameLobbyProps };
