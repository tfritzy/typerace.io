import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import {
    THEME_PRESETS,
    THEMES,
    applyTheme,
    getInitialTheme,
    type ThemeTag,
} from '../utils/themes';

function ThemeCard({
    tag,
    isSelected,
    onSelect,
}: {
    tag: ThemeTag;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const resolved = THEMES[tag];

    return (
        <button
            onClick={onSelect}
            className={`rounded-lg overflow-hidden cursor-pointer transition-all border-2 text-left w-full ${
                isSelected
                    ? 'border-accent ring-2 ring-accent/30 scale-[1.02]'
                    : 'border-transparent hover:border-border-hover'
            }`}
        >
            <div
                className="px-3 py-2"
                style={{
                    background: resolved.colors.card,
                    color: resolved.colors.accent,
                }}
            >
                <div className="text-xs font-medium font-mono">
                    {THEME_PRESETS[tag].name}
                </div>
            </div>
            <div className="flex">
                {resolved.previewColors.slice(1).map((color) => (
                    <div
                        key={color}
                        className="h-1.5 flex-1"
                        style={{ background: color }}
                    />
                ))}
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
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Theme Settings</DialogTitle>
                <div className="px-6 pt-6 pb-3 border-b border-border shrink-0">
                    <h2 className="text-lg font-semibold text-foreground">Themes</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {themeTags.map((tag) => (
                            <ThemeCard
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
