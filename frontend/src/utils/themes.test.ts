// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  THEMES,
  applyCustomTheme,
  applyTheme,
  type ThemeSettings,
  type ThemeTag,
} from "./themes";

function readFaviconSvg(): string {
  const favicon = document.querySelector<HTMLLinkElement>("#theme-favicon");
  const prefix = "data:image/svg+xml,";
  expect(favicon?.href.startsWith(prefix)).toBe(true);
  return decodeURIComponent(favicon!.href.slice(prefix.length));
}

beforeEach(() => {
  const favicon = document.createElement("link");
  favicon.id = "theme-favicon";
  favicon.rel = "icon";
  document.head.append(favicon);
});

afterEach(() => {
  document.querySelector("#theme-favicon")?.remove();
  localStorage.clear();
});

describe("theme favicon", () => {
  it("uses every theme's accent and background colors", () => {
    for (const [tag, theme] of Object.entries(THEMES) as [
      ThemeTag,
      (typeof THEMES)[ThemeTag],
    ][]) {
      applyTheme(tag);
      const svg = readFaviconSvg();

      expect(svg).toContain(`<rect width="512" height="512" fill="${theme.colors.background}"/>`);
      expect(svg).toContain(`fill="${theme.colors.accentPrimary}"`);
    }

    const customTheme: ThemeSettings = {
      backgroundColor: "#102030",
      textColor: "#ffffff",
      borderColor: "#304050",
      accentColor: "#abcdef",
    };
    applyCustomTheme(customTheme);

    expect(readFaviconSvg()).toContain('fill="#abcdef"');
    expect(readFaviconSvg()).toContain('fill="#102030"');
  });
});
