import { PlayerProgress } from "../stdb";

const CHARS_PER_WORD = 5;
const EVENT_SIZE_BYTES = 3;

export enum CharacterEventType {
  Correct = 0,
  Incorrect = 1,
  Backspace = 2,
}

export interface CharacterEvent {
  timestamp_s: number;
  eventType: { tag: "Correct" | "Incorrect" | "Backspace" };
}

export function decodeCharacterHistory(
  compressedHistory: Uint8Array,
  raceStartTimestamp: bigint,
): CharacterEvent[] {
  const events: CharacterEvent[] = [];

  for (
    let i = 0;
    i + EVENT_SIZE_BYTES <= compressedHistory.length;
    i += EVENT_SIZE_BYTES
  ) {
    const deciseconds = compressedHistory[i] | (compressedHistory[i + 1] << 8);
    const eventType = compressedHistory[i + 2];

    const elapsedSeconds = deciseconds / 10;
    const timestamp_s = Number(raceStartTimestamp) / 1_000_000 + elapsedSeconds;

    let eventTag: "Correct" | "Incorrect" | "Backspace";
    switch (eventType) {
      case CharacterEventType.Correct:
        eventTag = "Correct";
        break;
      case CharacterEventType.Incorrect:
        eventTag = "Incorrect";
        break;
      case CharacterEventType.Backspace:
        eventTag = "Backspace";
        break;
      default:
        console.warn(
          `Unknown event type ${eventType} at index ${i}, treating as Correct`,
        );
        eventTag = "Correct";
    }

    events.push({
      timestamp_s,
      eventType: { tag: eventTag },
    });
  }

  return events;
}

export function getWpm(charCount: number, timeSeconds: number): number {
  if (timeSeconds <= 0) {
    return 0;
  }

  return charCount / CHARS_PER_WORD / (timeSeconds / 60.0);
}

export function getFinalWpm(playerProgress: PlayerProgress): number {
  if (playerProgress.time === 0n || playerProgress.placement === 0) {
    return 0;
  }

  const timeSeconds = Number(playerProgress.time) / 1_000_000.0;
  const charCount = playerProgress.progressIndex;

  return getWpm(charCount, timeSeconds);
}

export function getRaceTime(playerProgress: PlayerProgress): number {
  if (playerProgress.time === 0n) {
    return 0;
  }

  return Number(playerProgress.time) / 1_000_000.0;
}

export function getAccuracy(
  compressedHistory: Uint8Array,
  raceStartTimestamp: bigint,
): number {
  const events = decodeCharacterHistory(compressedHistory, raceStartTimestamp);

  if (!events || events.length === 0) {
    return 0;
  }

  let correctChars = 0;
  let totalKeystrokes = 0;

  for (const evt of events) {
    if (evt.eventType.tag === "Correct") {
      correctChars++;
      totalKeystrokes++;
    } else if (
      evt.eventType.tag === "Incorrect" ||
      evt.eventType.tag === "Backspace"
    ) {
      totalKeystrokes++;
    }
  }

  if (totalKeystrokes === 0) {
    return 0;
  }

  return (correctChars / totalKeystrokes) * 100;
}

export function getErrorCountsBySecond(
  compressedHistory: Uint8Array,
  raceStartTimestamp: bigint,
): number[] {
  const events = decodeCharacterHistory(compressedHistory, raceStartTimestamp);

  if (!events || events.length === 0) {
    return [];
  }

  const errorCountBySecond: number[] = [];

  for (const evt of events) {
    if (evt.eventType.tag !== "Incorrect") {
      continue;
    }

    const elapsedMicros = evt.timestamp_s - raceStartTimestamp;
    const second = Number(elapsedMicros / 1_000_000n);

    if (second < 0) {
      continue;
    }

    while (errorCountBySecond.length <= second) {
      errorCountBySecond.push(0);
    }

    errorCountBySecond[second]++;
  }

  return errorCountBySecond;
}

export function getWpmPerKeystroke(
  events: CharacterEvent[],
  raceStartTimestamp: bigint,
): number[][] {
  const wpms = [];
  const stack = [];
  let correctChars = 0;
  for (let evt of events) {
    if (evt.eventType.tag === "Correct") {
      if (stack.length == 0 || stack[stack.length - 1]) {
        stack.push(true);
        correctChars += 1;
      }
    } else if (evt.eventType.tag === "Incorrect") {
      stack.push(false);
    } else {
      stack.pop();
      if (correctChars > stack.length) {
        correctChars = stack.length;
      }
    }

    const time = Math.max(
      evt.timestamp_s - Number(raceStartTimestamp) / 1_000_000,
      0,
    );
    const wpm = getWpm(correctChars, time);
    wpms.push([time, wpm]);
  }

  return wpms;
}

export function getWpmByBucket(
  compressedHistory: CharacterEvent[],
  raceStartTimestamp: bigint,
  numBuckets: number,
): number[] {
  const wpmPerKeystroke = getWpmPerKeystroke(
    compressedHistory,
    raceStartTimestamp,
  );
  const finishTime = wpmPerKeystroke[wpmPerKeystroke.length - 1][0];
  const bucketSize = (finishTime - numBuckets) / numBuckets;

  const wpms = [];

  let keyI = 0;
  for (let t = 0; t < finishTime; t += bucketSize) {
    while (t > wpmPerKeystroke[keyI][0]) {
      keyI += 1;
    }

    if (keyI === 0) {
      wpms.push(wpmPerKeystroke[0][1]);
    } else {
      const low = wpmPerKeystroke[keyI - 1][1];
      const lowTime = wpmPerKeystroke[keyI - 1][0];
      const high = wpmPerKeystroke[keyI][1];
      const highTime = wpmPerKeystroke[keyI][0];
      // console.log(low, lowTime, high, highTime);

      const amtInto = t - lowTime;
      const percentInto = amtInto / (highTime - lowTime);
      const wpm = percentInto * (high - low);
      // console.log(amtInto, percentInto, wpm);

      wpms.push(wpm);
    }
  }

  return wpms;
}
