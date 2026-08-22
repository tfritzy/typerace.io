// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GameMode } from "../types/stdb";
import { getPhraseWordCount, RaceDetailsRow } from "./RaceDetailsRow";

afterEach(cleanup);

describe("getPhraseWordCount", () => {
  it("counts whitespace-separated words", () => {
    expect(getPhraseWordCount("one two   three\nfour")).toBe(4);
  });

  it("counts characters for phrases without spaces", () => {
    expect(getPhraseWordCount("日本語")).toBe(3);
  });

  it("ignores surrounding whitespace", () => {
    expect(getPhraseWordCount("  one two  ")).toBe(2);
    expect(getPhraseWordCount("   ")).toBe(0);
  });
});

describe("RaceDetailsRow", () => {
  it("keeps inline details muted above the personal-record announcement", () => {
    const { container, getByLabelText, getByRole } = render(
      <RaceDetailsRow
        gameMode={{ tag: "English500" } as GameMode}
        phrase="one two three"
        isPersonalRecord
      />,
    );
    const status = getByRole("status");
    const details = Array.from(
      container.querySelectorAll("[data-race-detail]"),
    );
    const detailsRow = getByLabelText("Race details");

    expect(status.textContent).toContain("New personal record!");
    expect(details).toHaveLength(3);
    expect(detailsRow.className).toContain("text-muted-foreground");
    expect(detailsRow.className).toContain("bg-card");
    expect(detailsRow.className).not.toContain("text-accent-primary");
    expect(details.every((detail) =>
      !detail.className.includes("bg-accent-primary/10")
    )).toBe(true);
    expect(detailsRow.compareDocumentPosition(status)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
