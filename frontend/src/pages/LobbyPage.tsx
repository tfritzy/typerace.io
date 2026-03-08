import { useState, useCallback, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import "../components/SelectionButton.css";
import { type GameMode } from "../types/stdb";
import { TypeBox, type TypeBoxRef } from "../components/TypeBox";
import { GameOptionsSelector, type GameTypeValue } from "../components/ModeSelector";
import { LanguageSelector } from "../components/LanguageSelector";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getRandomStartupPhrase, getLanguageFromSlug, getContentTypeFromMode, storeLangSlug } from "../utils/modes";
import { useFindGame } from "../hooks/useFindGame";

const GAME_TYPE_KEY = "typerace_game_type";
const CONTENT_TYPE_KEY = "typerace_content_type";

const getInitialMode = (langSlug: string | undefined): GameMode => {
  const langInfo = getLanguageFromSlug(langSlug);
  try {
    const storedContentType = localStorage.getItem(CONTENT_TYPE_KEY);
    if (storedContentType === "Quotes" && langInfo.quotesMode) {
      return { tag: langInfo.quotesMode } as GameMode;
    }
  } catch {}
  return { tag: langInfo.randomWordsMode } as GameMode;
};

const getInitialGameType = (): GameTypeValue => {
  try {
    const stored = localStorage.getItem(GAME_TYPE_KEY);
    if (stored) {
      return stored as GameTypeValue;
    }
  } catch (error) {
    console.error("Failed to load game type from localStorage:", error);
  }
  return "Public";
};

export const LobbyPage = () => {
  const { lang } = useParams<{ lang?: string }>();
  const [selectedMode, setSelectedMode] = useState<GameMode>(() => getInitialMode(lang));
  const [gameType, setGameType] = useState<GameTypeValue>(getInitialGameType);
  const typeBoxRef = useRef<TypeBoxRef>(null);
  const { findGame } = useFindGame();
  const currentLang = getLanguageFromSlug(lang);

  useMemo(() => storeLangSlug(currentLang.slug), [currentLang.slug]);

  const handleModeSelect = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    try {
      const contentType = getContentTypeFromMode(mode.tag);
      localStorage.setItem(CONTENT_TYPE_KEY, contentType);
    } catch {}
  }, []);

  const handleGameTypeChange = useCallback((type: GameTypeValue) => {
    setGameType(type);
    try {
      localStorage.setItem(GAME_TYPE_KEY, type);
    } catch (error) {
      console.error("Failed to save game type to localStorage:", error);
    }
  }, []);

  const startupPhrase = useMemo(() => {
    return getRandomStartupPhrase(selectedMode.tag);
  }, [selectedMode.tag]);

  const handlePhraseComplete = useCallback(() => {
    findGame(selectedMode, gameType);
  }, [findGame, selectedMode, gameType]);

  return (
    <div className="relative h-dvh flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <div className="content-container">
          <div className="text-2xl">
            <TypeBox
              ref={typeBoxRef}
              phrase={startupPhrase}
              onComplete={handlePhraseComplete}
              resetOnComplete={true}
            />
          </div>
        </div>
      </div>
      <div className="px-4 pb-2">
        <div className="content-container">
          <GameOptionsSelector
            selectedMode={selectedMode}
            onModeSelect={handleModeSelect}
            gameType={gameType}
            setGameType={handleGameTypeChange}
            currentLang={currentLang}
          />
        </div>
      </div>
      <Footer />
      <LanguageSelector currentLang={currentLang} />
    </div>
  );
};
