import { type PlayerProgress } from "../types/stdb";

const CHARS_PER_WORD = 5;
const EVENT_SIZE_BYTES = 3;
const RAW_WPM_SMOOTHING_WINDOW = 3;

export enum CharacterEventType {
  Correct = 0,
  Incorrect = 1,
  Backspace = 2
}

export interface CharacterEvent {
  timestamp: bigint;
  eventType: { tag: "Correct" | "Incorrect" | "Backspace" };
}

export function decodeCharacterHistory(
  compressedHistory: Uint8Array,
  raceStartTimestamp: bigint
): CharacterEvent[] {
  const events: CharacterEvent[] = [];
  
  for (let i = 0; i + EVENT_SIZE_BYTES <= compressedHistory.length; i += EVENT_SIZE_BYTES) {
    const deciseconds = compressedHistory[i] | (compressedHistory[i + 1] << 8);
    const eventType = compressedHistory[i + 2];
    
    const elapsedMicros = BigInt(deciseconds) * 100_000n;
    const timestamp = raceStartTimestamp + elapsedMicros;
    
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
        console.warn(`Unknown event type ${eventType} at index ${i}, treating as Correct`);
        eventTag = "Correct";
    }
    
    events.push({
      timestamp,
      eventType: { tag: eventTag }
    });
  }
  
  return events;
}

export function getWpm(charCount: number, timeSeconds: number): number {
  if (timeSeconds <= 0) {
    return 0;
  }

  return (charCount / CHARS_PER_WORD) / (timeSeconds / 60.0);
}

export function getWpmPerKeystroke(
  events: CharacterEvent[],
  raceStartTimestamp: bigint,
): number[][] {
  const wpms: number[][] = [];
  let progressChars = 0;

  for (const evt of events) {
    if (evt.eventType.tag === "Backspace") {
      progressChars = Math.max(0, progressChars - 1);
    } else {
      progressChars += 1;
    }

    const elapsedSeconds = Math.max(
      Number(evt.timestamp - raceStartTimestamp) / 1_000_000,
      0,
    );
    wpms.push([elapsedSeconds, getWpm(progressChars, elapsedSeconds)]);
  }

  return wpms;
}

export function getWpmByBucket(
  history: CharacterEvent[],
  raceStartTimestamp: bigint,
  numBuckets: number,
): number[] {
  const wpmPerKeystroke = getWpmPerKeystroke(history, raceStartTimestamp);

  if (wpmPerKeystroke.length === 0 || numBuckets <= 0) {
    return [];
  }

  if (numBuckets === 1 || wpmPerKeystroke.length === 1) {
    return [wpmPerKeystroke[0][1]];
  }

  const startTime = wpmPerKeystroke[0][0];
  const finishTime = wpmPerKeystroke[wpmPerKeystroke.length - 1][0];
  const bucketSize = (finishTime - startTime) / (numBuckets - 1);

  if (bucketSize <= 0) {
    return Array(numBuckets).fill(wpmPerKeystroke.at(-1)![1]);
  }

  const wpms: number[] = [];
  let keyIndex = 0;

  for (let bucketIndex = 0; bucketIndex < numBuckets; bucketIndex++) {
    const time =
      bucketIndex === numBuckets - 1
        ? finishTime
        : startTime + bucketIndex * bucketSize;

    while (
      keyIndex < wpmPerKeystroke.length - 1 &&
      time > wpmPerKeystroke[keyIndex][0]
    ) {
      keyIndex += 1;
    }

    if (keyIndex === 0) {
      wpms.push(wpmPerKeystroke[0][1]);
      continue;
    }

    const [lowTime, lowWpm] = wpmPerKeystroke[keyIndex - 1];
    const [highTime, highWpm] = wpmPerKeystroke[keyIndex];
    if (highTime === lowTime) {
      wpms.push(highWpm);
      continue;
    }

    const percentInto = (time - lowTime) / (highTime - lowTime);
    wpms.push(lowWpm + percentInto * (highWpm - lowWpm));
  }

  return wpms;
}

export function getRawWpmByBucket(
  history: CharacterEvent[],
  raceStartTimestamp: bigint,
  numBuckets: number,
): number[] {
  if (history.length === 0 || numBuckets <= 0) {
    return [];
  }

  const startTime = Math.max(
    Number(history[0].timestamp - raceStartTimestamp) / 1_000_000,
    0,
  );
  const finishTime = Math.max(
    Number(history.at(-1)!.timestamp - raceStartTimestamp) / 1_000_000,
    startTime,
  );

  if (numBuckets === 1 || finishTime === startTime) {
    const rawChars = history.filter(
      (evt) => evt.eventType.tag !== "Backspace",
    ).length;
    return [getWpm(rawChars, Math.max(finishTime, Number.EPSILON))];
  }

  const bucketSize = (finishTime - startTime) / (numBuckets - 1);
  const charCountByBucket = Array<number>(numBuckets).fill(0);

  for (const evt of history) {
    if (evt.eventType.tag === "Backspace") {
      continue;
    }

    const eventTime = Math.max(
      Number(evt.timestamp - raceStartTimestamp) / 1_000_000,
      startTime,
    );
    const bucketIndex = Math.min(
      Math.round((eventTime - startTime) / bucketSize),
      numBuckets - 1,
    );
    charCountByBucket[bucketIndex] += 1;
  }

  const rawWpm = charCountByBucket.map((charCount) =>
    getWpm(charCount, bucketSize),
  );
  const smoothingRadius = Math.floor(RAW_WPM_SMOOTHING_WINDOW / 2);

  return rawWpm.map((_, bucketIndex) => {
    const windowStart = Math.max(0, bucketIndex - smoothingRadius);
    const windowEnd = Math.min(
      rawWpm.length - 1,
      bucketIndex + smoothingRadius,
    );
    let sum = 0;

    for (let index = windowStart; index <= windowEnd; index++) {
      sum += rawWpm[index];
    }

    return sum / (windowEnd - windowStart + 1);
  });
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

export function getAccuracy(compressedHistory: Uint8Array, _raceStartTimestamp: bigint): number {
  if (compressedHistory.length < EVENT_SIZE_BYTES) {
    return 0;
  }

  let correctChars = 0;
  let totalKeystrokes = 0;

  for (
    let offset = 0;
    offset + EVENT_SIZE_BYTES <= compressedHistory.length;
    offset += EVENT_SIZE_BYTES
  ) {
    const eventType = compressedHistory[offset + 2];
    if (eventType === CharacterEventType.Correct) {
      correctChars++;
      totalKeystrokes++;
    } else if (
      eventType === CharacterEventType.Incorrect ||
      eventType === CharacterEventType.Backspace
    ) {
      totalKeystrokes++;
    } else {
      correctChars++;
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
  _raceStartTimestamp: bigint
): number[] {
  if (compressedHistory.length < EVENT_SIZE_BYTES) {
    return [];
  }

  const errorCountBySecond: number[] = [];

  for (
    let offset = 0;
    offset + EVENT_SIZE_BYTES <= compressedHistory.length;
    offset += EVENT_SIZE_BYTES
  ) {
    if (compressedHistory[offset + 2] !== CharacterEventType.Incorrect) {
      continue;
    }

    const deciseconds =
      compressedHistory[offset] | (compressedHistory[offset + 1] << 8);
    const second = Math.floor(deciseconds / 10);

    while (errorCountBySecond.length <= second) {
      errorCountBySecond.push(0);
    }

    errorCountBySecond[second]++;
  }

  return errorCountBySecond;
}
