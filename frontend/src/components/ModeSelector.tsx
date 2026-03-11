import { useState, useRef, useEffect } from "react";
import { type GameMode } from "../types/stdb";
import { ChevronDown, Globe, Lock, Target, Quote, Shuffle } from "lucide-react";
import { getContentTypeFromMode, languages, type ContentTypeValue, type LanguageInfo } from "../utils/modes";

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

function LanguageDropdown({ currentLang }: { currentLang: LanguageInfo }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative inline-flex" ref={dropdownRef}>
            <button
                className="inline-flex items-center px-2 py-1 rounded-full transition-all duration-200 cursor-pointer hover:bg-secondary"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-2xl leading-none">{currentLang.flag}</span>
            </button>
            <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 rounded-xl border border-border bg-card p-1.5 min-w-[160px] max-h-[50vh] overflow-y-auto z-50 transition-all duration-150 ${
                    isOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                }`}
            >
                {languages.map((lang) => {
                    const href = lang.slug ? `/${lang.slug}` : "/";
                    const isSelected = lang.language === currentLang.language;
                    return (
                        <a
                            key={lang.language}
                            href={href}
                            hrefLang={lang.htmlLang}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                                isSelected
                                    ? "bg-accent-primary/15 text-accent-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                        >
                            <span>{lang.flag}</span>
                            {lang.nativeName}
                        </a>
                    );
                })}
            </div>
        </div>
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
                <span className="mx-2 text-border-hover select-none">|</span>
                <LanguageDropdown currentLang={selectedLanguage} />
            </div>

            <div className="md:hidden flex items-center justify-center gap-2">
                <button
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-secondary text-secondary-foreground transition-all duration-200"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    {gameType === "Public" && <Globe size={16} />}
                    {gameType === "Private" && <Lock size={16} />}
                    {gameType === "Practice" && <Target size={16} />}
                    <span>{gameType} · {contentType === "Quotes" ? "Quotes" : "Random Words"}</span>
                    <ChevronDown size={16} />
                </button>
                <LanguageDropdown currentLang={selectedLanguage} />
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
