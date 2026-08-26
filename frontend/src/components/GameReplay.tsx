import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { PlayerProgress } from "../types/stdb";
import { getDisplayColorHex } from "../utils/colorMapping";
import { getTranslations } from "../utils/translations";
import { useDatabase } from "../contexts/SpacetimeContext";
import {
  applyReplayEvent,
  buildReplayTimeline,
} from "../utils/replayTimeline";
import {
  analyzeTypeBoxInput,
  getCompletedWordCount,
  getWordCount,
} from "../utils/typeBoxCore";
import {
  useRaceState,
  useRaceStateStore,
} from "../contexts/RaceStateContext";
import { GhostCursor } from "./GhostCursor";
import { PlayerAvatar } from "./PlayerAvatar";
import { TypeBox } from "./TypeBox";
import { AllowedErrorsRow } from "./AllowedErrorsRow";

type GameReplayProps = {
  phrase: string;
  attribution?: string;
  players: readonly PlayerProgress[];
  raceStartTimestamp: bigint;
  totalAllowedErrors: number;
  initialPlayerId?: string;
  onExit: () => void;
};

export function GameReplay({
  phrase,
  attribution,
  players: initialPlayers,
  raceStartTimestamp,
  totalAllowedErrors,
  initialPlayerId,
  onExit,
}: GameReplayProps) {
  const { conn } = useDatabase();
  const raceState = useRaceState();
  const raceStore = useRaceStateStore();
  const translations = getTranslations();
  const [players] = useState(() => [...initialPlayers]);
  const [liveInput] = useState(raceState.input);
  const timeline = useMemo(
    () => buildReplayTimeline(players, raceStartTimestamp),
    [players, raceStartTimestamp],
  );
  const defaultPlayerId = players.some(
    (player) => player.playerId.toHexString() === initialPlayerId,
  )
    ? initialPlayerId!
    : (players[0]?.playerId.toHexString() ?? "");
  const [selectedPlayerId, setSelectedPlayerId] = useState(defaultPlayerId);
  const selectedPlayerIdRef = useRef(selectedPlayerId);
  const inputsRef = useRef(new Map<string, string>());
  const [replayNumber, setReplayNumber] = useState(0);

  useEffect(() => {
    inputsRef.current = new Map(
      players.map((player) => [player.playerId.toHexString(), ""]),
    );
    raceStore.setPlayers(players, {
      input: "",
      getProgressIndex: () => 0,
    });

    const startedAt = performance.now();
    let nextEventIndex = 0;
    let frameId = 0;

    const playFrame = (now: number) => {
      const elapsedMs = now - startedAt;
      const changedPlayerIds = new Set<string>();
      let selectedInput: string | undefined;

      while (
        nextEventIndex < timeline.length &&
        timeline[nextEventIndex].elapsedMs <= elapsedMs
      ) {
        const event = timeline[nextEventIndex++];
        const input = applyReplayEvent(
          inputsRef.current.get(event.playerId) ?? "",
          phrase,
          event.eventType,
        );
        inputsRef.current.set(event.playerId, input);
        changedPlayerIds.add(event.playerId);
        if (event.playerId === selectedPlayerIdRef.current) {
          selectedInput = input;
        }
      }

      if (changedPlayerIds.size > 0) {
        const progress = new Map<string, number>();
        for (const playerId of changedPlayerIds) {
          progress.set(
            playerId,
            analyzeTypeBoxInput(
              phrase,
              inputsRef.current.get(playerId) ?? "",
              totalAllowedErrors,
            ).reportedProgress,
          );
        }
        raceStore.patch({ input: selectedInput, progress });
      }
      if (nextEventIndex < timeline.length) {
        frameId = requestAnimationFrame(playFrame);
      }
    };

    frameId = requestAnimationFrame(playFrame);
    return () => cancelAnimationFrame(frameId);
  }, [phrase, players, raceStore, replayNumber, timeline, totalAllowedErrors]);

  const selectPlayer = (playerId: string) => {
    selectedPlayerIdRef.current = playerId;
    setSelectedPlayerId(playerId);
    raceStore.setInput(inputsRef.current.get(playerId) ?? "");
  };

  const exitReplay = () => {
    raceStore.setPlayers(players, { input: liveInput });
    onExit();
  };

  const selectedPlayer = players.find(
    (player) => player.playerId.toHexString() === selectedPlayerId,
  );
  const currentPlayerId = conn?.identity;
  const isSelectedCurrentPlayer = !!(
    currentPlayerId && selectedPlayer?.playerId.isEqual(currentPlayerId)
  );
  const selectedPlayerColor = getDisplayColorHex(
    selectedPlayer?.playerColor?.tag ?? "",
    isSelectedCurrentPlayer,
  );
  const inputAnalysis = analyzeTypeBoxInput(
    phrase,
    raceState.input,
    totalAllowedErrors,
  );
  const completedWords = getCompletedWordCount(
    phrase,
    inputAnalysis.completedThrough,
  );
  const totalWords = getWordCount(phrase);

  return (
    <div className="w-full pb-4 animate-[fadeIn_150ms_ease-out]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={exitReplay}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          {translations.results}
        </button>
        <button
          type="button"
          onClick={() => setReplayNumber((value) => value + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCcw size={16} />
          {translations.replay}
        </button>
        <div className="ml-auto flex flex-wrap justify-end gap-2">
          {players.map((player) => {
            const playerId = player.playerId.toHexString();
            const isSelected = playerId === selectedPlayerId;
            return (
              <button
                type="button"
                key={playerId}
                onClick={() => selectPlayer(playerId)}
                className={`inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <PlayerAvatar
                  size={22}
                  identity={playerId}
                  playerColorTag={player.playerColor?.tag}
                  isBot={player.isBot}
                />
                {player.playerName}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-2xl leading-[1.6]">
        <AllowedErrorsRow
          total={totalAllowedErrors}
          remaining={Math.max(
            0,
            totalAllowedErrors - inputAnalysis.errorsUsed,
          )}
          showFixWarning={inputAnalysis.errorsToFix > 0}
          errorsToFix={inputAnalysis.errorsToFix}
          completedWords={completedWords}
          totalWords={totalWords}
        />
        <TypeBox
          phrase={phrase}
          attribution={attribution}
          inputState="disabled"
          cursorState="visible"
          cursorColor={selectedPlayerColor}
          overrideInputValue={raceState.input}
          totalAllowedErrors={totalAllowedErrors}
          height="430px"
        />
      </div>

      {raceState.players
        .filter(
          (player) =>
            player.playerId.toHexString() !== selectedPlayerId,
        )
        .map((player) => {
          const playerId = player.playerId.toHexString();
          const isCurrentPlayer = !!(
            currentPlayerId && player.playerId.isEqual(currentPlayerId)
          );
          return (
            <GhostCursor
              key={playerId}
              charIndex={player.progressIndex}
              color={getDisplayColorHex(
                player.playerColor?.tag,
                isCurrentPlayer,
              )}
            />
          );
        })}
    </div>
  );
}
