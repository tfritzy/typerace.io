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
            className={`rounded-lg overflow-hidden cursor-pointer transition-all text-left w-full ${
                isSelected
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-card'
                    : 'hover:ring-1 hover:ring-foreground/20 hover:ring-offset-1 hover:ring-offset-card'
            }`}
        >
            <div
                className="p-3 pb-2.5"
                style={{ background: preset.backgroundColor }}
            >
                <div className="flex gap-1.5 mb-2">
                    {resolved.previewColors.slice(1).map((color) => (
                        <div
                            key={color}
                            className="h-2 flex-1 rounded-full"
                            style={{ background: color }}
                        />
                    ))}
                </div>
                <div className="text-[11px] font-mono leading-relaxed">
                    <span style={{ color: resolved.colors.accent }}>the </span>
                    <span style={{ color: resolved.colors.textUntyped }}>quick fox</span>
                </div>
            </div>
            <div
                className="px-3 py-1.5 flex items-center justify-between"
                style={{
                    background: resolved.colors.card,
                    color: resolved.colors.foreground,
                }}
            >
                <span className="text-xs font-medium truncate">{preset.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" style={{ color: resolved.colors.accent }} />}
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
            <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Theme Settings</DialogTitle>
                <div className="px-5 pt-5 pb-3 border-b border-border shrink-0">
                    <h2 className="text-lg font-semibold text-foreground">Themes</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-3 gap-2.5">
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
