import { describe, expect, it } from "vitest";
import { prepareWpmChartData } from "./wpmChartData";

const game = (date: Date, wpm: number) => ({
  date: BigInt(date.getTime()) * 1000n,
  wpm,
});

describe("prepareWpmChartData", () => {
  it("sorts races once and keeps only best-WPM changes plus the endpoint", () => {
    const prepared = prepareWpmChartData([
      game(new Date(2026, 0, 4), 85),
      game(new Date(2026, 0, 2), 70),
      game(new Date(2026, 0, 1), 80),
      game(new Date(2026, 0, 3), 90),
    ]);

    expect(prepared.racePoints.map((point) => point.y)).toEqual([
      80, 70, 90, 85,
    ]);
    expect(prepared.bestWpmPoints.map((point) => point.y)).toEqual([
      80, 90, 90,
    ]);
  });

  it("produces a slow weekly-sampled long-term average", () => {
    const seed = Array.from({ length: 50 }, (_, index) =>
      game(new Date(2026, 0, 1, 0, index), 80),
    );
    const recent = Array.from({ length: 10 }, (_, index) =>
      game(new Date(2026, 0, 11 + index * 7), 100),
    );
    const prepared = prepareWpmChartData([...seed, ...recent]);
    const lastAverage = prepared.averagePoints.at(-1)?.y ?? 0;

    expect(prepared.averagePoints.length).toBeLessThan(
      prepared.racePoints.length,
    );
    expect(lastAverage).toBeGreaterThan(80);
    expect(lastAverage).toBeLessThan(84);
  });
});
