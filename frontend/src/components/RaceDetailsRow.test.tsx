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
  it("puts the announcement above an accented details row for a personal record", () => {
    const { container, getByRole } = render(
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

    expect(status.textContent).toContain("New personal record!");
    expect(details).toHaveLength(3);
    expect(details.every((detail) =>
      detail.className.includes("bg-accent-primary/10")
    )).toBe(true);
    expect(status.compareDocumentPosition(details[0])).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
