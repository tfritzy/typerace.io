'use client';

import { Globe, Lock, Target } from "lucide-react";
import "@/components/SelectionButton.css";

export type GameTypeValue = "Public" | "Private" | "Practice";

interface MatchTypeSelectorProps {
    gameType: GameTypeValue;
    setGameType: (value: GameTypeValue) => void;
}

export const MatchTypeSelector = ({ gameType, setGameType }: MatchTypeSelectorProps) => (
    <div className="mb-6">
        <h2 className="text-white/80 text-lg font-medium mb-3">Match Type</h2>
        <div className="flex gap-3">
            <button
                className={`selection-button ${gameType === "Public" ? 'selected' : ''}`}
                onClick={() => setGameType("Public")}
            >
                <Globe size={20} />
                <span>Public Match</span>
            </button>
            <button
                className={`selection-button ${gameType === "Private" ? 'selected' : ''}`}
                onClick={() => setGameType("Private")}
            >
                <Lock size={20} />
                <span>Private Lobby</span>
            </button>
            <button
                className={`selection-button ${gameType === "Practice" ? 'selected' : ''}`}
                onClick={() => setGameType("Practice")}
            >
                <Target size={20} />
                <span>Practice Mode</span>
            </button>
        </div>
    </div>
);
