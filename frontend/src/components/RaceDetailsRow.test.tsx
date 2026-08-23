// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GameMode } from "../types/stdb";
import { getPhraseWordCount, RaceDetailsRow } from "./RaceDetailsRow";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("getPhraseWordCount", () => {
  it("returns the word count for whitespace-delimited text", () => {
    expect(getPhraseWordCount("one two   three\nfour")).toBe(4);
  });

  it("returns the character count for text without whitespace", () => {
    expect(getPhraseWordCount("日本語")).toBe(3);
  });

  it("trims whitespace before counting", () => {
    expect(getPhraseWordCount("  one two  ")).toBe(2);
    expect(getPhraseWordCount("   ")).toBe(0);
  });
});

describe("RaceDetailsRow", () => {
  it("renders the personal-record announcement before the race details", () => {
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
    expect(detailsRow.textContent).toBe("3 random common English words");
    expect(status.compareDocumentPosition(detailsRow)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it("renders quote length, language, and attribution", () => {
    const { getByLabelText } = render(
      <RaceDetailsRow
        gameMode={{ tag: "EnglishQuotes" } as GameMode}
        phrase="one two three four"
        attribution="Author"
      />,
    );

    expect(getByLabelText("Race details").textContent).toBe(
      "4-word English quote by “Author”",
    );
  });

  it("renders localized metadata", () => {
    localStorage.setItem("typerace_lang_slug", "es");
    const { getByLabelText } = render(
      <RaceDetailsRow
        gameMode={{ tag: "Spanish500" } as GameMode}
        phrase="uno dos tres"
      />,
    );

    expect(getByLabelText("Race details").textContent).toBe(
      "3 palabras comunes aleatorias en Español",
    );
  });
});
