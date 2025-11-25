import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import { useSpacetimeDB, useTable } from "spacetimedb/react";
import {
  type DbConnection,
  type Game,
  PlayerProgress,
} from "../../module_bindings";
import { PlayerProgressBar } from "../components/PlayerProgressBar";
import { Header } from "../components/Header";
import { Countdown } from "../components/Countdown";
import { PlayerStatsRow } from "../components/PlayerStatsRow";
import { AllPlayersResults } from "../components/AllPlayersResults";
import { GamePageTypeBox } from "../components/GamePageTypeBox";
import { GameLobby } from "../components/GameLobby";
import { ActionBar } from "../components/ActionBar";

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const conn = useSpacetimeDB<DbConnection>();
  const [hasFinished, setHasFinished] = useState(false);


  const { rows: games } = useTable<DbConnection, Game>("game");
  const { rows: playerProgress } = useTable<DbConnection, PlayerProgress>(
    "playerprogress"
  );

  const game = games.find((g) => g.id.toString() === gameId);
  const gamePlayerProgress = playerProgress.filter(
    (pp) => pp.gameId.toString() === gameId
  );

  useEffect(() => {
    if (!conn || !game) return;

    const currentPlayerId = conn.identity;
    if (!currentPlayerId) return;

    const currentPlayerProgress = gamePlayerProgress.find(
      (pp) => pp.playerId.isEqual(currentPlayerId)
    );

    if (currentPlayerProgress && game.phrase) {
      const hasCompletedRace = currentPlayerProgress.progressIndex >= game.phrase.length;
      setHasFinished(hasCompletedRace);
    } else if (gamePlayerProgress.length > 0 && !currentPlayerProgress) {
      setHasFinished(true);
    } else {
      setHasFinished(false);
    }
  }, [conn, game, gamePlayerProgress]);

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

  useEffect(() => {
    if (!conn || !gameId) return;

    const currentPlayerId = conn.identity;
    if (!currentPlayerId) return;

    const rematchProgress = playerProgress.find(
      (pp) =>
        pp.playerId.isEqual(currentPlayerId) &&
        pp.joinCode === gameId &&
        pp.gameId.toString() !== gameId
    );

    if (rematchProgress) {
      navigate(`/game/${rematchProgress.gameId.toString()}`, { replace: true });
    }
  }, [conn, gameId, playerProgress, navigate]);

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
                if (game.gameType?.tag === "Private") {
                  return null;
                }
                return (
                  <div key={`loading-${index}`} className="box w-full rounded-lg px-8 py-6">
                    <PlayerProgressBar
                      name="Waiting for player..."
                      level={1}
                      progressIndex={0}
                      phraseLength={game.phrase.length}
                      identityHash={`loading-${index}`}
                      playerPublicId=""
                      isCurrentPlayer={false}
                      isLoading={true}
                    />
                  </div>
                );
              }

              return (
                <div key={pp.id.toString()} className="box w-full rounded-lg px-8 py-6 relative">
                  <PlayerProgressBar
                    name={getPlayerName(pp)}
                    level={getPlayerLevel(pp)}
                    progressIndex={pp.progressIndex}
                    phraseLength={game.phrase.length}
                    identityHash={getIdentityHash(pp.playerId)}
                    playerPublicId={pp.playerPublicId}
                    isCurrentPlayer={isCurrentPlayer}
                    playerColor={pp.playerColor}
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

              const isOwner = currentPlayerId && game.owner && currentPlayerId.isEqual(game.owner);
              const rematchDisabled = game.gameType?.tag === "Private" && !isOwner;

              return (
                <div className="w-full animate-slideUpFadeIn pb-4">
                  {currentPP && (
                    <PlayerStatsRow
                      playerProgress={currentPP}
                      raceStartTimestamp={game.racingStartedAt}
                      placement={currentPP.placement}
                    />
                  )}
                  <AllPlayersResults
                    allPlayerProgress={gamePlayerProgress}
                    raceStartTimestamp={game.racingStartedAt}
                    initialSelectedPlayerId={currentPP?.playerId.toHexString()}
                  />
                  {currentPP && (
                    <ActionBar
                      mode={game.gameMode}
                      gameType={game.gameType?.tag as any}
                      gameId={gameId}
                      rematchDisabled={rematchDisabled}
                      conn={conn}
                    />
                  )}
                </div>
              );
            })()
          ) : isLobby ? (
            <GameLobby
              gameId={gameId!}
              conn={conn}
              isOwner={currentPlayerId ? game.owner?.isEqual(currentPlayerId) ?? false : false}
            />
          ) : (
            <GamePageTypeBox
              key={gameId}
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
