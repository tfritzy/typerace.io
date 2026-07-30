import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useParams } from "react-router-dom";
import type { PlayerProgress } from "../types/stdb";
import { getDisplayColorHex } from "../utils/colorMapping";
import { getLanguageFromSlug } from "../utils/modes";
import { getTranslations } from "../utils/translations";
import { useDatabase } from "../contexts/SpacetimeContext";
import {
  applyReplayEvent,
  buildReplayTimeline,
  getCorrectPrefixLength,
} from "../utils/replayTimeline";
import { GhostCursor } from "./GhostCursor";
import { PlayerAvatar } from "./PlayerAvatar";
import { TypeBox } from "./TypeBox";

type GameReplayProps = {
  phrase: string;
  attribution?: string;
  players: PlayerProgress[];
  raceStartTimestamp: bigint;
  initialPlayerId?: string;
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
  initialPlayerId,
  onExit,
}: GameReplayProps) {
  const lang = useParams().lang;
  const { conn } = useDatabase();
  const currentPlayerId = conn?.identity;
  const noSpacesInPhrase = getLanguageFromSlug(lang).hasNoSpaces;
  const translations = getTranslations();
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
  const [inputs, setInputs] = useState(() => createEmptyInputs(players));
  const [replayNumber, setReplayNumber] = useState(0);
  const inputsRef = useRef(inputs);
  const playersRef = useRef(players);
  const startedAtRef = useRef(performance.now());
  const processedEventsRef = useRef(new Set<string>());
  playersRef.current = players;

  useEffect(() => {
    const emptyInputs = createEmptyInputs(playersRef.current);
    inputsRef.current = emptyInputs;
    setInputs(emptyInputs);
    processedEventsRef.current.clear();
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
      let hasFutureEvents = false;

      for (const event of timeline) {
        const eventId = `${event.playerId}:${event.eventIndex}`;
        if (processedEventsRef.current.has(eventId)) continue;

        if (event.elapsedMs > elapsedMs) {
          hasFutureEvents = true;
          continue;
        }

        inputsRef.current[event.playerId] = applyReplayEvent(
          inputsRef.current[event.playerId] ?? "",
          phrase,
          event.eventType,
        );
        processedEventsRef.current.add(eventId);
        changed = true;
      }

      if (changed) setInputs({ ...inputsRef.current });

      if (hasFutureEvents) {
        frameId = requestAnimationFrame(playFrame);
      }
    };

    frameId = requestAnimationFrame(playFrame);
    return () => cancelAnimationFrame(frameId);
  }, [phrase, replayNumber, timeline]);

  const selectedInput = inputs[selectedPlayerId] ?? "";
  const selectedPlayer = players.find(
    (player) => player.playerId.toHexString() === selectedPlayerId,
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
        <div className="ml-auto flex flex-wrap justify-end gap-2">
          {players.map((player) => {
            const playerId = player.playerId.toHexString();
            const isSelected = playerId === selectedPlayerId;
            return (
              <button
                type="button"
                key={playerId}
                onClick={() => setSelectedPlayerId(playerId)}
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
        <TypeBox
          phrase={phrase}
          attribution={attribution}
          inputState="disabled"
          cursorState="visible"
          cursorColor={selectedPlayerColor}
          overrideInputValue={selectedInput}
          height="430px"
          noSpacesInPhrase={noSpacesInPhrase}
        />
      </div>

      {players
        .filter((player) => player.playerId.toHexString() !== selectedPlayerId)
        .map((player) => {
          const playerId = player.playerId.toHexString();
          const isCurrentPlayer = !!(
            currentPlayerId && player.playerId.isEqual(currentPlayerId)
          );
          return (
            <GhostCursor
              key={playerId}
              charIndex={getCorrectPrefixLength(
                inputs[playerId] ?? "",
                phrase,
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
