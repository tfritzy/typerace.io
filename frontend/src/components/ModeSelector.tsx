import { useState, useMemo } from "react";
import "../components/SelectionButton.css";
import { type GameMode } from "../types/stdb";
import { ChevronUp, Globe, Lock, Target, Quote, Shuffle, Code } from "lucide-react";
import { spokenLanguages, programmingLanguages, getContentTypeFromMode, isProgrammingMode, type ContentTypeValue, SpokenLanguage } from "../utils/modes";

export type GameTypeValue = "Public" | "Private" | "Practice";
export type LanguageCategoryValue = "Spoken" | "Programming";

const defaultSpokenLanguage = spokenLanguages.find(l => l.language === SpokenLanguage.English) ?? spokenLanguages[0];

interface GameOptionsSelectorProps {
    selectedMode: GameMode;
    onModeSelect: (mode: GameMode) => void;
    gameType: GameTypeValue;
    setGameType: (value: GameTypeValue) => void;
}

export function GameOptionsSelector({ selectedMode, onModeSelect, gameType, setGameType }: GameOptionsSelectorProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [contentType, setContentType] = useState<ContentTypeValue>(() => getContentTypeFromMode(selectedMode.tag));
    const [languageCategory, setLanguageCategory] = useState<LanguageCategoryValue>(() =>
        isProgrammingMode(selectedMode.tag) ? "Programming" : "Spoken"
    );

    const selectedSpokenLanguage = useMemo(() =>
        spokenLanguages.find(l => l.randomWordsMode === selectedMode.tag || l.quotesMode === selectedMode.tag),
        [selectedMode.tag]
    );
    const selectedProgrammingLanguage = useMemo(() =>
        programmingLanguages.find(l => l.quotesMode === selectedMode.tag),
        [selectedMode.tag]
    );

    const randomWordsDisabled = languageCategory === "Programming" || !selectedSpokenLanguage;

    const handleLanguageCategoryChange = (category: LanguageCategoryValue) => {
        setLanguageCategory(category);
        if (category === "Programming") {
            setContentType("Quotes");
            if (programmingLanguages[0]) {
                onModeSelect({ tag: programmingLanguages[0].quotesMode } as GameMode);
            }
        } else if (selectedProgrammingLanguage) {
            const fallback = defaultSpokenLanguage;
            const mode = contentType === "Quotes" ? fallback.quotesMode : fallback.randomWordsMode;
            onModeSelect({ tag: mode } as GameMode);
        }
    };

    const handleContentTypeChange = (newContentType: ContentTypeValue) => {
        if (newContentType === "RandomWords" && randomWordsDisabled) return;
        setContentType(newContentType);
        if (selectedSpokenLanguage) {
            const newMode = newContentType === "Quotes" ? selectedSpokenLanguage.quotesMode : selectedSpokenLanguage.randomWordsMode;
            onModeSelect({ tag: newMode } as GameMode);
        }
    };

    return (
        <>
            <div className="hidden md:block">
                <div className="mb-4">
                    <h2 className="text-white/50 text-sm font-medium mb-2">Match Type</h2>
                    <div className="flex gap-2">
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
                <div className="mb-4">
                    <h2 className="text-white/50 text-sm font-medium mb-2">Mode</h2>
                    <div className="flex gap-2">
                        <button
                            className={`selection-button ${contentType === "Quotes" ? 'selected' : ''}`}
                            onClick={() => handleContentTypeChange("Quotes")}
                        >
                            <Quote size={20} />
                            <span>Quotes</span>
                        </button>
                        <button
                            className={`selection-button ${contentType === "RandomWords" ? 'selected' : ''}`}
                            onClick={() => handleContentTypeChange("RandomWords")}
                            disabled={randomWordsDisabled}
                        >
                            <Shuffle size={20} />
                            <span>Random words</span>
                        </button>
                    </div>
                </div>
                <div className="mb-4">
                    <h2 className="text-white/50 text-sm font-medium mb-2">Language</h2>
                    <div className="flex gap-2">
                        <button
                            className={`selection-button ${languageCategory === "Spoken" ? 'selected' : ''}`}
                            onClick={() => handleLanguageCategoryChange("Spoken")}
                        >
                            <Globe size={20} />
                            <span>Spoken</span>
                        </button>
                        <button
                            className={`selection-button ${languageCategory === "Programming" ? 'selected' : ''}`}
                            onClick={() => handleLanguageCategoryChange("Programming")}
                        >
                            <Code size={20} />
                            <span>Programming</span>
                        </button>
                    </div>
                </div>
                <div className="pb-6">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
                        {languageCategory === "Spoken"
                            ? spokenLanguages.map((lang) => {
                                const mode = contentType === "Quotes" ? lang.quotesMode : lang.randomWordsMode;
                                return (
                                    <button
                                        key={lang.language}
                                        className={`selection-button ${selectedMode.tag === mode ? "selected" : ""}`}
                                        onClick={() => onModeSelect({ tag: mode } as GameMode)}
                                    >
                                        <span className="flag leading-none">{lang.flag}</span>
                                        <span>{lang.language}</span>
                                    </button>
                                );
                            })
                            : programmingLanguages.map((lang) => (
                                <button
                                    key={lang.language}
                                    className={`selection-button ${selectedMode.tag === lang.quotesMode ? "selected" : ""}`}
                                    onClick={() => onModeSelect({ tag: lang.quotesMode } as GameMode)}
                                >
                                    <img src={lang.icon} alt={lang.language} className="w-5 h-5 object-contain" />
                                    <span>{lang.language}</span>
                                </button>
                            ))
                        }
                    </div>
                </div>
            </div>

            <div className="md:hidden pb-2">
                <button
                    className="selection-button selected w-full justify-between"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    <div className="flex items-center gap-2">
                        {gameType === "Public" && <Globe size={18} />}
                        {gameType === "Private" && <Lock size={18} />}
                        {gameType === "Practice" && <Target size={18} />}
                        {contentType === "Quotes" ? <Quote size={18} /> : <Shuffle size={18} />}
                        {selectedProgrammingLanguage
                            ? <img src={selectedProgrammingLanguage.icon} alt={selectedProgrammingLanguage.language} className="w-5 h-5 object-contain" />
                            : <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{selectedSpokenLanguage?.flag ?? defaultSpokenLanguage.flag}</span>
                        }
                        <span>{selectedProgrammingLanguage?.language ?? selectedSpokenLanguage?.language ?? defaultSpokenLanguage.language}</span>
                    </div>
                    <ChevronUp size={20} />
                </button>
            </div>

            {isDrawerOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fadeIn"
                        onClick={() => setIsDrawerOpen(false)}
                    />
                    <div className="fixed inset-x-0 bottom-0 z-50 md:hidden animate-slideUp">
                        <div className="bg-(--color-box-bg) border-t border-(--color-box-border) rounded-t-2xl max-h-[70vh] overflow-y-auto">
                            <div className="sticky top-0 bg-(--color-box-bg) border-b border-(--color-box-border) px-4 py-3 flex items-center justify-between">
                                <h3 className="text-white text-lg font-medium">Game Options</h3>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    <ChevronUp size={24} className="rotate-180" />
                                </button>
                            </div>
                            <div className="p-4 pb-8">
                                <h3 className="text-white/80 text-base font-medium mb-3">Match Type</h3>
                                <div className="flex flex-col gap-2 mb-6">
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
                                <h3 className="text-white/80 text-base font-medium mb-3">Mode</h3>
                                <div className="flex flex-col gap-2 mb-6">
                                    <button
                                        className={`selection-button ${contentType === "RandomWords" ? 'selected' : ''}`}
                                        onClick={() => handleContentTypeChange("RandomWords")}
                                        disabled={randomWordsDisabled}
                                    >
                                        <Shuffle size={20} />
                                        <span>Random Words</span>
                                    </button>
                                    <button
                                        className={`selection-button ${contentType === "Quotes" ? 'selected' : ''}`}
                                        onClick={() => handleContentTypeChange("Quotes")}
                                    >
                                        <Quote size={20} />
                                        <span>Quotes</span>
                                    </button>
                                </div>
                                <h3 className="text-white/80 text-base font-medium mb-3">Language</h3>
                                <div className="flex gap-2 mb-4">
                                    <button
                                        className={`selection-button ${languageCategory === "Spoken" ? 'selected' : ''}`}
                                        onClick={() => handleLanguageCategoryChange("Spoken")}
                                    >
                                        <Globe size={20} />
                                        <span>Spoken</span>
                                    </button>
                                    <button
                                        className={`selection-button ${languageCategory === "Programming" ? 'selected' : ''}`}
                                        onClick={() => handleLanguageCategoryChange("Programming")}
                                    >
                                        <Code size={20} />
                                        <span>Programming</span>
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {languageCategory === "Spoken"
                                        ? spokenLanguages.map((lang) => {
                                            const mode = contentType === "Quotes" ? lang.quotesMode : lang.randomWordsMode;
                                            return (
                                                <button
                                                    key={lang.language}
                                                    className={`selection-button ${selectedMode.tag === mode ? "selected" : ""}`}
                                                    onClick={() => onModeSelect({ tag: mode } as GameMode)}
                                                >
                                                    <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{lang.flag}</span>
                                                    <span>{lang.language}</span>
                                                </button>
                                            );
                                        })
                                        : programmingLanguages.map((lang) => (
                                            <button
                                                key={lang.language}
                                                className={`selection-button ${selectedMode.tag === lang.quotesMode ? "selected" : ""}`}
                                                onClick={() => onModeSelect({ tag: lang.quotesMode } as GameMode)}
                                            >
                                                <img src={lang.icon} alt={lang.language} className="w-5 h-5 object-contain" />
                                                <span>{lang.language}</span>
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
