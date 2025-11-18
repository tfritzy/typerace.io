import { CharacterEvent } from "../../module_bindings/character_event_type";
import type { PlayerProgress } from "../../module_bindings/player_progress_type";

const CHARS_PER_WORD = 5;

export function getWpm(charCount: number, timeSeconds: number): number {
  if (timeSeconds <= 0) {
    return 0;
  }

  return (charCount / CHARS_PER_WORD) / (timeSeconds / 60.0);
}

export function getRawWpmBySecond(
  events: CharacterEvent[],
  raceStartTimestamp: bigint
): number[] {
  if (!events || events.length === 0) {
    return [];
  }

  const charCountBySecond: number[] = [];
  const wpmBySecond: number[] = [];

  for (const evt of events) {
    if (evt.eventType.tag === "Backspace") {
      continue;
    }

    const elapsedMicros = evt.timestamp - raceStartTimestamp;
    const second = Number(elapsedMicros / 1_000_000n);

    if (second < 0) {
      continue;
    }

    while (charCountBySecond.length <= second) {
      charCountBySecond.push(0);
      wpmBySecond.push(0);
    }

    charCountBySecond[second]++;
  }

  for (let i = 0; i < wpmBySecond.length; i++) {
    if (charCountBySecond[i] === 0) {
      wpmBySecond[i] = 0;
      continue;
    }

    wpmBySecond[i] = getWpm(charCountBySecond[i], 1);
  }

  const smoothedWpm: number[] = [];
  const windowSize = 3;
  
  for (let i = 0; i < wpmBySecond.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - windowSize + 1); j <= Math.min(wpmBySecond.length - 1, i + windowSize - 1); j++) {
      sum += wpmBySecond[j];
      count++;
    }
    
    smoothedWpm.push(sum / count);
  }

  return smoothedWpm;
}

export function getAggWpmBySecond(
  events: CharacterEvent[],
  raceStartTimestamp: bigint
): number[] {
  if (!events || events.length === 0) {
    return [];
  }

  const progressionStack: number[] = [];
  for (const evt of events) {
    const elapsedMicros = evt.timestamp - raceStartTimestamp;
    const seconds = Number(elapsedMicros) / 1_000_000.0;

    if (evt.eventType.tag === "Backspace") {
      if (progressionStack.length > 0) {
        progressionStack.pop();
      }
    } else {
      progressionStack.push(seconds);
    }
  }

  if (progressionStack.length === 0) {
    return [];
  }

  const finalTime = progressionStack[progressionStack.length - 1];
  const maxSecond = Math.floor(finalTime);
  const wpmBySecond: number[] = [];

  for (let second = 0; second <= maxSecond; second++) {
    let charCountAtSecond = 0;
    for (let i = 0; i < progressionStack.length; i++) {
      if (progressionStack[i] <= second) {
        charCountAtSecond = i + 1;
      } else {
        break;
      }
    }

    if (charCountAtSecond > 0 && second > 0) {
      wpmBySecond.push(getWpm(charCountAtSecond, second));
    } else {
      wpmBySecond.push(0);
    }
  }

  return wpmBySecond;
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

export function getAccuracy(events: CharacterEvent[]): number {
  if (!events || events.length === 0) {
    return 0;
  }

  let correctChars = 0;
  let totalKeystrokes = 0;

  for (const evt of events) {
    if (evt.eventType.tag === "Correct") {
      correctChars++;
      totalKeystrokes++;
    } else if (evt.eventType.tag === "Incorrect" || evt.eventType.tag === "Backspace") {
      totalKeystrokes++;
    }
  }

  if (totalKeystrokes === 0) {
    return 0;
  }

  return (correctChars / totalKeystrokes) * 100;
}
