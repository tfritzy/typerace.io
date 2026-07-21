import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type GameMode } from "../types/stdb";
import { TypeBox, type TypeBoxRef } from "../components/TypeBox";
import {
  GameOptionsSelector,
  type GameTypeValue,
} from "../components/ModeSelector";
import { Footer } from "../components/Footer";
import {
  getRandomStartupPhrase,
  getLanguageFromSlug,
  getContentTypeFromMode,
  storeLangSlug,
} from "../utils/modes";
import { getTranslations } from "../utils/translations";
import {
  CONTENT_TYPE_KEY,
  GAME_TYPE_KEY,
  getPreferredGameType,
  getPreferredMode,
} from "../utils/gamePreferences";

export const LobbyPage = () => {
  const { lang } = useParams<{ lang?: string }>();
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode>(() =>
    getPreferredMode(lang),
  );
  const [gameType, setGameType] = useState<GameTypeValue>(getPreferredGameType);
  const typeBoxRef = useRef<TypeBoxRef>(null);
  const currentLang = getLanguageFromSlug(lang);

  useMemo(() => storeLangSlug(currentLang.slug), [currentLang.slug]);

  useEffect(() => {
    document.title = currentLang.title;
  }, [currentLang.title]);

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
    navigate(`${lang ? `/${lang}` : ""}/game`, { replace: true });
  }, [lang, navigate]);

  return (
    <div className="relative flex-1 min-h-0 flex flex-col">
      <main className="flex-1 flex flex-col items-center p-4 min-h-0">
        <h1 className="sr-only">{getTranslations().tagline}</h1>
        <div className="flex-[4]" />
        <div className="content-container">
          <div className="text-2xl">
            <TypeBox
              ref={typeBoxRef}
              phrase={startupPhrase}
              onComplete={handlePhraseComplete}
              resetOnComplete={true}
            />
          </div>
          <div className="mt-6">
            <GameOptionsSelector
              selectedMode={selectedMode}
              onModeSelect={handleModeSelect}
              gameType={gameType}
              setGameType={handleGameTypeChange}
              currentLang={currentLang}
            />
          </div>
        </div>
        <div className="flex-[6]" />
      </main>
      <Footer />
    </div>
  );
};
