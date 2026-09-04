import type { PlayerProgress } from "../types/stdb";
import { formatShareTime, getOrdinalPlacement } from "./formatters";
import { Language, getLanguageInfoFromMode } from "./modes";
import { getPhraseLength } from "./phrase";
import {
  CharacterEventType,
  getAccuracy,
  getFinalWpm,
  getRaceTime,
} from "./wpmCalculator";

const EVENT_SIZE_BYTES = 3;
const ENGLAND_FLAG =
  "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}";

type RaceResultShareOptions = {
  playerProgress: PlayerProgress;
  raceStartTimestamp: bigint;
  phrase: string;
  modeTag: string;
  gameUrl: string;
};

function getCharacterWordIndexes(phrase: string): Array<number | undefined> {
  const wordIndexes = new Array<number | undefined>(phrase.length);
  let wordIndex = -1;
  let isInsideWord = false;

  for (let index = 0; index < phrase.length; index++) {
    const isWhitespace = /\s/u.test(phrase[index]);
    if (isWhitespace) {
      isInsideWord = false;
      continue;
    }

    if (!isInsideWord) {
      wordIndex++;
      isInsideWord = true;
    }
    wordIndexes[index] = wordIndex;
  }

  return wordIndexes;
}

function getErrorBlock(errorCount: number): string {
  if (errorCount === 0) return "🟩";
  if (errorCount === 1) return "🟨";
  if (errorCount === 2) return "🟧";
  return "🟥";
}

export function getWordAccuracyBlocks(
  phrase: string,
  characterHistory: Uint8Array,
): string {
  const wordCount = getPhraseLength(phrase);
  const wordIndexes = getCharacterWordIndexes(phrase);
  const errorsByWord = Array<number>(wordCount).fill(0);
  let cursorIndex = 0;

  for (
    let offset = 0;
    offset + EVENT_SIZE_BYTES <= characterHistory.length;
    offset += EVENT_SIZE_BYTES
  ) {
    const eventType = characterHistory[offset + 2];
    const characterIndex =
      eventType === CharacterEventType.Backspace
        ? Math.max(0, cursorIndex - 1)
        : cursorIndex;
    const wordIndex = wordIndexes[characterIndex];

    if (
      wordIndex !== undefined &&
      eventType === CharacterEventType.Incorrect
    ) {
      errorsByWord[wordIndex]++;
    }

    if (eventType === CharacterEventType.Backspace) {
      cursorIndex = Math.max(0, cursorIndex - 1);
    } else {
      cursorIndex = Math.min(phrase.length, cursorIndex + 1);
    }
  }

  const blocks = errorsByWord.map(getErrorBlock);
  const rows: string[] = [];

  for (let index = 0; index < blocks.length; index += 8) {
    rows.push(blocks.slice(index, index + 8).join(" "));
  }

  return rows.join("\n");
}

export function formatRaceResultForClipboard({
  playerProgress,
  raceStartTimestamp,
  phrase,
  modeTag,
  gameUrl,
}: RaceResultShareOptions): string {
  const finalWpm = Math.round(getFinalWpm(playerProgress));
  const accuracy = Math.round(
    getAccuracy(playerProgress.characterHistory, raceStartTimestamp),
  );
  const raceTime = formatShareTime(getRaceTime(playerProgress));
  const wordCount = getPhraseLength(phrase);
  const language = getLanguageInfoFromMode(modeTag);
  const flag = language.language === Language.English
    ? ENGLAND_FLAG
    : language.flag;
  const blocks = getWordAccuracyBlocks(phrase, playerProgress.characterHistory);

  return [
    `🏆 ${getOrdinalPlacement(playerProgress.placement)} place`,
    `⚡ ${finalWpm} wpm`,
    `🏹 ${accuracy}% accuracy`,
    `⏱️ ${raceTime}`,
    `${flag} ${wordCount} ${wordCount === 1 ? "word" : "words"}`,
    "",
    blocks,
    "",
    gameUrl,
  ].join("\n");
}
