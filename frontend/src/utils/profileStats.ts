import type { GameRecord, PersonalRecord } from "../types/stdb";
import {
  getContentTypeFromMode,
  getLanguageFromMode,
  WORD_COUNT_BUCKETS,
} from "./modes";

export const MIN_RACES_FOR_LANGUAGE_RECORDS = 10;
export const ALL_PROFILE_MODES = "all";

export type ProfileTimeFrame = "all" | "week" | "month" | "3months";

type LanguageRace = Pick<
  GameRecord,
  "accuracy" | "gameId" | "gameMode" | "id"
>;
type LengthRecord = Pick<
  PersonalRecord,
  "gameMode" | "gameRecordId" | "phraseLength" | "wpm"
>;
type FilterableRace = Pick<GameRecord, "date" | "gameMode" | "timeMs">;

export interface PersonalRecordSlot {
  wordCount: (typeof WORD_COUNT_BUCKETS)[number];
  wpm: number | null;
  accuracy: number | null;
  gameId: string | null;
}

export interface LanguagePersonalRecords {
  language: string;
  raceCount: number;
  slots: PersonalRecordSlot[];
}

interface ProfileModeOption {
  value: string;
  label: string;
}

const TIME_FRAME_DAYS: Record<Exclude<ProfileTimeFrame, "all">, number> = {
  week: 7,
  month: 30,
  "3months": 90,
};

function emptyRecordSlots(): PersonalRecordSlot[] {
  return WORD_COUNT_BUCKETS.map((wordCount) => ({
    wordCount,
    wpm: null,
    accuracy: null,
    gameId: null,
  }));
}

export function buildLanguagePersonalRecords(
  personalRecords: readonly LengthRecord[],
  races: readonly LanguageRace[],
  minimumRaces = MIN_RACES_FOR_LANGUAGE_RECORDS,
): LanguagePersonalRecords[] {
  const racesById = new Map(races.map((race) => [race.id, race]));
  const raceCounts = new Map<string, number>();

  for (const race of racesById.values()) {
    const language = getLanguageFromMode(race.gameMode.tag);
    raceCounts.set(language, (raceCounts.get(language) ?? 0) + 1);
  }

  const groups = new Map<string, LanguagePersonalRecords>();
  for (const [language, raceCount] of raceCounts) {
    if (raceCount < minimumRaces) continue;

    groups.set(language, {
      language,
      raceCount,
      slots: emptyRecordSlots(),
    });
  }

  for (const record of personalRecords) {
    if (record.phraseLength === undefined) continue;

    const language = getLanguageFromMode(record.gameMode.tag);
    const slot = groups
      .get(language)
      ?.slots.find(({ wordCount }) => wordCount === record.phraseLength);

    if (!slot || (slot.wpm !== null && slot.wpm >= record.wpm)) continue;

    const race = racesById.get(record.gameRecordId);
    slot.wpm = record.wpm;
    slot.accuracy = race && race.accuracy > 0 ? race.accuracy : null;
    slot.gameId = race?.gameId ?? null;
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.raceCount - a.raceCount || a.language.localeCompare(b.language),
  );
}

function getProfileModeLabel(mode: string): string {
  const contentType = getContentTypeFromMode(mode) === "Quotes"
    ? "quotes"
    : "words";
  return `${getLanguageFromMode(mode)} ${contentType}`;
}

export function buildProfileModeOptions(
  records: readonly Pick<GameRecord, "gameMode">[],
): ProfileModeOption[] {
  const modes = new Set(records.map(({ gameMode }) => gameMode.tag));

  return Array.from(modes)
    .map((value) => ({ value, label: getProfileModeLabel(value) }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function filterProfileGameRecords<T extends FilterableRace>(
  records: readonly T[],
  mode: string,
  timeFrame: ProfileTimeFrame,
  nowMs = Date.now(),
): T[] {
  const days = timeFrame === "all" ? null : TIME_FRAME_DAYS[timeFrame];
  const cutoff = days === null
    ? null
    : BigInt(nowMs - days * 24 * 60 * 60 * 1_000) * 1_000n;

  return records
    .filter((record) => (
      (mode === ALL_PROFILE_MODES || record.gameMode.tag === mode)
      && (cutoff === null || record.date >= cutoff)
    ))
    .sort((a, b) => (
      a.timeMs < b.timeMs ? -1 : a.timeMs > b.timeMs ? 1 : 0
    ));
}
