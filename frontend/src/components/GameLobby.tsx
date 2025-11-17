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
      className="box w-full rounded-lg px-8 py-6"
      style={{
        minHeight: '430px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '24px'
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          marginBottom: '12px',
          color: 'var(--color-white)'
        }}>
          Waiting for players...
        </h2>
        <p style={{
          fontSize: '16px',
          color: 'rgba(255, 255, 255, 0.6)',
          lineHeight: '1.5'
        }}>
          Share this link with friends to invite them to your race
        </p>
      </div>

      <div
        onClick={handleCopyLink}
        style={{
          backgroundColor: 'var(--color-box-bg)',
          border: linkCopied ? '1px solid var(--color-accent)' : '1px solid var(--color-box-border)',
          borderRadius: '8px',
          padding: '20px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ flex: '1', minWidth: 0 }}>
            <div style={{
              fontSize: '11px',
              color: linkCopied ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              marginBottom: '8px',
              fontWeight: '600',
              transition: 'color 0.2s ease'
            }}>
              {linkCopied ? 'Copied!' : 'Click to Copy Link'}
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: 'var(--color-white)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {gameUrl}
            </div>
          </div>
          <div style={{
            fontSize: '24px',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            color: linkCopied ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.6)'
          }}>
            {linkCopied ? "✓" : "📋"}
          </div>
        </div>
      </div>

      <button
        onClick={handleStartGame}
        style={{
          backgroundColor: 'transparent',
          color: 'var(--color-white)',
          border: '1px solid var(--color-box-border)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
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
