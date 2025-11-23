import { useState } from "react";
import "../components/SelectionButton.css";
import { GameMode } from "../../module_bindings";
import { ChevronUp, Globe, Lock, Target } from "lucide-react";

export type GameTypeValue = "Public" | "Private" | "Practice";

interface GameOptionsSelectorProps {
    selectedMode: GameMode;
    onModeSelect: (mode: GameMode) => void;
    gameType: GameTypeValue;
    setGameType: (value: GameTypeValue) => void;
}

export function GameOptionsSelector({ selectedMode, onModeSelect, gameType, setGameType }: GameOptionsSelectorProps) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const modes = [
        { mode: GameMode.English500, label: "English", flag: "🇬🇧" },
        { mode: GameMode.Spanish500, label: "Spanish", flag: "🇪🇸" },
        { mode: GameMode.French500, label: "French", flag: "🇫🇷" },
        { mode: GameMode.German500, label: "German", flag: "🇩🇪" },
        { mode: GameMode.Italian500, label: "Italian", flag: "🇮🇹" },
        { mode: GameMode.Portuguese500, label: "Portuguese", flag: "🇵🇹" },
        { mode: GameMode.Japanese500, label: "Japanese", flag: "🇯🇵" },
        { mode: GameMode.Korean500, label: "Korean", flag: "🇰🇷" },
        { mode: GameMode.Chinese500, label: "Chinese", flag: "🇨🇳" },
        { mode: GameMode.Ukrainian500, label: "Ukrainian", flag: "🇺🇦" },
        { mode: GameMode.Arabic500, label: "Arabic", flag: "🇸🇦" },
        { mode: GameMode.Hindi500, label: "Hindi", flag: "🇮🇳" },
        { mode: GameMode.Dutch500, label: "Dutch", flag: "🇳🇱" },
        { mode: GameMode.Swedish500, label: "Swedish", flag: "🇸🇪" },
        { mode: GameMode.Turkish500, label: "Turkish", flag: "🇹🇷" },
    ];

    const selectedModeOption = modes.find(m => m.mode.tag === selectedMode.tag);

    const handleModeSelect = (mode: GameMode) => {
        onModeSelect(mode);
        setIsDrawerOpen(false);
    };

    return (
        <>
            <div className="hidden md:block">
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
                <div className="pb-2">
                    <h2 className="text-white/80 text-lg font-medium mb-3">Select Language</h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                        {modes.map((modeOption) => (
                            <button
                                key={modeOption.label}
                                className={`selection-button ${selectedMode.tag === modeOption.mode.tag ? "selected" : ""}`}
                                onClick={() => onModeSelect(modeOption.mode)}
                            >
                                <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{modeOption.flag}</span>
                                <span>{modeOption.label}</span>
                            </button>
                        ))}
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
                        <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>
                            {selectedModeOption?.flag}
                        </span>
                        <span>{selectedModeOption?.label}</span>
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
                            <div className="p-4">
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
                                <h3 className="text-white/80 text-base font-medium mb-3">Language</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {modes.map((modeOption) => (
                                        <button
                                            key={modeOption.label}
                                            className={`selection-button ${selectedMode.tag === modeOption.mode.tag ? "selected" : ""}`}
                                            onClick={() => handleModeSelect(modeOption.mode)}
                                        >
                                            <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{modeOption.flag}</span>
                                            <span>{modeOption.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
