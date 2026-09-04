import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import type { PlayerProgress } from "../types/stdb";
import { getDisplayColorHex } from "../utils/colorMapping";
import { getTranslations } from "../utils/translations";
import { useDatabase } from "../contexts/SpacetimeContext";
import {
  applyReplayEvent,
  buildReplayTimeline,
  getReplayProgress,
} from "../utils/replayTimeline";
import { GhostCursor } from "./GhostCursor";
import { TypeBox } from "./TypeBox";

type GameReplayProps = {
  phrase: string;
  attribution?: string;
  players: PlayerProgress[];
  raceStartTimestamp: bigint;
  allowedErrors: number;
  viewedPlayerId: string;
  onExit: () => void;
};

function createEmptyInputs(players: PlayerProgress[]): Record<string, string> {
  return Object.fromEntries(
    players.map((player) => [player.playerId.toHexString(), ""]),
  );
}

export function GameReplay({
  phrase,
  attribution,
  players,
  raceStartTimestamp,
  allowedErrors,
  viewedPlayerId,
  onExit,
}: GameReplayProps) {
  const { conn } = useDatabase();
  const currentPlayerId = conn?.identity;
  const translations = getTranslations();
  const timeline = useMemo(
    () => buildReplayTimeline(players, raceStartTimestamp),
    [players, raceStartTimestamp],
  );
  const [inputs, setInputs] = useState(() => createEmptyInputs(players));
  const [replayNumber, setReplayNumber] = useState(0);
  const inputsRef = useRef(inputs);
  const playersRef = useRef(players);
  const startedAtRef = useRef(performance.now());
  const nextEventIndexRef = useRef(0);
  playersRef.current = players;

  useEffect(() => {
    const emptyInputs = createEmptyInputs(playersRef.current);
    inputsRef.current = emptyInputs;
    setInputs(emptyInputs);
    nextEventIndexRef.current = 0;
    startedAtRef.current = performance.now();
  }, [phrase, raceStartTimestamp, replayNumber]);

  useEffect(() => {
    const nextInputs = { ...inputsRef.current };
    let changed = false;

    for (const player of players) {
      const playerId = player.playerId.toHexString();
      if (!(playerId in nextInputs)) {
        nextInputs[playerId] = "";
        changed = true;
      }
    }

    if (changed) {
      inputsRef.current = nextInputs;
      setInputs(nextInputs);
    }
  }, [players]);

  useEffect(() => {
    if (timeline.length === 0) return;

    let frameId = 0;

    const playFrame = (now: number) => {
      const elapsedMs = now - startedAtRef.current;
      let changed = false;
      let nextEventIndex = nextEventIndexRef.current;

      while (
        nextEventIndex < timeline.length &&
        timeline[nextEventIndex].elapsedMs <= elapsedMs
      ) {
        const event = timeline[nextEventIndex];

        inputsRef.current[event.playerId] = applyReplayEvent(
          inputsRef.current[event.playerId] ?? "",
          phrase,
          event.eventType,
        );
        nextEventIndex++;
        changed = true;
      }
      nextEventIndexRef.current = nextEventIndex;

      if (changed) setInputs({ ...inputsRef.current });

      if (nextEventIndex < timeline.length) {
        frameId = requestAnimationFrame(playFrame);
      }
    };

    frameId = requestAnimationFrame(playFrame);
    return () => cancelAnimationFrame(frameId);
  }, [phrase, replayNumber, timeline]);

  const selectedInput = inputs[viewedPlayerId] ?? "";
  const selectedPlayer = players.find(
    (player) => player.playerId.toHexString() === viewedPlayerId,
  );
  const isSelectedCurrentPlayer = !!(
    currentPlayerId && selectedPlayer?.playerId.isEqual(currentPlayerId)
  );
  const selectedPlayerColor = getDisplayColorHex(
    selectedPlayer?.playerColor?.tag ?? "",
    isSelectedCurrentPlayer,
  );

  return (
    <div className="w-full pb-4 animate-[fadeIn_150ms_ease-out]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onExit}
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
      </div>

      <div className="text-2xl leading-[1.6]">
        <TypeBox
          phrase={phrase}
          attribution={attribution}
          inputState="disabled"
          cursorState="visible"
          cursorColor={selectedPlayerColor}
          overrideInputValue={selectedInput}
          totalAllowedErrors={allowedErrors}
          height="430px"
        />
      </div>

      {players
        .filter((player) => player.playerId.toHexString() !== viewedPlayerId)
        .map((player) => {
          const playerId = player.playerId.toHexString();
          const isCurrentPlayer = !!(
            currentPlayerId && player.playerId.isEqual(currentPlayerId)
          );
          return (
            <GhostCursor
              key={playerId}
              charIndex={getReplayProgress(
                inputs[playerId] ?? "",
                phrase,
                allowedErrors,
              )}
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
