import { useParams } from "react-router-dom";
import { useEffect, useCallback, useState, useRef } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { type DbConnection, type Game, PlayerProgress, Player, PlayerColor } from "../../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { type TypeBoxRef } from "../components/TypeBox";
import { PlayerProgressBar } from "../components/PlayerProgressBar";
import { Header } from "../components/Header";
import { Countdown } from "../components/Countdown";
import { RaceResults } from "../components/RaceResults";
import { GamePageTypeBox } from "../components/GamePageTypeBox";
import { GameLobby } from "../components/GameLobby";
import { ActionBar } from "../components/ActionBar";

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
  const { rows: players } = useTable<DbConnection, Player>("player");

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
  
  const getPlayerColor = (playerId: any): PlayerColor => {
    if (!playerId) {
      return PlayerColor.Amber;
    }
    const player = players.filter(p => p.id.isEqual(playerId))[0];
    return player?.color ?? PlayerColor.Amber;
  };

  const handleFinish = useCallback(() => {
    setHasFinished(true);
  }, []);

  if (!game) {
    return <div>Game not found</div>;
  }

  const currentPlayerId = conn?.identity;
  const maxPlayers = game.gameType?.tag === "Practice" ? 1 : 3;
  const isInLobby = game.state?.tag === "Lobby";
  const isLobby = game.gameType?.tag === "Private" && isInLobby;

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
                  <div
                    className="box w-full rounded-lg px-8 py-6 cursor-pointer"
                    onClick={() => typeBoxRef.current?.focus()}
                  >
                    <PlayerProgressBar
                      key={`loading-${index}`}
                      name="Waiting for player..."
                      level={1}
                      progressIndex={0}
                      phraseLength={game.phrase.length}
                      identityHash={`loading-${index}`}
                      isCurrentPlayer={false}
                      isLoading={true}
                    />
                  </div>
                );
              }

              return (
                <div
                  className="box w-full rounded-lg px-8 py-6 cursor-pointer"
                  onClick={() => typeBoxRef.current?.focus()}
                >
                  <PlayerProgressBar
                    key={pp.id.toString()}
                    name={getPlayerName(pp)}
                    level={getPlayerLevel(pp)}
                    progressIndex={pp.progressIndex}
                    phraseLength={game.phrase.length}
                    identityHash={getIdentityHash(pp.playerId)}
                    isCurrentPlayer={isCurrentPlayer}
                    playerColor={getPlayerColor(pp.playerId)}
                    wpm={pp.wpm}
                  />
                </div>
              );
            })}
          </div>


          {hasFinished ? (
            (() => {
              const currentPP = gamePlayerProgress.find(pp => currentPlayerId && pp.playerId.isEqual(currentPlayerId));
              if (!currentPP) return null;

              return (
                <>
                  <RaceResults
                    playerProgress={currentPP}
                    allPlayerProgress={gamePlayerProgress}
                    phraseLength={game.phrase.length}
                    raceStartTimestamp={game.racingStartedAt}
                    placement={currentPP.placement}
                  />
                  <ActionBar 
                    gameType={game.gameType?.tag as any}
                  />
                </>
              );
            })()
          ) : isLobby ? (
            <GameLobby gameId={gameId!} conn={conn} />
          ) : (
            <GamePageTypeBox
              phrase={game.phrase}
              gameId={gameId!}
              conn={conn}
              onFinish={handleFinish}
            />
          )}

        </div>
      </div>
    </div>
  );
};
