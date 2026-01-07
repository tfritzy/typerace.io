import { useState, useMemo } from "react";
import "../components/SelectionButton.css";
import { type GameMode } from "../types/stdb";
import { ChevronUp, Globe, Lock, Target, Quote, Shuffle } from "lucide-react";
import { languages, getContentTypeFromMode, type ContentTypeValue } from "../utils/modes";

export type GameTypeValue = "Public" | "Private" | "Practice";

interface GameOptionsSelectorProps {
    selectedMode: GameMode;
    onModeSelect: (mode: GameMode) => void;
    gameType: GameTypeValue;
    setGameType: (value: GameTypeValue) => void;
}

export function GameOptionsSelector({ selectedMode, onModeSelect, gameType, setGameType }: GameOptionsSelectorProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [contentType, setContentType] = useState<ContentTypeValue>(() => getContentTypeFromMode(selectedMode.tag));

    const selectedLanguage = useMemo(() => {
        return languages.find(l =>
            l.randomWordsMode === selectedMode.tag || l.quotesMode === selectedMode.tag
        ) || languages[0];
    }, [selectedMode.tag]);

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
                        >
                            <Shuffle size={20} />
                            <span>Random words</span>
                        </button>
                    </div>
                </div>
                <div className="pb-6">
                    <h2 className="text-white/50 text-sm font-medium mb-2">Language</h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
                        {languages.map((lang) => {
                            const mode = contentType === "Quotes" ? lang.quotesMode : lang.randomWordsMode;
                            const isDisabled = contentType === "Quotes" && !lang.quotesMode;

                            return (
                                <button
                                    key={lang.language}
                                    className={`selection-button ${selectedMode.tag === mode ? "selected" : ""}`}
                                    onClick={() => {
                                        if (mode) {
                                            onModeSelect({ tag: mode } as GameMode);
                                        }
                                    }}
                                    disabled={isDisabled}
                                >
                                    <span className="flag leading-none">{lang.flag}</span>
                                    <span>{lang.language}</span>
                                </button>
                            );
                        })}
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
                        <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>
                            {selectedLanguage.flag}
                        </span>
                        <span>{selectedLanguage.language}</span>
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
                                    >
                                        <Shuffle size={20} />
                                        <span>Random Words</span>
                                    </button>
                                    <button
                                        className={`selection-button ${contentType === "Quotes" ? 'selected' : ''}`}
                                        onClick={() => handleContentTypeChange("Quotes")}
                                        disabled={!quotesAvailableForLanguage}
                                    >
                                        <Quote size={20} />
                                        <span>Quotes</span>
                                    </button>
                                </div>
                                <h3 className="text-white/80 text-base font-medium mb-3">Language</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {languages.map((lang) => {
                                        const mode = contentType === "Quotes" ? lang.quotesMode : lang.randomWordsMode;
                                        const isDisabled = contentType === "Quotes" && !lang.quotesMode;

                                        return (
                                            <button
                                                key={lang.language}
                                                className={`selection-button ${selectedMode.tag === mode ? "selected" : ""}`}
                                                onClick={() => {
                                                    if (mode) {
                                                        onModeSelect({ tag: mode } as GameMode);
                                                    }
                                                }}
                                                disabled={isDisabled}
                                            >
                                                <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{lang.flag}</span>
                                                <span>{lang.language}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
