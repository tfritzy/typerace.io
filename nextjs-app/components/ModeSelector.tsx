'use client';

import "./SelectionButton.css";

export type GameModeTag = 
  | "English500" 
  | "Spanish500" 
  | "French500" 
  | "German500" 
  | "Italian500" 
  | "Portuguese500"
  | "Japanese500"
  | "Korean500"
  | "Chinese500"
  | "Ukrainian500"
  | "Arabic500"
  | "Hindi500"
  | "Dutch500"
  | "Swedish500"
  | "Turkish500";

export interface GameMode {
  tag: GameModeTag;
}

interface ModeSelectorProps {
  selectedMode: GameMode;
  onModeSelect: (mode: GameMode) => void;
}

export function ModeSelector({ selectedMode, onModeSelect }: ModeSelectorProps) {
  const modes = [
    { mode: { tag: "English500" as GameModeTag }, label: "English", flag: "🇬🇧" },
    { mode: { tag: "Spanish500" as GameModeTag }, label: "Spanish", flag: "🇪🇸" },
    { mode: { tag: "French500" as GameModeTag }, label: "French", flag: "🇫🇷" },
    { mode: { tag: "German500" as GameModeTag }, label: "German", flag: "🇩🇪" },
    { mode: { tag: "Italian500" as GameModeTag }, label: "Italian", flag: "🇮🇹" },
    { mode: { tag: "Portuguese500" as GameModeTag }, label: "Portuguese", flag: "🇵🇹" },
    { mode: { tag: "Japanese500" as GameModeTag }, label: "Japanese", flag: "🇯🇵" },
    { mode: { tag: "Korean500" as GameModeTag }, label: "Korean", flag: "🇰🇷" },
    { mode: { tag: "Chinese500" as GameModeTag }, label: "Chinese", flag: "🇨🇳" },
    { mode: { tag: "Ukrainian500" as GameModeTag }, label: "Ukrainian", flag: "🇺🇦" },
    { mode: { tag: "Arabic500" as GameModeTag }, label: "Arabic", flag: "🇸🇦" },
    { mode: { tag: "Hindi500" as GameModeTag }, label: "Hindi", flag: "🇮🇳" },
    { mode: { tag: "Dutch500" as GameModeTag }, label: "Dutch", flag: "🇳🇱" },
    { mode: { tag: "Swedish500" as GameModeTag }, label: "Swedish", flag: "🇸🇪" },
    { mode: { tag: "Turkish500" as GameModeTag }, label: "Turkish", flag: "🇹🇷" },
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
            <span className="text-xl leading-none" style={{ textShadow: '-1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white' }}>{modeOption.flag}</span>
            <span>{modeOption.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
