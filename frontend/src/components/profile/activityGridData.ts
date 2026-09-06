import type { GameRecord } from "../../types/stdb";

type ActivityRecord = Pick<GameRecord, "date">;

export interface ActivityGridDay {
  count: number;
  date: Date;
  intensity: 0 | 1 | 2 | 3 | 4;
  state: "elapsed" | "future" | "padding";
}

export interface ActivityGridData {
  totalRaces: number;
  weeks: ActivityGridDay[][];
}

const DAYS_IN_WEEK = 7;

function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function dayKey(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getIntensity(count: number, maximum: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0 || maximum === 0) return 0;
  return Math.min(4, Math.ceil((count / maximum) * 4)) as 1 | 2 | 3 | 4;
}

export function buildActivityGrid(
  records: readonly ActivityRecord[],
  year: number | undefined,
  now = new Date(),
): ActivityGridData {
  const today = startOfDay(now);
  const rangeStart = year === undefined
    ? addDays(today, -364)
    : new Date(year, 0, 1);
  const rangeEnd = year === undefined
    ? today
    : new Date(year, 11, 31);
  const gridStart = addDays(rangeStart, -rangeStart.getDay());
  const gridEnd = addDays(rangeEnd, 6 - rangeEnd.getDay());
  const counts = new Map<string, number>();

  for (const record of records) {
    const date = new Date(Number(record.date) / 1_000);
    const recordDay = startOfDay(date);
    if (
      recordDay < rangeStart ||
      recordDay > rangeEnd ||
      recordDay > today
    ) continue;

    const key = dayKey(recordDay);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const maximum = Math.max(0, ...counts.values());
  const weeks: ActivityGridDay[][] = [];
  for (
    let weekStart = gridStart;
    weekStart <= gridEnd;
    weekStart = addDays(weekStart, DAYS_IN_WEEK)
  ) {
    weeks.push(Array.from({ length: DAYS_IN_WEEK }, (_, dayIndex) => {
      const date = addDays(weekStart, dayIndex);
      const isOutsideRange = date < rangeStart || date > rangeEnd;
      const isFuture = date > today;
      const count = isOutsideRange || isFuture
        ? 0
        : (counts.get(dayKey(date)) ?? 0);

      return {
        count,
        date,
        intensity: getIntensity(count, maximum),
        state: isOutsideRange
          ? "padding"
          : isFuture
            ? "future"
            : "elapsed",
      };
    }));
  }

  return {
    totalRaces: Array.from(counts.values()).reduce(
      (total, count) => total + count,
      0,
    ),
    weeks,
  };
}

export function buildActivityYears(
  records: readonly ActivityRecord[],
  currentYear = new Date().getFullYear(),
): number[] {
  let earliestYear = currentYear;

  for (const record of records) {
    const year = new Date(Number(record.date) / 1_000).getFullYear();
    if (year <= currentYear) earliestYear = Math.min(earliestYear, year);
  }

  return Array.from(
    { length: currentYear - earliestYear + 1 },
    (_, index) => currentYear - index,
  );
}
