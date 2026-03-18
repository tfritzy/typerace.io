import React from "react";
import { Globe, Lock, Target } from "lucide-react";
import "./SelectionButton.css";
import { getTranslations } from "../utils/translations";

export type GameTypeValue = "Public" | "Private" | "Practice";

interface MatchTypeSelectorProps {
    gameType: GameTypeValue;
    setGameType: (value: GameTypeValue) => void;
}

export const MatchTypeSelector: React.FC<MatchTypeSelectorProps> = ({ gameType, setGameType }) => {
    const t = getTranslations();
    return (
    <div className="mb-6">
        <h2 className="text-secondary-foreground text-lg font-medium mb-3">{t.matchType}</h2>
        <div className="flex gap-3">
            <button
                className={`selection-button ${gameType === "Public" ? 'selected' : ''}`}
                onClick={() => setGameType("Public")}
            >
                <Globe size={20} />
                <span>{t.publicMatch}</span>
            </button>
            <button
                className={`selection-button ${gameType === "Private" ? 'selected' : ''}`}
                onClick={() => setGameType("Private")}
            >
                <Lock size={20} />
                <span>{t.privateLobby}</span>
            </button>
            <button
                className={`selection-button ${gameType === "Practice" ? 'selected' : ''}`}
                onClick={() => setGameType("Practice")}
            >
                <Target size={20} />
                <span>{t.practiceMode}</span>
            </button>
        </div>
    </div>
    );
};
