import type { GameRecord } from "../types/stdb";

export interface WpmChartPoint {
  x: number;
  y: number;
}

export type WpmChartRecord = Pick<GameRecord, "date" | "wpm">;

const AVERAGE_SEED_GAMES = 50;
const AVERAGE_SMOOTHING = 0.02;
const DAY_MS = 24 * 60 * 60 * 1000;

const timestampMs = (record: WpmChartRecord) => Number(record.date) / 1000;

const compareDates = (a: WpmChartRecord, b: WpmChartRecord) => {
  if (a.date < b.date) return -1;
  if (a.date > b.date) return 1;
  return 0;
};

const weekKey = (timestamp: number) => {
  const weekStart = new Date(timestamp);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  return weekStart.getTime();
};

const buildAverageLine = (records: WpmChartRecord[]) => {
  if (records.length === 0) return [];

  const seedCount = Math.min(AVERAGE_SEED_GAMES, records.length);
  let average = 0;
  for (let index = 0; index < seedCount; index += 1) {
    average += records[index].wpm;
  }
  average /= seedCount;

  const firstX = timestampMs(records[0]);
  const seedX = timestampMs(records[seedCount - 1]);
  const points: WpmChartPoint[] = [{ x: firstX, y: average }];
  if (seedX !== firstX) points.push({ x: seedX, y: average });

  let activeWeek = weekKey(seedX);
  for (let index = seedCount; index < records.length; index += 1) {
    const record = records[index];
    average += AVERAGE_SMOOTHING * (record.wpm - average);

    const x = timestampMs(record);
    const recordWeek = weekKey(x);
    const point = { x, y: average };
    if (recordWeek === activeWeek) points[points.length - 1] = point;
    else {
      points.push(point);
      activeWeek = recordWeek;
    }
  }

  return points;
};

const buildBestWpmLine = (records: WpmChartRecord[]) => {
  const points: WpmChartPoint[] = [];
  let bestWpm = Number.NEGATIVE_INFINITY;

  for (const record of records) {
    if (record.wpm <= bestWpm) continue;
    bestWpm = record.wpm;
    points.push({ x: timestampMs(record), y: bestWpm });
  }

  const lastRecord = records.at(-1);
  const lastPoint = points.at(-1);
  if (lastRecord && lastPoint) {
    const lastX = timestampMs(lastRecord);
    if (lastPoint.x !== lastX) points.push({ x: lastX, y: bestWpm });
  }

  return points;
};

const getTimeConfig = (records: WpmChartRecord[]) => {
  if (records.length < 2) return { unit: "day" as const, format: "MMM d" };

  const spanDays =
    (timestampMs(records.at(-1)!) - timestampMs(records[0])) / DAY_MS;
  if (spanDays < 1) return { unit: "hour" as const, format: "HH:mm" };
  if (spanDays < 7) return { unit: "day" as const, format: "MMM d" };
  if (spanDays < 60) return { unit: "week" as const, format: "MMM d" };
  if (spanDays < 365) {
    return { unit: "month" as const, format: "MMM yyyy" };
  }
  return { unit: "year" as const, format: "yyyy" };
};

export const prepareWpmChartData = <T extends WpmChartRecord>(
  records: readonly T[],
) => {
  const sortedRecords = [...records].sort(compareDates);
  return {
    sortedRecords,
    racePoints: sortedRecords.map((record) => ({
      x: timestampMs(record),
      y: record.wpm,
    })),
    averagePoints: buildAverageLine(sortedRecords),
    bestWpmPoints: buildBestWpmLine(sortedRecords),
    timeConfig: getTimeConfig(sortedRecords),
  };
};
