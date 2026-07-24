import type { GameMode } from "../types/stdb";
import type { GameTypeValue } from "../components/ModeSelector";
import { getContentTypeFromMode, getLanguageFromSlug } from "./modes";

export const GAME_TYPE_KEY = "typerace_game_type";
export const CONTENT_TYPE_KEY = "typerace_content_type";

export function getPreferredMode(langSlug?: string): GameMode {
  const language = getLanguageFromSlug(langSlug);
  try {
    const storedContentType = localStorage.getItem(CONTENT_TYPE_KEY);
    if (storedContentType === "RandomWords") {
      return { tag: language.randomWordsMode } as GameMode;
    }
  } catch {}

  if (language.quotesMode) {
    return { tag: language.quotesMode } as GameMode;
  }

  return { tag: language.randomWordsMode } as GameMode;
}

export function getPreferredGameType(): GameTypeValue {
  try {
    const stored = localStorage.getItem(GAME_TYPE_KEY);
    if (stored === "Public" || stored === "Private" || stored === "Practice") {
      return stored;
    }
  } catch (error) {
    console.error("Failed to load game type from localStorage:", error);
  }
  return "Public";
}

export function storeGameSearchPreferences(
  mode: GameMode,
  gameType: GameTypeValue,
): void {
  try {
    localStorage.setItem(CONTENT_TYPE_KEY, getContentTypeFromMode(mode.tag));
    localStorage.setItem(GAME_TYPE_KEY, gameType);
  } catch {}
}
