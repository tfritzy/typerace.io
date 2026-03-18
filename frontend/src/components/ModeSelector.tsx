import { useState } from "react";
import { type GameMode } from "../types/stdb";
import { ChevronDown, Globe, Lock, Target, Quote, Shuffle } from "lucide-react";
import { getContentTypeFromMode, type ContentTypeValue, type LanguageInfo } from "../utils/modes";
import { LanguageDropdown } from "./LanguageDropdown";
import { getTranslations } from "../utils/translations";

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
    const selected = "bg-secondary text-secondary-foreground";
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
    const t = getTranslations();

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
                <ModeButton isSelected={gameType === "Public"} onClick={() => setGameType("Public")} icon={<Globe size={16} />} label={t.publicMatch} />
                <ModeButton isSelected={gameType === "Private"} onClick={() => setGameType("Private")} icon={<Lock size={16} />} label={t.privateLobby} />
                <ModeButton isSelected={gameType === "Practice"} onClick={() => setGameType("Practice")} icon={<Target size={16} />} label={t.practiceMode} />
                <span className="mx-2 text-border-hover select-none">|</span>
                <ModeButton isSelected={contentType === "RandomWords"} onClick={() => handleContentTypeChange("RandomWords")} icon={<Shuffle size={16} />} label={t.randomWords} />
                <ModeButton isSelected={contentType === "Quotes"} onClick={() => handleContentTypeChange("Quotes")} icon={<Quote size={16} />} label={t.quotes} disabled={!quotesAvailableForLanguage} />
                <span className="mx-2 text-border-hover select-none">|</span>
                <LanguageDropdown />
            </div>

            <div className="md:hidden flex items-center justify-center gap-2">
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground transition-all duration-200"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    {gameType === "Public" && <Globe size={16} />}
                    {gameType === "Private" && <Lock size={16} />}
                    {gameType === "Practice" && <Target size={16} />}
                    <span>{gameType === "Public" ? t.publicMatch : gameType === "Private" ? t.privateLobby : t.practiceMode} · {contentType === "Quotes" ? t.quotes : t.randomWords}</span>
                    <ChevronDown size={16} />
                </button>
                <LanguageDropdown />
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
                                <h3 className="text-foreground text-lg font-medium">{t.gameOptions}</h3>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ChevronDown size={24} />
                                </button>
                            </div>
                            <div className="p-4 pb-8">
                                <h3 className="text-secondary-foreground text-sm font-medium mb-3 uppercase tracking-wider">{t.matchType}</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <ModeButton isSelected={gameType === "Public"} onClick={() => setGameType("Public")} icon={<Globe size={16} />} label={t.publicMatch} />
                                    <ModeButton isSelected={gameType === "Private"} onClick={() => setGameType("Private")} icon={<Lock size={16} />} label={t.privateLobby} />
                                    <ModeButton isSelected={gameType === "Practice"} onClick={() => setGameType("Practice")} icon={<Target size={16} />} label={t.practiceMode} />
                                </div>
                                <h3 className="text-secondary-foreground text-sm font-medium mb-3 uppercase tracking-wider">{t.mode}</h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    <ModeButton isSelected={contentType === "RandomWords"} onClick={() => handleContentTypeChange("RandomWords")} icon={<Shuffle size={16} />} label={t.randomWords} />
                                    <ModeButton isSelected={contentType === "Quotes"} onClick={() => handleContentTypeChange("Quotes")} icon={<Quote size={16} />} label={t.quotes} disabled={!quotesAvailableForLanguage} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
