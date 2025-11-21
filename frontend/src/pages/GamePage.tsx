import { useParams } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import {
  type DbConnection,
  type Game,
  PlayerProgress,
  Player,
  PlayerColor,
} from "../../module_bindings";
import type { ErrorContextInterface } from "spacetimedb/sdk";
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

  useEffect(() => {
    if (!conn || !gameId) return;

    const gameSubscription = conn
      .subscriptionBuilder()
      .onError((error: ErrorContextInterface) => {
        console.error("Error subscribing to game:", error);
      })
      .subscribe(`select * from game where Id = '${gameId}'`);

    const playerProgressSubscription = conn
      .subscriptionBuilder()
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
  const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>(
    "playerprogress"
  );
  const { rows: players } = useTable<DbConnection, Player>("player");

  const game = games.find((g) => g.id.toString() === gameId);
  const gamePlayerProgress = playerProgress.filter(
    (pp) => pp.gameId.toString() === gameId
  );

  useEffect(() => {
    if (!conn || !game || !gameId) return;

    if (game.gameType?.tag === "Private" && game.state?.tag === "Lobby") {
      const currentPlayerId = conn.identity;
      const hasProgress = gamePlayerProgress.some(
        (pp) => currentPlayerId && pp.playerId.isEqual(currentPlayerId)
      );

      if (!hasProgress) {
        conn.reducers.joinPrivateGame(gameId);
      }
    }
  }, [conn, game, gameId, gamePlayerProgress]);

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
    const player = players.filter((p) => p.id.isEqual(playerId))[0];
    return player?.color ?? PlayerColor.Amber;
  };

  const handleFinish = useCallback(() => {
    setHasFinished(true);
  }, []);

  if (!game) {
    return null;
  }

  const currentPlayerId = conn?.identity;
  const maxPlayers = game.gameType?.tag === "Practice" ? 1 : 3;
  const isInLobby = game.state?.tag === "Lobby";
  const isLobby = game.gameType?.tag === "Private" && isInLobby;
  const isCountdown = game.state?.tag === "Countdown";
  const isDisabled = isInLobby || isCountdown;

  const currentPlayerProgress = gamePlayerProgress.find(
    (pp) => currentPlayerId && pp.playerId.isEqual(currentPlayerId)
  );
  const initialProgress = currentPlayerProgress?.progressIndex ?? 0;
  const hasCompletedRace = currentPlayerProgress
    ? currentPlayerProgress.progressIndex >= game.phrase.length
    : false;

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />

      <Countdown />

      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="content-container w-full">
          <div className="mb-3 space-y-3">
            {Array.from({ length: maxPlayers }).map((_, index) => {
              const pp = gamePlayerProgress[index];
              const isCurrentPlayer =
                pp && currentPlayerId && pp.playerId.isEqual(currentPlayerId);

              if (!pp) {
                return (
                  <div className="box w-full rounded-lg px-8 py-6">
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
                <div className="box w-full rounded-lg px-8 py-6 relative">
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
                    placement={pp.placement}
                    isBot={pp.isBot}
                    isAnonymous={pp.isAnonymous}
                  />
                </div>
              );
            })}
          </div>

          {hasFinished || hasCompletedRace ? (
            (() => {
              const currentPP = gamePlayerProgress.find(
                (pp) => currentPlayerId && pp.playerId.isEqual(currentPlayerId)
              );
              if (!currentPP) return null;

              return (
                <>
                  <RaceResults
                    playerProgress={currentPP}
                    allPlayerProgress={gamePlayerProgress}
                    allPlayers={players}
                    raceStartTimestamp={game.racingStartedAt}
                    placement={currentPP.placement}
                  />
                  <ActionBar gameType={game.gameType?.tag as any} />
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
              disabled={isDisabled}
              initialProgress={initialProgress}
            />
          )}
        </div>
      </div>
    </div>
  );
};
