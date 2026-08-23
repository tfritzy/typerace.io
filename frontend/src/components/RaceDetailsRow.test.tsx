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
      "3 palabras comunes aleatorias (Español)",
    );
  });
});
