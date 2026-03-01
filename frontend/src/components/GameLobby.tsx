import { useCallback, useState } from "react";
import { Check, Clipboard } from "lucide-react";
import type { DbConnection } from "../../module_bindings";

type GameLobbyProps = {
  gameId: string;
  conn: DbConnection | null;
  isOwner: boolean;
};

export const GameLobby = ({ gameId, conn, isOwner }: GameLobbyProps) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleStartGame = useCallback(() => {
    if (!conn || !gameId || !isOwner) return;
    (conn.reducers as any).StartPrivateGame({ gameId });
  }, [conn, gameId, isOwner]);

  const gameUrl = `${window.location.origin}/game/${gameId}`;

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(gameUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [gameUrl]);

  return (
    <div className="box w-full rounded-lg px-8 py-12 min-h-[430px] flex flex-col justify-center gap-6">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-white/90">
          {isOwner ? "Waiting for players..." : "Waiting for owner to start..."}
        </h2>
        <p className="text-sm text-white/50">
          Share this link with friends to invite them to this race
        </p>
      </div>

      <div
        onClick={handleCopyLink}
        className="rounded-lg p-4 cursor-pointer transition-all duration-200 relative"
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
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] uppercase tracking-wider mb-1.5 font-semibold transition-colors duration-200"
              style={{ color: linkCopied ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.4)' }}
            >
              {linkCopied ? 'Copied!' : 'Game Link'}
            </div>
            <div className="font-mono text-sm text-white/80 overflow-hidden text-ellipsis whitespace-nowrap">
              {gameUrl}
            </div>
          </div>
          <div
            className="shrink-0 transition-all duration-200"
            style={{ color: linkCopied ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)' }}
          >
            {linkCopied ? <Check size={20} /> : <Clipboard size={20} />}
          </div>
        </div>
      </div>

      {isOwner && (
        <button
          onClick={handleStartGame}
          className="bg-transparent text-white border rounded-lg px-6 py-3 text-base font-semibold cursor-pointer transition-all duration-200"
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
      )}
    </div>
  );
};

export type { GameLobbyProps };
