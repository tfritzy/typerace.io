import { useState, useCallback, useRef, useMemo } from "react";
import "../components/SelectionButton.css";
import type {
  GameMode,
} from "../../module_bindings";
import { TypeBox, type TypeBoxRef } from "../components/TypeBox";
import { ModeSelector } from "../components/ModeSelector";
import {
  MatchTypeSelector,
  type GameTypeValue,
} from "../components/MatchTypeSelector";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { getRandomStartupPhrase } from "../utils/modes";
import { useFindGame } from "../hooks/useFindGame";
import { useScreenHeight } from "../hooks/useScreenHeight";

export const LobbyPage = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode>({
    tag: "English500",
  });
  const [gameType, setGameType] = useState<GameTypeValue>("Public");
  const typeBoxRef = useRef<TypeBoxRef>(null);
  const { findGame } = useFindGame();
  const { isLimitedHeight } = useScreenHeight();

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
        <div className="p-4">
          <div className="content-container">
            <MatchTypeSelector gameType={gameType} setGameType={setGameType} />
            {!isLimitedHeight && (
              <ModeSelector
                selectedMode={selectedMode}
                onModeSelect={setSelectedMode}
                isLimitedHeight={isLimitedHeight}
              />
            )}
          </div>
        </div>
        <Footer />
      </div>
      {isLimitedHeight && (
        <ModeSelector
          selectedMode={selectedMode}
          onModeSelect={setSelectedMode}
          isLimitedHeight={isLimitedHeight}
        />
      )}
    </div>
  );
};
