import { useState } from "react";
import { type GameMode } from "../types/stdb";
import { ChevronDown, Globe, Lock, Target, Quote, Shuffle } from "lucide-react";
import { getContentTypeFromMode, type ContentTypeValue, type LanguageInfo } from "../utils/modes";

export type GameTypeValue = "Public" | "Private" | "Practice";

interface GameOptionsSelectorProps {
    selectedMode: GameMode;
    onModeSelect: (mode: GameMode) => void;
    gameType: GameTypeValue;
    setGameType: (value: GameTypeValue) => void;
    currentLang: LanguageInfo;
}

interface ModeButtonProps {
    isSelected: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
}

function ModeButton({ isSelected, onClick, icon, label, disabled }: ModeButtonProps) {
    const base = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer";
    const selected = "bg-accent-primary/15 text-accent-primary";
    const unselected = "text-muted-foreground hover:text-foreground hover:bg-secondary";
    const disabledStyle = "opacity-40 cursor-not-allowed pointer-events-none";

    return (
        <button
            className={`${base} ${isSelected ? selected : unselected} ${disabled ? disabledStyle : ''}`}
            onClick={onClick}
            disabled={disabled}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

export function GameOptionsSelector({ selectedMode, onModeSelect, gameType, setGameType, currentLang }: GameOptionsSelectorProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [contentType, setContentType] = useState<ContentTypeValue>(() => getContentTypeFromMode(selectedMode.tag));

    const selectedLanguage = currentLang;

    const quotesAvailableForLanguage = selectedLanguage.quotesMode !== null;

    const handleContentTypeChange = (newContentType: ContentTypeValue) => {
        if (newContentType === "Quotes" && !quotesAvailableForLanguage) {
            return;
        }

        setContentType(newContentType);

        const newMode = newContentType === "Quotes" ? selectedLanguage.quotesMode : selectedLanguage.randomWordsMode;
        if (newMode) {
            onModeSelect({ tag: newMode } as GameMode);
        }
    };

    return (
        <>
            <div className="hidden md:flex items-center justify-center gap-1 flex-wrap">
                <ModeButton isSelected={gameType === "Public"} onClick={() => setGameType("Public")} icon={<Globe size={16} />} label="Public Match" />
                <ModeButton isSelected={gameType === "Private"} onClick={() => setGameType("Private")} icon={<Lock size={16} />} label="Private Lobby" />
                <ModeButton isSelected={gameType === "Practice"} onClick={() => setGameType("Practice")} icon={<Target size={16} />} label="Practice Mode" />
                <span className="mx-2 text-border-hover select-none">|</span>
                <ModeButton isSelected={contentType === "Quotes"} onClick={() => handleContentTypeChange("Quotes")} icon={<Quote size={16} />} label="Quotes" disabled={!quotesAvailableForLanguage} />
                <ModeButton isSelected={contentType === "RandomWords"} onClick={() => handleContentTypeChange("RandomWords")} icon={<Shuffle size={16} />} label="Random Words" />
            </div>

            <div className="md:hidden flex justify-center">
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-accent-primary/15 text-accent-primary transition-all duration-200"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    {gameType === "Public" && <Globe size={16} />}
                    {gameType === "Private" && <Lock size={16} />}
                    {gameType === "Practice" && <Target size={16} />}
                    <span>{gameType} · {contentType === "Quotes" ? "Quotes" : "Random Words"}</span>
                    <ChevronDown size={16} />
                </button>
            </div>

            {isDrawerOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden animate-slideUp">
                        <div className="bg-card border-t border-border rounded-t-2xl max-h-[70vh] overflow-y-auto">
                            <div className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                                <h3 className="text-foreground text-lg font-medium">Game Options</h3>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ChevronDown size={24} />
                                </button>
                            </div>
                            <div className="p-4 pb-8">
                                <h3 className="text-secondary-foreground text-sm font-medium mb-3 uppercase tracking-wider">Match Type</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <ModeButton isSelected={gameType === "Public"} onClick={() => setGameType("Public")} icon={<Globe size={16} />} label="Public Match" />
                                    <ModeButton isSelected={gameType === "Private"} onClick={() => setGameType("Private")} icon={<Lock size={16} />} label="Private Lobby" />
                                    <ModeButton isSelected={gameType === "Practice"} onClick={() => setGameType("Practice")} icon={<Target size={16} />} label="Practice Mode" />
                                </div>
                                <h3 className="text-secondary-foreground text-sm font-medium mb-3 uppercase tracking-wider">Mode</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <ModeButton isSelected={contentType === "RandomWords"} onClick={() => handleContentTypeChange("RandomWords")} icon={<Shuffle size={16} />} label="Random Words" />
                                    <ModeButton isSelected={contentType === "Quotes"} onClick={() => handleContentTypeChange("Quotes")} icon={<Quote size={16} />} label="Quotes" disabled={!quotesAvailableForLanguage} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
