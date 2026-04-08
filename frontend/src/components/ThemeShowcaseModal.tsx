import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import {
    THEME_PRESETS,
    THEMES,
    applyTheme,
    getInitialTheme,
    type ThemeTag,
} from '../utils/themes';

function ThemeRow({
    tag,
    isSelected,
    onSelect,
}: {
    tag: ThemeTag;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const preset = THEME_PRESETS[tag];
    const resolved = THEMES[tag];

    return (
        <button
            onClick={onSelect}
            className={`flex items-center w-full rounded-lg px-4 py-3 cursor-pointer transition-opacity text-left ${
                isSelected
                    ? 'ring-2 ring-accent'
                    : 'hover:opacity-90'
            }`}
            style={{ background: resolved.colors.background }}
        >
            <span
                className="flex-1 text-sm font-medium"
                style={{ color: resolved.colors.accent }}
            >
                {preset.name}
            </span>
            <div
                className="w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center"
                style={{
                    borderColor: resolved.colors.accent,
                    background: isSelected ? resolved.colors.accent : 'transparent',
                }}
            >
                {isSelected && (
                    <svg
                        viewBox="0 0 12 12"
                        className="w-3 h-3"
                        fill="none"
                        stroke={resolved.colors.background}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M2.5 6l2.5 2.5 4.5-5" />
                    </svg>
                )}
            </div>
        </button>
    );
}

type ThemeShowcaseModalProps = {
    open: boolean;
    onClose: () => void;
};

export const ThemeShowcaseModal = ({ open, onClose }: ThemeShowcaseModalProps) => {
    const [selectedTheme, setSelectedTheme] = useState<string>(getInitialTheme);

    const themeTags = Object.keys(THEME_PRESETS) as ThemeTag[];

    const handleThemeSelect = (tag: ThemeTag) => {
        setSelectedTheme(tag);
        applyTheme(tag);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-sm max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Theme Settings</DialogTitle>
                <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
                    <h2 className="text-lg font-semibold text-foreground">Themes</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="flex flex-col gap-1.5">
                        {themeTags.map((tag) => (
                            <ThemeRow
                                key={tag}
                                tag={tag}
                                isSelected={selectedTheme === tag}
                                onSelect={() => handleThemeSelect(tag)}
                            />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
