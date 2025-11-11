import React from "react";
import "./SelectionButton.css";

interface MatchTypeSelectorProps {
    isPrivate: boolean;
    setIsPrivate: (value: boolean) => void;
}

export const MatchTypeSelector: React.FC<MatchTypeSelectorProps> = ({ isPrivate, setIsPrivate }) => (
    <div className="mb-6">
        <h2 className="text-white/80 text-lg font-medium mb-3">Match Type</h2>
        <div className="flex gap-3">
            <button
                className={`selection-button ${!isPrivate ? 'selected' : ''}`}
                onClick={() => setIsPrivate(false)}
            >
                <span className="text-xl">🌍</span>
                <span>Public Match</span>
            </button>
            <button
                className={`selection-button ${isPrivate ? 'selected' : ''}`}
                onClick={() => setIsPrivate(true)}
            >
                <span className="text-xl">🔒</span>
                <span>Private Lobby</span>
            </button>
        </div>
    </div>
);
