import { useParams } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import type { DbConnection, Game, PlayerProgress, Player } from "../../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { TypeBox } from "../components/TypeBox";
import { PlayerProgressBar } from "../components/PlayerProgressBar";
import { Header } from "../components/Header";
import { ChatBox } from "../components/ChatBox";

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const conn = useSpacetimeDB<DbConnection>();
  const [typeBoxFocused, setTypeBoxFocused] = useState(false);

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

      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="content-container w-full">
          <div className="mb-20 space-y-3">
            {gamePlayerProgress.map((pp) => {
              const isCurrentPlayer = currentPlayerId && pp.playerId.isEqual(currentPlayerId);
              return (
                <PlayerProgressBar
                  key={pp.id.toString()}
                  name={getPlayerName(pp.playerId)}
                  level={getPlayerLevel(pp.playerId)}
                  progress={pp.progressIndex}
                  phraseLength={game.phrase.length}
                  identityHash={getIdentityHash(pp.playerId)}
                  isCurrentPlayer={isCurrentPlayer}
                />
              );
            })}
          </div>

          <ChatBox focused={typeBoxFocused}>
            <div
              className="text-2xl font-mono" style={{ lineHeight: 1.6 }}
            >
              <TypeBox
                phrase={game.phrase}
                onProgress={handleProgress}
                onFocusChange={setTypeBoxFocused}
              />
            </div>
          </ChatBox>
        </div>

        <div className="min-h-[100px] mt-40" />
      </div>
    </div>
  );
};
