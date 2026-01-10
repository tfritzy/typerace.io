import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useCallback, useState } from "react";
import {
  type Game,
  type PlayerProgress,
} from "../types/stdb";
import { PlayerProgressBar } from "../components/PlayerProgressBar";
import { Header } from "../components/Header";
import { Countdown } from "../components/Countdown";
import { PlayerStatsRow } from "../components/PlayerStatsRow";
import { AllPlayersResults } from "../components/AllPlayersResults";
import { GamePageTypeBox } from "../components/GamePageTypeBox";
import { GameLobby } from "../components/GameLobby";
import { ActionBar } from "../components/ActionBar";
import { useDatabase } from "../contexts/SpacetimeContext";

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const conn = useDatabase();
  const [hasFinished, setHasFinished] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [gamePlayerProgress, setGamePlayerProgress] = useState<PlayerProgress[]>([]);

  useEffect(() => {
    // Reset data when game switches to a new one via play again.
    setGame(null);
    setGamePlayerProgress([]);
    setHasFinished(false);
  }, [gameId]);

  useEffect(() => {
    if (!conn || !gameId) return;

    const handleGameInsert = (_ctx: any, g: Game) => {
      if (g.id.toString() === gameId) {
        setGame(g);
      }
    };

    const handleGameUpdate = (_ctx: any, _oldGame: Game, newGame: Game) => {
      if (newGame.id.toString() === gameId) {
        setGame(newGame);
      }
    };

    conn.db.game.onInsert(handleGameInsert);
    conn.db.game.onUpdate(handleGameUpdate);

    const gameSubscription = conn.subscriptionBuilder()
      .onApplied(() => {
        const g = conn.db.game.id.find(gameId);
        if (g) setGame(g);
      })
      .subscribe([`SELECT * FROM game WHERE Id = '${gameId}'`]);

    return () => {
      conn.db.game.removeOnInsert(handleGameInsert);
      conn.db.game.removeOnUpdate(handleGameUpdate);
      gameSubscription.unsubscribe();
    };
  }, [conn, gameId]);

  useEffect(() => {
    if (!conn || !gameId || !conn.identity) return;

    const handleProgressInsert = (_ctx: any, pp: PlayerProgress) => {
      if (pp.gameId.toString() === gameId) {
        setGamePlayerProgress(prev => {
          let found = false;
          for (let i = 0; i < prev.length; i++) {
            if (prev[i].id === pp.id) {
              found = true;
              break;
            }
          }
          if (found) {
            return prev;
          }
          const newArr = new Array(prev.length + 1);
          for (let i = 0; i < prev.length; i++) {
            newArr[i] = prev[i];
          }
          newArr[prev.length] = pp;
          return newArr;
        });
      }

      if (conn?.identity && pp.playerId.isEqual(conn.identity)) {
        if (pp.joinCode === gameId && pp.gameId.toString() !== gameId) {
          navigate(`/game/${pp.gameId.toString()}`, { replace: true });
        }
      }
    };

    const handleProgressUpdate = (_ctx: any, _oldPP: PlayerProgress, newPP: PlayerProgress) => {
      if (newPP.gameId.toString() === gameId) {
        setGamePlayerProgress(prev => {
          const newArr = new Array(prev.length);
          for (let i = 0; i < prev.length; i++) {
            newArr[i] = prev[i].id === newPP.id ? newPP : prev[i];
          }
          return newArr;
        });
      }
    };

    conn.db.playerprogress.onInsert(handleProgressInsert);
    conn.db.playerprogress.onUpdate(handleProgressUpdate);

    const progressSubscription = conn.subscriptionBuilder()
      .onApplied(() => {
        const filtered = conn.db.playerprogress.gameId.filter(gameId);
        const currentGameProgress: PlayerProgress[] = [];
        for (const pp of filtered) {
          currentGameProgress.push(pp);
        }
        setGamePlayerProgress(currentGameProgress);
      })
      .subscribe([
        `SELECT * FROM playerprogress WHERE GameId = '${gameId}' OR PlayerId = '${conn.identity}'`
      ]);

    return () => {
      conn.db.playerprogress.removeOnInsert(handleProgressInsert);
      conn.db.playerprogress.removeOnUpdate(handleProgressUpdate);
      progressSubscription.unsubscribe();
    };
  }, [conn, gameId, navigate]);

  useEffect(() => {
    if (!conn || !game) return;

    const currentPlayerId = conn.identity;
    if (!currentPlayerId) return;

    let currentPlayerProgress: PlayerProgress | undefined;
    for (let i = 0; i < gamePlayerProgress.length; i++) {
      if (gamePlayerProgress[i].playerId.isEqual(currentPlayerId)) {
        currentPlayerProgress = gamePlayerProgress[i];
        break;
      }
    }

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
      let hasProgress = false;
      for (let i = 0; i < gamePlayerProgress.length; i++) {
        if (currentPlayerId && gamePlayerProgress[i].playerId.isEqual(currentPlayerId)) {
          hasProgress = true;
          break;
        }
      }

      if (!hasProgress) {
        conn.reducers.joinPrivateGame({ gameId });
      }
    }
  }, [conn, game, gameId, gamePlayerProgress]);

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

  let currentPlayerProgress: PlayerProgress | undefined;
  for (let i = 0; i < gamePlayerProgress.length; i++) {
    if (currentPlayerId && gamePlayerProgress[i].playerId.isEqual(currentPlayerId)) {
      currentPlayerProgress = gamePlayerProgress[i];
      break;
    }
  }
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
                    key={pp.id.toString()}
                    name={pp.playerName}
                    level={pp.playerLevel}
                    progressIndex={pp.progressIndex}
                    phraseLength={game.phrase.length}
                    identityHash={pp.playerId.toHexString()}
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
              let currentPP: PlayerProgress | undefined;
              for (let i = 0; i < gamePlayerProgress.length; i++) {
                if (currentPlayerId && gamePlayerProgress[i].playerId.isEqual(currentPlayerId)) {
                  currentPP = gamePlayerProgress[i];
                  break;
                }
              }

              const isOwner = currentPlayerId && game.owner && currentPlayerId.isEqual(game.owner);
              const rematchDisabled = game.gameType?.tag === "Private" && !isOwner;

              return (
                <div key="stats-section" className="w-full animate-slideUpFadeIn pb-4">
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
                      conn={conn || undefined}
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
              attribution={game.attribution}
              gameId={gameId!}
              conn={conn}
              onFinish={handleFinish}
              disabled={isDisabled}
              initialProgress={initialProgress}
              isAnonymous={currentPlayerProgress?.isAnonymous ?? true}
            />
          )}
        </div>
      </div>
    </div>
  );
};
