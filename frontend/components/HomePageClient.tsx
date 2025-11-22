'use client';

import { useState, useMemo, useCallback, useRef } from "react";
import "@/components/SelectionButton.css";
import type { GameMode } from "@/module_bindings";
import { TypeBox, type TypeBoxRef } from "@/components/TypeBox";
import { ModeSelector } from "@/components/ModeSelector";
import {
  MatchTypeSelector,
  type GameTypeValue,
} from "@/components/MatchTypeSelector";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { getRandomStartupPhrase } from "@/lib/utils/modes";
import { useFindGame } from "@/hooks/useFindGame";

export default function HomePageContent() {
  const [selectedMode, setSelectedMode] = useState<GameMode>({
    tag: "English500",
  });
  const [gameType, setGameType] = useState<GameTypeValue>("Public");
  const typeBoxRef = useRef<TypeBoxRef>(null);
  const { findGame } = useFindGame();

  const startupPhrase = useMemo(() => {
    return getRandomStartupPhrase(selectedMode.tag);
  }, [selectedMode.tag]);

  const handlePhraseComplete = useCallback(() => {
    findGame(selectedMode, gameType);
  }, [findGame, selectedMode, gameType]);

  return (
    <>
      <div className="w-full px-4 py-4">
        <div className="content-container flex justify-between items-center">
          <a href="/" className="logo">
            <span className="logo-text">Type</span>
            <span className="logo-accent">Race</span>
            <span className="logo-io">.io</span>
          </a>
          <div>
            <ProfileAvatar />
          </div>
        </div>
      </div>
      <section aria-label="Typing game area">
        <div className="relative h-screen flex flex-col overflow-hidden">
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
          <aside className="fixed bottom-0 left-0 right-0 p-4" aria-label="Game configuration">
            <div className="content-container">
              <MatchTypeSelector gameType={gameType} setGameType={setGameType} />
              <ModeSelector
                selectedMode={selectedMode}
                onModeSelect={setSelectedMode}
              />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
