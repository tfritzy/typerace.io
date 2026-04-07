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
            className={`flex items-center gap-3 w-full rounded-md px-3 py-2 cursor-pointer transition-colors text-left ${
                isSelected
                    ? 'bg-accent/15'
                    : 'hover:bg-foreground/5'
            }`}
        >
            <div
                className="shrink-0 rounded-md overflow-hidden px-2.5 py-1.5"
                style={{ background: resolved.colors.background }}
            >
                <div className="text-[11px] font-mono whitespace-nowrap">
                    <span style={{ color: resolved.colors.accent }}>the </span>
                    <span style={{ color: resolved.colors.textUntyped }}>quick fox</span>
                </div>
            </div>
            <span className="flex-1 text-sm text-foreground truncate">{preset.name}</span>
            {isSelected && <Check className="w-4 h-4 shrink-0 text-accent" />}
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
                    <div className="flex flex-col gap-0.5">
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
