import { CharacterEvent } from "../../module_bindings/character_event_type";

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

  return wpmBySecond;
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

  const aggWpmByCharacter: number[] = [];
  for (let i = 0; i < progressionStack.length; i++) {
    aggWpmByCharacter.push(getWpm(i + 1, progressionStack[i]));
  }

  let target = 1;
  const nearestIndexPriorWpmToSecondBounds: number[] = [];
  for (let i = 0; i < aggWpmByCharacter.length; i++) {
    while (progressionStack[i] > target) {
      target += 1;
      nearestIndexPriorWpmToSecondBounds.push(Math.max(i - 1, 0));
    }
  }

  const wpmBySecond: number[] = [];
  for (let i = 0; i < nearestIndexPriorWpmToSecondBounds.length; i++) {
    const second = i + 1;
    const priorI = nearestIndexPriorWpmToSecondBounds[i];
    const prevVal = aggWpmByCharacter[priorI];

    const nextI = priorI + 1;
    if (nextI >= aggWpmByCharacter.length) {
      wpmBySecond.push(prevVal);
      continue;
    }

    const nextVal = aggWpmByCharacter[nextI];
    const priorTime = progressionStack[priorI];
    const nextTime = progressionStack[nextI];
    const timespan = nextTime - priorTime;

    if (timespan <= 0) {
      wpmBySecond.push(prevVal);
      continue;
    }

    const percentAlongTimespan = (second - priorTime) / timespan;
    let lerpedWpm = prevVal + (nextVal - prevVal) * percentAlongTimespan;
    lerpedWpm = Math.max(lerpedWpm, 0);
    wpmBySecond.push(lerpedWpm);
  }

  if (aggWpmByCharacter.length > 0) {
    const finalWpm = aggWpmByCharacter[aggWpmByCharacter.length - 1];
    wpmBySecond.push(finalWpm);
  }

  return wpmBySecond;
}
