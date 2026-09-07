import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  useEffect,
  useCallback,
  useState,
  useMemo,
  useRef,
  startTransition,
  type ReactNode,
} from "react";
import {
  type Game,
  type PersonalRecord,
  type PlayerProgress,
} from "../types/stdb";
import { PlayerProgressBar } from "../components/PlayerProgressBar";
import { RaceStatsRow } from "../components/RaceStatsRow";
import { RaceResultsChart } from "../components/RaceResultsChart";
import { RaceDetailsRow } from "../components/RaceDetailsRow";
import { GamePageTypeBox } from "../components/GamePageTypeBox";
import { GameLobby } from "../components/GameLobby";
import { ActionBar } from "../components/ActionBar";
import { useDatabase } from "../contexts/SpacetimeContext";
import { getMaxPlayerCount } from "../utils/modes";
import { GhostCursor } from "../components/GhostCursor";
import { getPlayerColorHex } from "../utils/colorMapping";
import { EmptyPlayerProgressBars } from "../components/EmptyPlayerProgressBars";
import { GameSkeleton } from "../components/GameSkeleton";
import { getPreferredGameType } from "../utils/gamePreferences";
import { WinnerConfetti } from "../components/WinnerConfetti";
import { GameReplay } from "../components/GameReplay";
import { reconstructInputFromHistory } from "../utils/replayTimeline";
import { formatRaceResultForClipboard } from "../utils/raceResultShare";

type UiGameType = "Public" | "Private" | "Practice";

const GAME_DATA_WAIT_TIMEOUT_MS = 10_000;

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { conn, status: databaseStatus, latencyDeltaMs } = useDatabase();
  const [hasFinished, setHasFinished] = useState(false);
  const [isWatchingReplay, setIsWatchingReplay] = useState(false);
  const [countdownComplete, setCountdownComplete] = useState(false);
  const [raceStartsAt, setRaceStartsAt] = useState<number | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [gamePlayerProgress, setGamePlayerProgress] = useState<
    PlayerProgress[]
  >([]);
  const [locallyViewedPlayerId, setLocallyViewedPlayerId] = useState<
    string | null
  >(null);
  const [hasNewPersonalRecord, setHasNewPersonalRecord] = useState(false);
  const latencyDeltaRef = useRef(latencyDeltaMs);
  const initProgress = useRef({
    gameId: "",
    playerProgressId: "",
    input: "",
  });

  useEffect(() => {
    latencyDeltaRef.current = latencyDeltaMs;
  }, [latencyDeltaMs]);

  useEffect(() => {
    setGame(null);
    setGamePlayerProgress([]);
    setLocallyViewedPlayerId(null);
    setHasNewPersonalRecord(false);
    setHasFinished(false);
    setIsWatchingReplay(false);
    setCountdownComplete(false);
    setRaceStartsAt(null);
  }, [gameId]);

  useEffect(() => {
    if (!conn || !gameId) return;
    setHasNewPersonalRecord(false);
    let progressDeleteRedirect: ReturnType<typeof setTimeout> | undefined;
    let countdownTimer: ReturnType<typeof setTimeout> | undefined;

    const syncCountdown = (current: Game, previous?: Game) => {
      const enteredCountdown =
        current.state?.tag === "Countdown" &&
        previous?.state?.tag !== "Countdown";

      if (enteredCountdown) {
        clearTimeout(countdownTimer);
        setCountdownComplete(false);
        const oneWayLatencyMs = (latencyDeltaRef.current ?? 0) / 2;
        const remainingMs = Math.max(
          0,
          Number(current.countdownDurationMs) - oneWayLatencyMs,
        );
        setRaceStartsAt(performance.now() + remainingMs);
        countdownTimer = setTimeout(
          () => setCountdownComplete(true),
          remainingMs,
        );
      } else if (current.state?.tag === "Racing") {
        clearTimeout(countdownTimer);
        setCountdownComplete(true);
      } else if (current.state?.tag !== "Countdown") {
        clearTimeout(countdownTimer);
        setCountdownComplete(false);
        setRaceStartsAt(null);
      }
    };

    const handleGameInsert = (_ctx: any, g: Game) => {
      if (g.id.toString() === gameId) {
        setGame(g);
        syncCountdown(g);
      }
    };

    const handleGameUpdate = (_ctx: any, _oldGame: Game, newGame: Game) => {
      if (newGame.id.toString() === gameId) {
        setGame(newGame);
        syncCountdown(newGame, _oldGame);
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
          clearTimeout(progressDeleteRedirect);
          progressDeleteRedirect = setTimeout(() => {
            const stillExists = Array.from(conn.db.playerprogress.iter()).some(
              (p) =>
                p.gameId.toString() === gameId &&
                p.playerId.isEqual(conn.identity!),
            );
            if (!stillExists) {
              navigate("/", { replace: true });
            }
          }, GAME_DATA_WAIT_TIMEOUT_MS);
        }
      }
    };

    const isCurrentGamePersonalRecord = (record: PersonalRecord) =>
      !!conn.identity &&
      record.playerId.isEqual(conn.identity) &&
      record.gameId === gameId;

    const syncCurrentGamePersonalRecord = () => {
      setHasNewPersonalRecord(
        Array.from(conn.db.personalrecord.iter()).some(
          isCurrentGamePersonalRecord,
        ),
      );
    };

    const handlePersonalRecordInsert = (
      _ctx: any,
      record: PersonalRecord,
    ) => {
      if (isCurrentGamePersonalRecord(record)) {
        setHasNewPersonalRecord(true);
      }
    };

    conn.db.game.onInsert(handleGameInsert);
    conn.db.game.onUpdate(handleGameUpdate);
    conn.db.playerprogress.onInsert(handleProgressInsert);
    conn.db.playerprogress.onUpdate(handleProgressUpdate);
    conn.db.playerprogress.onDelete(handleProgressDelete);
    conn.db.personalrecord.onInsert(handlePersonalRecordInsert);

    const progressQuery = `SELECT * FROM playerprogress WHERE GameId = '${gameId}'`;
    const gameQuery = `SELECT * FROM game WHERE Id = '${gameId}'`;
    const subscriptionQueries = [gameQuery, progressQuery];

    if (conn.identity) {
      subscriptionQueries.push(
        `SELECT * FROM playerprogress WHERE PlayerId = '${conn.identity}'`,
        `SELECT * FROM personalrecord WHERE PlayerId = '${conn.identity}' AND GameId = '${gameId}'`,
      );
    }

    const pageSubscription = conn
      .subscriptionBuilder()
      .onApplied(() => {
        const currentGame = conn.db.game.id.find(gameId);
        if (currentGame) {
          setGame(currentGame);
          syncCountdown(currentGame);
        }

        const currentGameProgress = Array.from(
          conn.db.playerprogress.iter(),
        ).filter((pp) => pp.gameId.toString() === gameId);
        setGamePlayerProgress(
          currentGameProgress.sort(
            (left, right) => Number(left.createdAt - right.createdAt),
          ),
        );
        syncCurrentGamePersonalRecord();
      })
      .subscribe(subscriptionQueries);

    return () => {
      conn.db.playerprogress.removeOnInsert(handleProgressInsert);
      conn.db.playerprogress.removeOnUpdate(handleProgressUpdate);
      conn.db.playerprogress.removeOnDelete(handleProgressDelete);
      conn.db.personalrecord.removeOnInsert(handlePersonalRecordInsert);
      conn.db.game.removeOnInsert(handleGameInsert);
      conn.db.game.removeOnUpdate(handleGameUpdate);
      clearTimeout(progressDeleteRedirect);
      clearTimeout(countdownTimer);
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

    if (
      gamePlayerProgress.length > 0 &&
      gamePlayerProgress.every((pp) => pp.progressIndex >= game.phrase.length)
    ) {
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
    startTransition(() => setHasFinished(true));
  }, []);

  const handleWatchReplay = useCallback(() => setIsWatchingReplay(true), []);
  const handleExitReplay = useCallback(() => setIsWatchingReplay(false), []);
  const handleViewPlayer = useCallback(
    (playerId: string) => setLocallyViewedPlayerId(playerId),
    [],
  );

  const handleKickPlayer = useCallback(
    (targetPlayerId: PlayerProgress["playerId"]) => {
      if (!conn || !gameId) return;
      conn.reducers.kickPlayer({ gameId, targetPlayerId });
    },
    [conn, gameId],
  );

  const currentPlayerId = conn?.identity;
  const currentPlayerProgress = gamePlayerProgress.find(
    (pp) => currentPlayerId && pp.playerId.isEqual(currentPlayerId),
  );
  const hasCompletedRace = currentPlayerProgress
    ? currentPlayerProgress.progressIndex >= (game?.phrase.length ?? Infinity)
    : false;
  const isRaceFinished = hasFinished || hasCompletedRace;

  const otherPlayerProgress = useMemo(() => {
    if (!currentPlayerId || !game?.phrase) return [];
    return gamePlayerProgress.filter(
      (pp) =>
        !pp.playerId.isEqual(currentPlayerId) &&
        pp.progressIndex < game.phrase.length,
    );
  }, [gamePlayerProgress, currentPlayerId, game?.phrase]);

  useEffect(() => {
    if (game || databaseStatus !== "connected") return;

    const timeout = setTimeout(() => {
      navigate("/", { replace: true });
    }, GAME_DATA_WAIT_TIMEOUT_MS);

    return () => clearTimeout(timeout);
  }, [databaseStatus, game, navigate]);

  const getCopyResultsText = useCallback(() => {
    if (!currentPlayerProgress || !game) return "";

    return formatRaceResultForClipboard({
      playerProgress: currentPlayerProgress,
      raceStartTimestamp: game.racingStartedAt,
      phrase: game.phrase,
      modeTag: game.gameMode.tag,
      gameUrl: `${window.location.origin}${window.location.pathname}?i=${gamePlayerProgress.indexOf(currentPlayerProgress)}`,
    });
  }, [currentPlayerProgress, game, gamePlayerProgress]);

  if (!game) {
    return (
      <GameSkeleton
        playerCount={getPreferredGameType() === "Practice" ? 1 : 3}
      />
    );
  }

  const gameTypeTag = game.gameType?.tag ?? "Public";
  const actionBarGameType: UiGameType =
    gameTypeTag === "Private" || gameTypeTag === "Practice"
      ? gameTypeTag
      : "Public";
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

  const viewedPlayerProgress =
    gamePlayerProgress.find(
      (pp) => pp.playerId.toHexString() === locallyViewedPlayerId,
    ) ??
    gamePlayerProgress[Number(searchParams.get("i") ?? NaN)] ??
    currentPlayerProgress ??
    gamePlayerProgress[0];
  if (initProgress.current.gameId !== gameId) {
    initProgress.current.gameId = gameId ?? "";
    initProgress.current.playerProgressId = "";
    initProgress.current.input = "";
  }
  if (
    currentPlayerProgress &&
    initProgress.current.playerProgressId !== currentPlayerProgress.id
  ) {
    initProgress.current.playerProgressId = currentPlayerProgress.id;
    initProgress.current.input = reconstructInputFromHistory(
      game.phrase,
      currentPlayerProgress.characterHistory,
      currentPlayerProgress.progressIndex,
    );
  }
  const initialInput = initProgress.current.input;
  const hasWonRace =
    currentPlayerProgress?.placement === 1 && (hasFinished || hasCompletedRace);
  const isMemberOfRace = !!currentPlayerProgress;
  const isDisabled =
    isInLobby || (isCountdown && !countdownComplete) || !currentPlayerProgress;
  const isOwner =
    currentPlayerId && game.owner && currentPlayerId.isEqual(game.owner);
  const rematchDisabled = game.gameType?.tag === "Private" && !isOwner;

  const progressBars: ReactNode[] = [];
  for (let index = 0; index < totalSlots; index++) {
    const pp = gamePlayerProgress[index];
    const isCurrentPlayer =
      pp && currentPlayerId && pp.playerId.isEqual(currentPlayerId);

    if (!pp) {
      if (game.gameType?.tag === "Private") {
        progressBars.push(null);
        continue;
      }
      progressBars.push(
        <EmptyPlayerProgressBars key={`loading-${index}`} count={1} />,
      );
      continue;
    }

    progressBars.push(
      <div key={pp.id.toString()}>
        <PlayerProgressBar
          name={pp.playerName}
          level={pp.playerLevel}
          progressIndex={pp.progressIndex}
          phraseLength={game.phrase.length}
          identityHash={pp.playerId.toHexString()}
          playerPublicId={pp.playerPublicId}
          isEmphasized={
            isRaceFinished
              ? pp.id === viewedPlayerProgress?.id
              : Boolean(isCurrentPlayer)
          }
          wpm={pp.wpm}
          placement={pp.placement}
          isBot={pp.isBot}
          isAnonymous={pp.isAnonymous}
          onKick={
            isLobby && isPrivateGameOwner && !isCurrentPlayer
              ? () => handleKickPlayer(pp.playerId)
              : undefined
          }
          onClick={isRaceFinished ? handleViewPlayer : undefined}
          playerColorTag={isCurrentPlayer ? undefined : pp.playerColor?.tag}
        />
      </div>,
    );
  }

  let gameContent;

  if (isRaceFinished) {
    if (isWatchingReplay) {
      gameContent = (
        <GameReplay
          phrase={game.phrase}
          attribution={game.attribution}
          players={gamePlayerProgress}
          raceStartTimestamp={game.racingStartedAt}
          allowedErrors={game.allowedErrors}
          viewedPlayerId={
            viewedPlayerProgress?.playerId.toHexString() ?? ""
          }
          onExit={handleExitReplay}
        />
      );
    } else {
      gameContent = (
        <div key="stats-section" className="w-full animate-slideUpFadeIn pb-4">
          <RaceDetailsRow
            gameMode={game.gameMode}
            phrase={game.phrase}
            attribution={game.attribution}
            isPersonalRecord={hasNewPersonalRecord}
          />
          {viewedPlayerProgress && (
            <>
              <RaceStatsRow
                playerProgress={viewedPlayerProgress}
                raceStartTimestamp={game.racingStartedAt}
                isFinished={
                  viewedPlayerProgress.progressIndex >= game.phrase.length
                }
              />
              <div className="mb-3 rounded-lg border border-border bg-card p-3">
                <RaceResultsChart
                  playerProgress={viewedPlayerProgress}
                  raceStartTimestamp={game.racingStartedAt}
                  isCurrentPlayer={
                    viewedPlayerProgress === currentPlayerProgress
                  }
                />
              </div>
            </>
          )}
          <ActionBar
            mode={game.gameMode}
            gameType={actionBarGameType}
            gameId={gameId}
            rematchDisabled={rematchDisabled}
            conn={conn || undefined}
            isParticipant={isMemberOfRace}
            onWatchReplay={handleWatchReplay}
            getCopyResultsText={
              currentPlayerProgress ? getCopyResultsText : undefined
            }
          />
        </div>
      );
    }
  } else if (isLobby) {
    gameContent = (
      <GameLobby
        gameId={gameId!}
        conn={conn}
        isOwner={
          currentPlayerId
            ? (game.owner?.isEqual(currentPlayerId) ?? false)
            : false
        }
      />
    );
  } else {
    gameContent = (
      <GamePageTypeBox
        key={`${gameId}:${initProgress.current.playerProgressId}`}
        phrase={game.phrase}
        attribution={game.attribution}
        gameId={gameId!}
        conn={conn}
        onFinish={handleFinish}
        inputState={isDisabled ? "disabled-dimmed" : "enabled"}
        initialInput={initialInput}
        totalAllowedErrors={game.allowedErrors}
        isParticipant={isMemberOfRace}
        cursorState={isMemberOfRace ? "auto" : "hidden"}
        raceStartsAt={raceStartsAt}
        countdownComplete={countdownComplete}
      />
    );
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4">
        <div className="content-container relative w-full my-auto">
          <WinnerConfetti key={gameId} active={hasWonRace} />
          <div
            className={`mb-3 grid gap-3 ${totalSlots > 3 ? "sm:grid-cols-2" : ""}`}
          >
            {progressBars}
          </div>
          {isLobby ? (
            gameContent
          ) : (
            <div className="h-[760px] sm:h-[668px] lg:h-[620px]">
              {gameContent}
            </div>
          )}
        </div>
      </div>
      {!isRaceFinished &&
        !isLobby &&
        otherPlayerProgress.map((pp) => (
          <GhostCursor
            key={pp.id.toString()}
            charIndex={pp.progressIndex}
            color={getPlayerColorHex(pp.playerColor?.tag ?? "")}
          />
        ))}
    </div>
  );
};
