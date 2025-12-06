import { useState, useCallback, useRef, useMemo } from "react";
import "../components/SelectionButton.css";
import type {
  GameMode,
} from "../../module_bindings";
import { TypeBox, type TypeBoxRef } from "../components/TypeBox";
import { GameOptionsSelector, type GameTypeValue } from "../components/ModeSelector";
import { Header } from "../components/Header";
import { getRandomStartupPhrase } from "../utils/modes";
import { useFindGame } from "../hooks/useFindGame";

const SELECTED_MODE_KEY = "typerace_selected_mode";
const GAME_TYPE_KEY = "typerace_game_type";

const getInitialMode = (): GameMode => {
  try {
    const stored = localStorage.getItem(SELECTED_MODE_KEY);
    if (stored) {
      return JSON.parse(stored) as GameMode;
    }
  } catch (error) {
    console.error("Failed to load selected mode from localStorage:", error);
  }
  return { tag: "EnglishQuotes" };
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
  const [selectedMode, setSelectedMode] = useState<GameMode>(getInitialMode);
  const [gameType, setGameType] = useState<GameTypeValue>(getInitialGameType);
  const typeBoxRef = useRef<TypeBoxRef>(null);
  const { findGame } = useFindGame();

  const handleModeSelect = useCallback((mode: GameMode) => {
    setSelectedMode(mode);
    try {
      localStorage.setItem(SELECTED_MODE_KEY, JSON.stringify(mode));
    } catch (error) {
      console.error("Failed to save selected mode to localStorage:", error);
    }
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
    <div className="relative h-screen flex flex-col overflow-hidden">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="content-container">
          <div className="text-2xl mb-[400px]">
            <TypeBox
              ref={typeBoxRef}
              phrase={startupPhrase}
              onComplete={handlePhraseComplete}
              resetOnComplete={true}
            />
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0">
        <div className="px-4">
          <div className="content-container">
            <GameOptionsSelector
              selectedMode={selectedMode}
              onModeSelect={handleModeSelect}
              gameType={gameType}
              setGameType={handleGameTypeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
