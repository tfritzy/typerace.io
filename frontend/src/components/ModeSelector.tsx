import "../components/SelectionButton.css";
import { GameMode } from "../../module_bindings";

interface ModeSelectorProps {
    selectedMode: GameMode;
    onModeSelect: (mode: GameMode) => void;
}

export function ModeSelector({ selectedMode, onModeSelect }: ModeSelectorProps) {
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
                        <span className="text-xl leading-none">{modeOption.flag}</span>
                        <span>{modeOption.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
