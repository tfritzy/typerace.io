// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GameMode } from "../types/stdb";
import { RaceDetailsRow } from "./RaceDetailsRow";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("RaceDetailsRow", () => {
  it("renders quote length, language, and attribution", () => {
    const { getByLabelText } = render(
      <RaceDetailsRow
        gameMode={{ tag: "EnglishQuotes" } as GameMode}
        phrase="one two three four"
        attribution="Author"
      />,
    );

    const details = getByLabelText("Race details");
    expect(Array.from(details.querySelectorAll("dd"), ({ textContent }) => textContent)).toEqual([
      "4 words",
      "Quote of “Author”",
      "English",
    ]);
    expect(details.querySelector('[data-detail-icon="length"]')).not.toBeNull();
    expect(details.querySelector('[data-detail-icon="quote"]')).not.toBeNull();
    expect(details.querySelector('[data-detail-icon="language"]')).not.toBeNull();
  });

  it("renders localized metadata", () => {
    localStorage.setItem("typerace_lang_slug", "es");
    const { getByLabelText } = render(
      <RaceDetailsRow
        gameMode={{ tag: "Spanish500" } as GameMode}
        phrase="uno dos tres"
      />,
    );

    const details = getByLabelText("Race details");
    expect(Array.from(details.querySelectorAll("dd"), ({ textContent }) => textContent)).toEqual([
      "3 palabras",
      "Palabras aleatorias",
      "Español",
    ]);
    expect(details.querySelector('[data-detail-icon="length"]')).not.toBeNull();
    expect(details.querySelector('[data-detail-icon="random-words"]')).not.toBeNull();
    expect(details.querySelector('[data-detail-icon="language"]')).not.toBeNull();
  });
});
