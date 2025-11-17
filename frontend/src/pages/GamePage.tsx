import { useParams } from "react-router-dom";
import { useEffect, useCallback, useState, useRef } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import { type DbConnection, type Game, PlayerProgress, Player } from "../../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
import { type TypeBoxRef } from "../components/TypeBox";
import { Header } from "../components/Header";
import { Countdown } from "../components/Countdown";
import { RaceResults } from "../components/RaceResults";
import { GamePageTypeBox } from "../components/GamePageTypeBox";
import { GameLobby } from "../components/GameLobby";
import { ActionBar } from "../components/ActionBar";
import { PlayerProgressList } from "../components/PlayerProgressList";

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
          <PlayerProgressList
            gameType={game.gameType}
            gamePlayerProgress={gamePlayerProgress}
            maxPlayers={maxPlayers}
            phraseLength={game.phrase.length}
            currentPlayerId={currentPlayerId}
            players={players}
            typeBoxRef={typeBoxRef}
          />


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
