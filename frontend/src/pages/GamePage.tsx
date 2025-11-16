import { useParams } from "react-router-dom";
import { useEffect, useCallback, useState, useRef } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { type DbConnection, type Game, PlayerProgress } from "../../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { TypeBox, type TypeBoxRef } from "../components/TypeBox";
import { PlayerProgressBar } from "../components/PlayerProgressBar";
import { Header } from "../components/Header";
import { ChatBox } from "../components/ChatBox";
import { Countdown } from "../components/Countdown";
import { RaceResults } from "../components/RaceResults";

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const conn = useSpacetimeDB<DbConnection>();
  const [hasFinished, setHasFinished] = useState(false);
  const typeBoxRef = useRef<TypeBoxRef>(null);

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

    return () => {
      gameSubscription.unsubscribe();
      playerProgressSubscription.unsubscribe();
    };
  }, [conn, gameId]);

  const { rows: games } = useTable<DbConnection, Game>("game");
  const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>("playerprogress");

  const game = games.find(g => g.id.toString() === gameId);
  const gamePlayerProgress = playerProgress.filter(pp => pp.gameId.toString() === gameId);

  const getPlayerName = (pp: PlayerProgress) => {
    return pp.playerName;
  };

  const getPlayerLevel = (pp: PlayerProgress) => {
    return pp.playerLevel;
  };

  const getIdentityHash = (playerId: any) => {
    if (!playerId) {
      return "bot";
    }
    return playerId.toHexString();
  };

  const handleProgress = useCallback((correctCharCount: number, eventType: "Correct" | "Incorrect" | "Backspace") => {
    if (!conn || !gameId) return;

    const eventTypeEnum = { tag: eventType };
    conn.reducers.updateProgress(gameId, correctCharCount, eventTypeEnum);
  }, [conn, gameId]);

  const handleComplete = useCallback(() => {
    setHasFinished(true);
  }, []);

  if (!game) {
    return <div>Game not found</div>;
  }

  const currentPlayerId = conn?.identity;
  const maxPlayers = game.gameType?.tag === "Practice" ? 1 : 3;

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <Countdown />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="content-container w-full">
          <div className="mb-4 space-y-3">
            {Array.from({ length: maxPlayers }).map((_, index) => {
              const pp = gamePlayerProgress[index];
              const isCurrentPlayer = pp && currentPlayerId && pp.playerId.isEqual(currentPlayerId);

              if (!pp) {
                return (
                  <ChatBox onFocus={() => typeBoxRef.current?.focus()}>
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

              return (
                <ChatBox onFocus={() => typeBoxRef.current?.focus()}>
                  <PlayerProgressBar
                    key={pp.id.toString()}
                    name={getPlayerName(pp)}
                    level={getPlayerLevel(pp)}
                    progress={pp.progressIndex}
                    phraseLength={game.phrase.length}
                    identityHash={getIdentityHash(pp.playerId)}
                    isCurrentPlayer={isCurrentPlayer}
                  />
                </ChatBox>
              );
            })}
          </div>


          {hasFinished ? (
            (() => {
              const currentPP = gamePlayerProgress.find(pp => currentPlayerId && pp.playerId.isEqual(currentPlayerId));
              if (!currentPP) return null;

              return (
                <RaceResults
                  playerProgress={currentPP}
                  raceStartTimestamp={game.racingStartedAt}
                  placement={currentPP.placement}
                />
              );
            })()
          ) : (
            <div
              className="text-2xl font-mono" style={{ lineHeight: 1.6 }}
            >
              <TypeBox
                ref={typeBoxRef}
                phrase={game.phrase}
                onProgress={handleProgress}
                onComplete={handleComplete}
                style={{ height: '430px', display: 'flex', alignItems: 'flex-start' }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
