import type { GameRecord, PersonalRecord } from "../types/stdb";
import {
  getGameModeLabel,
  getLanguageInfoFromMode,
  type WordCountBucket,
  WORD_COUNT_BUCKETS,
} from "./modes";

export const ALL_PROFILE_MODES = "all";

export type ProfileTimeFrame = "all" | "week" | "month" | "3months";

type LanguageRace = Pick<
  GameRecord,
  "accuracy" | "gameId" | "gameMode" | "id"
>;
type LengthRecord = Pick<
  PersonalRecord,
  "accuracy" | "gameId" | "gameMode" | "gameRecordId" | "phraseLength" | "wpm"
>;
type FilterableRace = Pick<GameRecord, "date" | "gameMode">;
type LanguageModeRace = Pick<GameRecord, "gameMode">;

export interface PersonalRecordSlot {
  wordCount: WordCountBucket;
  wpm: number | null;
  accuracy: number | null;
  gameId: string | null;
}

export interface ProfilePersonalRecordsData {
  language: string | null;
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

export function getMostPlayedLanguage(
  races: Iterable<LanguageModeRace>,
): string | null {
  const raceCounts = new Map<string, number>();

  for (const race of races) {
    const language = getLanguageInfoFromMode(race.gameMode.tag).language;
    raceCounts.set(language, (raceCounts.get(language) ?? 0) + 1);
  }

  let mostPlayedLanguage: string | null = null;
  let highestRaceCount = 0;
  for (const [language, raceCount] of raceCounts) {
    if (
      raceCount > highestRaceCount ||
      (
        raceCount === highestRaceCount &&
        (
          mostPlayedLanguage === null ||
          language.localeCompare(mostPlayedLanguage) < 0
        )
      )
    ) {
      mostPlayedLanguage = language;
      highestRaceCount = raceCount;
    }
  }

  return mostPlayedLanguage;
}

export function buildProfilePersonalRecords(
  personalRecords: readonly LengthRecord[],
  races: readonly LanguageRace[],
): ProfilePersonalRecordsData {
  const racesById = new Map(races.map((race) => [race.id, race]));
  const language = getMostPlayedLanguage(racesById.values());
  const result: ProfilePersonalRecordsData = {
    language,
    slots: emptyRecordSlots(),
  };
  if (!language) return result;

  for (const record of personalRecords) {
    if (record.phraseLength === undefined) continue;

    const recordLanguage = getLanguageInfoFromMode(
      record.gameMode.tag,
    ).language;
    if (recordLanguage !== language) continue;

    const slot = result.slots.find(
      ({ wordCount }) => wordCount === record.phraseLength,
    );

    if (!slot || (slot.wpm !== null && slot.wpm >= record.wpm)) continue;

    const race = racesById.get(record.gameRecordId);
    slot.wpm = record.wpm;
    slot.accuracy = record.accuracy > 0
      ? record.accuracy
      : race && race.accuracy > 0
        ? race.accuracy
        : null;
    slot.gameId = record.gameId || race?.gameId || null;
  }

  return result;
}

export function buildProfileModeOptions(
  records: readonly Pick<GameRecord, "gameMode">[],
): ProfileModeOption[] {
  const modes = new Set(records.map(({ gameMode }) => gameMode.tag));

  return Array.from(modes)
    .map((value) => ({ value, label: getGameModeLabel(value) }))
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

  return records.filter((record) => (
    (mode === ALL_PROFILE_MODES || record.gameMode.tag === mode)
    && (cutoff === null || record.date >= cutoff)
  ));
}
