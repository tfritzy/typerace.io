import { describe, expect, it } from "vitest";
import { prepareWpmDistribution } from "./wpmDistributionData";

const game = (date: number, wpm: number) => ({
  date: BigInt(date),
  wpm,
});

describe("prepareWpmDistribution", () => {
  it("groups races into non-overlapping recency percentiles by date", () => {
    const records = Array.from({ length: 100 }, (_, index) =>
      game(index, 50 + index),
    );
    const prepared = prepareWpmDistribution(records);

    expect(prepared.cohortTotals).toEqual({
      newest25: 25,
      recent25To50: 25,
      oldest50: 50,
    });
    expect(
      prepared.buckets.reduce(
        (totals, bucket) => ({
          newest25: totals.newest25 + bucket.cohorts.newest25,
          recent25To50:
            totals.recent25To50 + bucket.cohorts.recent25To50,
          oldest50: totals.oldest50 + bucket.cohorts.oldest50,
        }),
        {
          newest25: 0,
          recent25To50: 0,
          oldest50: 0,
        },
      ),
    ).toEqual(prepared.cohortTotals);
  });

  it("calculates the recent median from the newest twenty-five percent", () => {
    const older = Array.from({ length: 75 }, (_, index) => game(index, 50));
    const recent = Array.from({ length: 25 }, (_, index) =>
      game(index + 75, 75 + index),
    );
    const prepared = prepareWpmDistribution([...recent, ...older]);

    expect(prepared.median).toBe(50);
    expect(prepared.recentMedian).toBe(87);
  });

  it("excludes invalid WPM values before assigning cohorts", () => {
    const records = [
      ...Array.from({ length: 11 }, (_, index) => game(index, 60 + index)),
      game(100, Number.NaN),
    ];
    const prepared = prepareWpmDistribution(records);

    expect(prepared.total).toBe(11);
    expect(prepared.cohortTotals).toEqual({
      newest25: 3,
      recent25To50: 3,
      oldest50: 5,
    });
    expect(prepared.recentMedian).toBe(69);
  });

  it("adds up to three padding buckets without making the range symmetric", () => {
    const prepared = prepareWpmDistribution([
      game(1, 10),
      game(2, 80),
      game(3, 85),
      game(4, 90),
      game(5, 124),
    ]);

    expect(prepared.buckets[0].minimum).toBe(0);
    expect(prepared.buckets.at(-1)?.maximum).toBe(140);
    expect(prepared.buckets[0].count).toBe(0);
    expect(prepared.buckets.at(-1)?.count).toBe(0);
    expect(prepared.buckets[2].count).toBeGreaterThan(0);
    expect(prepared.buckets.at(-4)?.count).toBeGreaterThan(0);
  });
});
