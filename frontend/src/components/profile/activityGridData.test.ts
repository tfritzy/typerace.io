import { describe, expect, it } from "vitest";
import { buildActivityGrid, buildActivityYears } from "./activityGridData";

const race = (date: Date) => ({
  date: BigInt(date.getTime()) * 1_000n,
});

const visibleDays = (grid: ReturnType<typeof buildActivityGrid>) => (
  grid.weeks.flat().filter((day) => day.state !== "padding")
);

describe("buildActivityGrid", () => {
  it("defaults to a rolling 365-day range", () => {
    const now = new Date(2026, 8, 5, 12);
    const days = visibleDays(buildActivityGrid([], undefined, now));

    expect(days).toHaveLength(365);
    expect(days[0].date).toEqual(new Date(2025, 8, 6));
    expect(days.at(-1)?.date).toEqual(new Date(2026, 8, 5));
  });

  it("builds a Sunday-aligned grid for the selected calendar year", () => {
    const now = new Date(2026, 11, 31, 12);
    const grid = buildActivityGrid([], 2026, now);
    const days = visibleDays(grid);

    expect(grid.weeks).toHaveLength(53);
    expect(grid.weeks.every((week) => week.length === 7)).toBe(true);
    expect(grid.weeks[0][0].date.getDay()).toBe(0);
    expect(days).toHaveLength(365);
    expect(days[0].date).toEqual(new Date(2026, 0, 1));
    expect(days.at(-1)?.date).toEqual(new Date(2026, 11, 31));
  });

  it("pads both ends of the range to complete calendar weeks", () => {
    for (let year = 2020; year <= 2026; year += 1) {
      const allDays = buildActivityGrid(
        [],
        year,
        new Date(2027, 0, 1),
      ).weeks.flat();
      const leadingGap = new Date(year, 0, 1).getDay();
      const trailingGap = 6 - new Date(year, 11, 31).getDay();
      const rangeEnd = trailingGap === 0 ? undefined : -trailingGap;
      const trailingDays = trailingGap === 0
        ? []
        : allDays.slice(-trailingGap);

      expect(allDays.slice(0, leadingGap).every(
        (day) => day.state === "padding",
      )).toBe(true);
      expect(allDays.slice(leadingGap, rangeEnd).every(
        (day) => day.state !== "padding",
      )).toBe(true);
      expect(trailingDays.every(
        (day) => day.state === "padding",
      )).toBe(true);
    }
  });

  it("counts races by local calendar day and ignores races outside the range", () => {
    const now = new Date(2026, 8, 5, 18);
    const grid = buildActivityGrid([
      race(new Date(2026, 0, 1, 1)),
      race(new Date(2026, 0, 1, 23)),
      race(new Date(2026, 8, 4, 12)),
      race(new Date(2025, 11, 31, 23, 59)),
      race(new Date(2026, 11, 1, 0)),
    ], 2026, now);
    const days = visibleDays(grid);

    expect(grid.totalRaces).toBe(3);
    expect(days.find((day) => day.date.getDate() === 1 &&
      day.date.getMonth() === 0)?.count).toBe(2);
    expect(days.find((day) => day.date.getMonth() === 11)?.state).toBe(
      "future",
    );
  });

  it("scales activity intensity logarithmically against the busiest day", () => {
    const now = new Date(2026, 8, 5, 12);
    const records = [1, 10, 100, 1_000].flatMap((count, dayOffset) => (
      Array.from({ length: count }, () => (
        race(new Date(2026, 8, 1 + dayOffset, 12))
      ))
    ));
    const active = visibleDays(buildActivityGrid(records, 2026, now))
      .filter((day) => day.count > 0);

    expect(active.map(({ intensity }) => intensity)).toEqual([1, 2, 3, 4]);
  });
});

describe("buildActivityYears", () => {
  it("returns every year from the current year to the earliest race", () => {
    expect(buildActivityYears([
      race(new Date(2023, 4, 1)),
      race(new Date(2025, 4, 1)),
      race(new Date(2023, 8, 1)),
    ], 2026)).toEqual([2026, 2025, 2024, 2023]);
  });
});
