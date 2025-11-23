import { useState } from "react";
import "../components/SelectionButton.css";
import { GameMode } from "../../module_bindings";

interface ModeSelectorProps {
    selectedMode: GameMode;
    onModeSelect: (mode: GameMode) => void;
    isLimitedHeight?: boolean;
}

const DRAWER_HANDLE_HEIGHT = 80;
const DRAWER_MAX_HEIGHT_PERCENT = 80;
const DRAWER_SHADOW = "0 -4px 20px rgba(0, 0, 0, 0.5)";

export function ModeSelector({ selectedMode, onModeSelect, isLimitedHeight = false }: ModeSelectorProps) {
    const [isExpanded, setIsExpanded] = useState(false);

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

    const selectedModeData = modes.find((m) => m.mode.tag === selectedMode.tag) || modes[0];

    const handleModeSelect = (mode: GameMode) => {
        onModeSelect(mode);
        if (isLimitedHeight) {
            setIsExpanded(false);
        }
    };

    if (!isLimitedHeight) {
        return (
            <div className="pb-8">
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
        );
    }

    return (
        <>
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsExpanded(false)}
                />
            )}
            <div
                className="fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300"
                style={{
                    maxHeight: `${DRAWER_MAX_HEIGHT_PERCENT}vh`,
                    transform: isExpanded ? "translateY(0)" : `translateY(calc(100% - ${DRAWER_HANDLE_HEIGHT}px))`,
                }}
            >
                <div
                    className="bg-[var(--color-box-bg)] border border-[var(--color-box-border)] rounded-t-xl overflow-hidden"
                    style={{ boxShadow: DRAWER_SHADOW }}
                >
                    <button
                        className="w-full py-4 px-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>
                                {selectedModeData.flag}
                            </span>
                            <span className="text-white text-base font-medium">
                                {selectedModeData.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-white/60 text-sm">Select Language</span>
                            <svg
                                className={`w-5 h-5 text-white/60 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </button>
                    <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: `calc(${DRAWER_MAX_HEIGHT_PERCENT}vh - ${DRAWER_HANDLE_HEIGHT}px)` }}>
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
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
    );
}
