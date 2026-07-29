// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { CONTENT_TYPE_KEY, getPreferredMode } from "./gamePreferences";

afterEach(() => localStorage.clear());

describe("getPreferredMode", () => {
  it("restores the selected quotes mode", () => {
    localStorage.setItem(CONTENT_TYPE_KEY, "Quotes");

    expect(getPreferredMode().tag).toBe("EnglishQuotes");
    expect(getPreferredMode("es").tag).toBe("SpanishQuotes");
  });

  it("restores the selected random-words mode", () => {
    localStorage.setItem(CONTENT_TYPE_KEY, "RandomWords");

    expect(getPreferredMode().tag).toBe("English500");
    expect(getPreferredMode("es").tag).toBe("Spanish500");
  });
});
