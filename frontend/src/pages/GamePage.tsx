import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useCallback, useState, useMemo } from "react";
import { type Game, type PlayerProgress } from "../types/stdb";
import { PlayerProgressBar } from "../components/PlayerProgressBar";
import { Header } from "../components/Header";
import { Countdown } from "../components/Countdown";
import { PlayerStatsRow } from "../components/PlayerStatsRow";
import { AllPlayersResults } from "../components/AllPlayersResults";
import { GamePageTypeBox } from "../components/GamePageTypeBox";
import { GameLobby } from "../components/GameLobby";
import { ActionBar } from "../components/ActionBar";
import { useDatabase } from "../contexts/SpacetimeContext";
import { getMaxPlayerCount } from "../utils/modes";
import { GhostCursor } from "../components/GhostCursor";
import { getPlayerColorHex } from "../utils/colorMapping";
import { getTranslations } from "../utils/translations";

type UiGameType = "Public" | "Private" | "Practice";

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const conn = useDatabase();
  const [hasFinished, setHasFinished] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [gamePlayerProgress, setGamePlayerProgress] = useState<
    PlayerProgress[]
  >([]);

  useEffect(() => {
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

    const handleProgressInsert = (_ctx: any, pp: PlayerProgress) => {
      if (pp.gameId.toString() === gameId) {
        setGamePlayerProgress((prev) => {
          if (prev.some((p) => p.id === pp.id)) {
            return prev;
          }
          return [...prev, pp];
        });
      }

      if (conn.identity && pp.playerId.isEqual(conn.identity)) {
        if (pp.joinCode === gameId && pp.gameId.toString() !== gameId) {
          navigate(`/game/${pp.gameId.toString()}`, { replace: true });
        }
      }
    };

    const handleProgressUpdate = (
      _ctx: any,
      _oldPP: PlayerProgress,
      newPP: PlayerProgress,
    ) => {
      if (newPP.gameId.toString() === gameId) {
        setGamePlayerProgress((prev) => {
          const existingIndex = prev.findIndex((pp) => pp.id === newPP.id);
          if (existingIndex === -1) {
            return [...prev, newPP];
          }

          const next = [...prev];
          next[existingIndex] = newPP;
          return next;
        });
      }
    };

    const handleProgressDelete = (_ctx: any, pp: PlayerProgress) => {
      if (pp.gameId.toString() === gameId) {
        setGamePlayerProgress((prev) => prev.filter((p) => p.id !== pp.id));
        if (conn.identity && pp.playerId.isEqual(conn.identity)) {
          setTimeout(() => {
            const stillExists = Array.from(conn.db.playerprogress.iter()).some(
              (p) =>
                p.gameId.toString() === gameId &&
                p.playerId.isEqual(conn.identity!),
            );
            if (!stillExists) {
              navigate("/", { replace: true });
            }
          }, 200);
        }
      }
    };

    conn.db.game.onInsert(handleGameInsert);
    conn.db.game.onUpdate(handleGameUpdate);
    conn.db.playerprogress.onInsert(handleProgressInsert);
    conn.db.playerprogress.onUpdate(handleProgressUpdate);
    conn.db.playerprogress.onDelete(handleProgressDelete);

    const progressQuery = `SELECT * FROM playerprogress WHERE GameId = '${gameId}'`;
    const gameQuery = `SELECT * FROM game WHERE Id = '${gameId}'`;
    const subscriptionQueries = [gameQuery, progressQuery];

    if (conn.identity) {
      subscriptionQueries.push(
        `SELECT * FROM playerprogress WHERE PlayerId = '${conn.identity}'`,
      );
    }

    const pageSubscription = conn
      .subscriptionBuilder()
      .onApplied(() => {
        const currentGame = conn.db.game.id.find(gameId);
        if (currentGame) {
          setGame(currentGame);
        }

        const currentGameProgress = Array.from(
          conn.db.playerprogress.iter(),
        ).filter((pp) => pp.gameId.toString() === gameId);
        setGamePlayerProgress(currentGameProgress);
      })
      .subscribe(subscriptionQueries);

    return () => {
      conn.db.playerprogress.removeOnInsert(handleProgressInsert);
      conn.db.playerprogress.removeOnUpdate(handleProgressUpdate);
      conn.db.playerprogress.removeOnDelete(handleProgressDelete);
      conn.db.game.removeOnInsert(handleGameInsert);
      conn.db.game.removeOnUpdate(handleGameUpdate);
      pageSubscription.unsubscribe();
    };
  }, [conn, gameId, navigate]);

  useEffect(() => {
    if (!conn || !game) return;

    const currentPlayerId = conn.identity;
    if (!currentPlayerId) return;

    const currentPlayerProgress = gamePlayerProgress.find((pp) =>
      pp.playerId.isEqual(currentPlayerId),
    );

    if (currentPlayerProgress && game.phrase) {
      if (currentPlayerProgress.progressIndex >= game.phrase.length) {
        setHasFinished(true);
      }
    }

    if (gamePlayerProgress.length > 0 && gamePlayerProgress.every(pp => pp.progressIndex >= game.phrase.length)) {
      setHasFinished(true);
    }
  }, [conn, game, gamePlayerProgress]);

  useEffect(() => {
    if (game?.state?.tag === "Archived") {
      setHasFinished(true);
    }
  }, [game]);

  useEffect(() => {
    if (!conn || !game || !gameId) return;

    if (game.gameType?.tag === "Private" && game.state?.tag === "Lobby") {
      const currentPlayerId = conn.identity;
      const hasProgress = gamePlayerProgress.some(
        (pp) => currentPlayerId && pp.playerId.isEqual(currentPlayerId),
      );

      if (!hasProgress) {
        conn.reducers.joinPrivateGame({ gameId });
      }
    }
  }, [conn, game, gameId, gamePlayerProgress]);

  const handleFinish = useCallback(() => {
    setHasFinished(true);
  }, []);

  const handleKickPlayer = useCallback(
    (targetPlayerId: PlayerProgress["playerId"]) => {
      if (!conn || !gameId) return;
      conn.reducers.kickPlayer({ gameId, targetPlayerId });
    },
    [conn, gameId],
  );

  const currentPlayerId = conn?.identity;

  const otherPlayerProgress = useMemo(() => {
    if (!currentPlayerId || !game?.phrase) return [];
    return gamePlayerProgress.filter(
      (pp) =>
        !pp.playerId.isEqual(currentPlayerId) &&
        pp.progressIndex < game.phrase.length,
    );
  }, [gamePlayerProgress, currentPlayerId, game?.phrase]);

  useEffect(() => {
    if (game) return;

    const timeout = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [game, navigate]);

  if (!game) {
    return null;
  }

  const gameTypeTag = game.gameType?.tag ?? "Public";
  const actionBarGameType: UiGameType =
    gameTypeTag === "Private" || gameTypeTag === "Practice" ? gameTypeTag : "Public";
  const maxPlayers =
    gameTypeTag === "Private"
      ? gamePlayerProgress.length
      : getMaxPlayerCount(gameTypeTag);
  const totalSlots = Math.max(maxPlayers, gamePlayerProgress.length);
  const isInLobby = game.state?.tag === "Lobby";
  const isLobby = game.gameType?.tag === "Private" && isInLobby;
  const isPrivateGameOwner =
    game.gameType?.tag === "Private" &&
    currentPlayerId &&
    game.owner?.isEqual(currentPlayerId);
  const isCountdown = game.state?.tag === "Countdown";
  const t = getTranslations();

  const currentPlayerProgress = gamePlayerProgress.find(
    (pp) => currentPlayerId && pp.playerId.isEqual(currentPlayerId),
  );
  const initialProgress = currentPlayerProgress?.progressIndex ?? 0;
  const hasCompletedRace = currentPlayerProgress
    ? currentPlayerProgress.progressIndex >= game.phrase.length
    : false;
  const isMemberOfRace = !!currentPlayerProgress;
  const isDisabled = isInLobby || isCountdown || !currentPlayerProgress;

  return (
    <div className="relative h-full flex flex-col">
      <Header />

      <Countdown />

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4">
        <div className="content-container w-full my-auto">
          <div
            className={`mb-3 grid gap-3 ${totalSlots > 3 ? "sm:grid-cols-2" : ""}`}
          >
            {Array.from({ length: totalSlots }).map((_, index) => {
              const pp = gamePlayerProgress[index];
              const isCurrentPlayer =
                pp && currentPlayerId && pp.playerId.isEqual(currentPlayerId);

              if (!pp) {
                if (game.gameType?.tag === "Private") {
                  return null;
                }
                return (
                  <div key={`loading-${index}`}>
                    <PlayerProgressBar
                      name={t.waitingForPlayer}
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
                <div key={pp.id.toString()}>
                  <PlayerProgressBar
                    key={pp.id.toString()}
                    name={pp.playerName}
                    level={pp.playerLevel}
                    progressIndex={pp.progressIndex}
                    phraseLength={game.phrase.length}
                    identityHash={pp.playerId.toHexString()}
                    playerPublicId={pp.playerPublicId}
                    isCurrentPlayer={isCurrentPlayer}
                    wpm={pp.wpm}
                    placement={pp.placement}
                    isBot={pp.isBot}
                    isAnonymous={pp.isAnonymous}
                    onKick={
                      isPrivateGameOwner && !isCurrentPlayer
                        ? () => handleKickPlayer(pp.playerId)
                        : undefined
                    }
                    playerColorTag={
                      isCurrentPlayer ? undefined : pp.playerColor?.tag
                    }
                  />
                </div>
              );
            })}
          </div>

          {hasFinished || hasCompletedRace ? (
            (() => {
              const currentPP = gamePlayerProgress.find(
                (pp) => currentPlayerId && pp.playerId.isEqual(currentPlayerId),
              );

              const isOwner =
                currentPlayerId &&
                game.owner &&
                currentPlayerId.isEqual(game.owner);
              const rematchDisabled =
                game.gameType?.tag === "Private" && !isOwner;

              return (
                <div
                  key="stats-section"
                  className="w-full animate-slideUpFadeIn pb-4"
                >
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
                      gameType={actionBarGameType}
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
              isOwner={
                currentPlayerId
                  ? (game.owner?.isEqual(currentPlayerId) ?? false)
                  : false
              }
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
              hideCursor={!isMemberOfRace}
              borderState={
                isCountdown
                  ? "countdown"
                  : game.state?.tag === "Racing"
                    ? "active"
                    : undefined
              }
            />
          )}
        </div>
      </div>
      {!(hasFinished || hasCompletedRace) &&
        !isLobby &&
        otherPlayerProgress.map((pp) => (
          <GhostCursor
            key={pp.id.toString()}
            charIndex={pp.progressIndex}
            color={getPlayerColorHex(pp.playerColor?.tag ?? "")}
            lerp={0.15}
          />
        ))}
    </div>
  );
};
