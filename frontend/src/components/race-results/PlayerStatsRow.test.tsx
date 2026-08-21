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
      categoryLength={12}
      contentType="RandomWords"
      isPersonalRecord={isPersonalRecord}
    />,
  );
}

describe("PlayerStatsRow", () => {
  it("renders a consistent five-card row with first-place highlights", () => {
    const { container, getByText } = renderStats(1);
    const cards = Array.from(
      container.querySelectorAll("[data-result-stat]"),
    );

    expect(cards).toHaveLength(5);
    expect(getByText("12 Word")).not.toBeNull();
    expect(
      cards.filter((card) =>
        card.className.includes("bg-accent-primary/10"),
      ),
    ).toHaveLength(4);
    expect(cards[3].className).toContain("bg-card");
  });

  it("highlights every stat and announces a personal record", () => {
    const { container, getByRole } = renderStats(2, true);
    const cards = Array.from(
      container.querySelectorAll("[data-result-stat]"),
    );

    expect(getByRole("status").textContent).toContain("New personal record!");
    expect(cards.every((card) =>
      card.className.includes("bg-accent-primary/10")
    )).toBe(true);
  });
});
