import { useParams } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { type DbConnection, type Game, PlayerProgress, type Player } from "../../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { TypeBox } from "../components/TypeBox";
import { InlinePlayerProgress } from "../components/InlinePlayerProgress";
import { PlayerProgressBar } from "../components/PlayerProgressBar";
import { Header } from "../components/Header";
import { ChatBox } from "../components/ChatBox";
import { Countdown } from "../components/Countdown";

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const conn = useSpacetimeDB<DbConnection>();
  const [showCountdown, setShowCountdown] = useState(false);
  const [previousGameState, setPreviousGameState] = useState<string | null>(null);

  useEffect(() => {
    if (!conn || !gameId) return;

    const gameSubscription = conn.subscriptionBuilder()
      .onError((error: ErrorContextInterface) => {
        console.error("Error subscribing to game:", error);
      })
      .subscribe(`select * from game where Id = '${gameId}'`);

    const playerProgressSubscription = conn.subscriptionBuilder()
      .onError((error: ErrorContextInterface) => {
        console.error("Error subscribing to playerprogress:", error);
      })
      .subscribe(`select * from playerprogress where GameId = '${gameId}'`);

    const playerSubscription = conn.subscriptionBuilder()
      .onError((error: ErrorContextInterface) => {
        console.error("Error subscribing to player:", error);
      })
      .subscribe(`select * from player`);

    return () => {
      gameSubscription.unsubscribe();
      playerProgressSubscription.unsubscribe();
      playerSubscription.unsubscribe();
    };
  }, [conn, gameId]);

  const { rows: games } = useTable<DbConnection, Game>("game");
  const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>("playerprogress");
  const { rows: players } = useTable<DbConnection, Player>("player");

  const game = games.find(g => g.id.toString() === gameId);
  const gamePlayerProgress = playerProgress.filter(pp => pp.gameId.toString() === gameId);

  useEffect(() => {
    if (!game) return;

    const currentState = game.state.tag;

    if (previousGameState === "Lobby" && currentState === "Countdown") {
      setShowCountdown(true);
    }

    setPreviousGameState(currentState);
  }, [game, previousGameState]);

  const getPlayerName = (playerId: any) => {
    if (!playerId || playerId.toHexString() === "0000000000000000000000000000000000000000000000000000000000000000") {
      return "Bot";
    }
    const player = players.find(p => p.id.isEqual(playerId));
    return player?.name || "Unknown";
  };

  const getPlayerLevel = (playerId: any) => {
    if (!playerId || playerId.toHexString() === "0000000000000000000000000000000000000000000000000000000000000000") {
      return 1;
    }
    const player = players.find(p => p.id.isEqual(playerId));
    return player?.level || 1;
  };

  const getIdentityHash = (playerId: any) => {
    if (!playerId) {
      return "bot";
    }
    return playerId.toHexString();
  };

  const handleProgress = useCallback((correctCharCount: number) => {
    if (!conn || !gameId) return;

    conn.reducers.updateProgress(gameId, correctCharCount);
  }, [conn, gameId]);

  if (!game) {
    return <div>Game not found</div>;
  }

  const currentPlayerId = conn?.identity;

  return (
    <div className="relative min-h-screen">
      <Header />

      {showCountdown && (
        <Countdown onComplete={() => setShowCountdown(false)} />
      )}

      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="content-container w-full">
          <div className="mb-20 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => {
              const pp = gamePlayerProgress[index];
              const isCurrentPlayer = pp && currentPlayerId && pp.playerId.isEqual(currentPlayerId);

              if (!pp) {
                return (
                  <ChatBox>
                    <PlayerProgressBar
                      key={`loading-${index}`}
                      name="Waiting for player..."
                      level={1}
                      progress={0}
                      phraseLength={game.phrase.length}
                      identityHash={`loading-${index}`}
                      isCurrentPlayer={false}
                      isLoading={true}
                    />
                  </ChatBox>
                );
              }

              if (isCurrentPlayer) {
                return null;
              }

              return (
                <ChatBox>
                  <PlayerProgressBar
                    key={pp.id.toString()}
                    name={getPlayerName(pp.playerId)}
                    level={getPlayerLevel(pp.playerId)}
                    progress={pp.progressIndex}
                    phraseLength={game.phrase.length}
                    identityHash={getIdentityHash(pp.playerId)}
                    isCurrentPlayer={false}
                  />
                </ChatBox>
              );
            })}
          </div>

          <ChatBox>
            {(() => {
              const currentPP = gamePlayerProgress.find(pp => currentPlayerId && pp.playerId.isEqual(currentPlayerId));
              return currentPP ? (
                <PlayerProgressBar
                  name={getPlayerName(currentPP.playerId)}
                  level={getPlayerLevel(currentPP.playerId)}
                  progress={currentPP.progressIndex}
                  phraseLength={game.phrase.length}
                  identityHash={getIdentityHash(currentPP.playerId)}
                  isCurrentPlayer
                />
              ) : null;
            })()}
            <div
              className="text-xl font-mono pt-10" style={{ lineHeight: 1.6 }}
            >
              <TypeBox
                phrase={game.phrase}
                onProgress={handleProgress}
              />
            </div>
          </ChatBox>
        </div>

        <div className="min-h-[100px] mt-100" />
      </div>
    </div>
  );
};
