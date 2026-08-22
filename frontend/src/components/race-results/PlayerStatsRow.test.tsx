// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PlayerProgress } from "../../types/stdb";
import { PlayerStatsRow } from "./PlayerStatsRow";

afterEach(cleanup);

const playerProgress = {
  characterHistory: new Uint8Array([0, 0, 1]),
  placement: 2,
  progressIndex: 50,
  time: 60_000_000n,
} as PlayerProgress;

function renderStats(placement = 2, isPersonalRecord = false) {
  return render(
    <PlayerStatsRow
      playerProgress={playerProgress}
      raceStartTimestamp={0n}
      placement={placement}
      isPersonalRecord={isPersonalRecord}
    />,
  );
}

describe("PlayerStatsRow", () => {
  it("renders four cards with the existing first-place highlights", () => {
    const { container } = renderStats(1);
    const cards = Array.from(
      container.querySelectorAll("[data-result-stat]"),
    );

    expect(cards).toHaveLength(4);
    expect(
      cards.filter((card) =>
        card.className.includes("bg-accent-primary/10"),
      ),
    ).toHaveLength(2);
    expect(cards[1].className).toContain("bg-card");
    expect(cards[3].className).toContain("bg-card");
  });

  it("does not accent ordinary results", () => {
    const { container } = renderStats(2);
    const cards = Array.from(
      container.querySelectorAll("[data-result-stat]"),
    );

    expect(cards.every((card) => card.className.includes("bg-card"))).toBe(true);
  });

  it("accents every stat for a personal record", () => {
    const { container } = renderStats(2, true);
    const cards = Array.from(
      container.querySelectorAll("[data-result-stat]"),
    );

    expect(cards.every((card) =>
      card.className.includes("bg-accent-primary/10")
    )).toBe(true);
  });
});
