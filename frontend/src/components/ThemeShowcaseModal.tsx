import { useState } from 'react';
import { Check } from 'lucide-react';
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
    const preset = THEME_PRESETS[tag];
    const resolved = THEMES[tag];

    return (
        <button
            onClick={onSelect}
            className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5 cursor-pointer transition-colors text-left ${
                isSelected
                    ? 'bg-accent/15'
                    : 'hover:bg-secondary'
            }`}
        >
            <div
                className="w-8 h-8 rounded-md shrink-0 flex items-center justify-center border border-foreground/10"
                style={{ background: preset.backgroundColor }}
            >
                <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: preset.accentColor }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground">{preset.name}</span>
                <div className="flex gap-1 mt-1">
                    {resolved.previewColors.slice(1).map((color) => (
                        <div
                            key={color}
                            className="w-3 h-3 rounded-full border border-foreground/10"
                            style={{ background: color }}
                        />
                    ))}
                </div>
            </div>
            <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                {isSelected && <Check className="w-4 h-4 text-accent" />}
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
            <DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Theme Settings</DialogTitle>
                <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
                    <h2 className="text-lg font-semibold text-foreground">Themes</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    <div className="flex flex-col gap-0.5">
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
