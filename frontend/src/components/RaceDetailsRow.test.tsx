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
  it("puts an accented random-words bar below the personal-record announcement", () => {
    const { getByLabelText, getByRole } = render(
      <RaceDetailsRow
        gameMode={{ tag: "English500" } as GameMode}
        phrase="one two three"
        isPersonalRecord
      />,
    );
    const status = getByRole("status");
    const detailsRow = getByLabelText("Race details");

    expect(status.textContent).toContain("New personal record!");
    expect(detailsRow.textContent).toBe("3 English random words");
    expect(detailsRow.className).toContain("text-accent-primary");
    expect(detailsRow.className).toContain("bg-accent-primary/10");
    expect(
      detailsRow.querySelector('[data-mode-icon="random-words"]'),
    ).not.toBeNull();
    expect(status.compareDocumentPosition(detailsRow)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("describes a quote with its author and word count", () => {
    const { getByLabelText } = render(
      <RaceDetailsRow
        gameMode={{ tag: "EnglishQuotes" } as GameMode}
        phrase="one two three four"
        attribution="Author"
      />,
    );

    expect(getByLabelText("Race details").textContent).toBe(
      "4 words, English quote by “Author”",
    );
    expect(
      getByLabelText("Race details").querySelector('[data-mode-icon="quote"]'),
    ).not.toBeNull();
  });
});
