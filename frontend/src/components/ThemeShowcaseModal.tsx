import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import {
    THEME_PRESETS,
    GOOGLE_FONTS,
    loadGoogleFont,
    fontNameToCss,
    applyTheme,
    applyCustomTheme,
    resolveTheme,
    getInitialTheme,
    getCustomThemeSettings,
    type ThemePreset,
    type GoogleFont,
} from '../utils/themes';
import type { PlayerColor } from '../types/stdb';

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog";

function ThemeCard({
    preset,
    isSelected,
    onSelect,
}: {
    preset: ThemePreset;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const theme = resolveTheme(preset, preset.name, preset.previewColors);

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
                className="p-3"
                style={{
                    background: theme.colors.background,
                    borderRadius: `${Math.min(theme.borderRadius, 8)}px ${Math.min(theme.borderRadius, 8)}px 0 0`,
                }}
            >
                <div
                    className="p-2 mb-2"
                    style={{
                        background: theme.colors.card,
                        border: `${theme.borderWidth}px solid ${theme.colors.border}`,
                        borderRadius: `${Math.min(theme.borderRadius, 6)}px`,
                    }}
                >
                    <div
                        className="text-xs leading-relaxed"
                        style={{ fontFamily: theme.font }}
                    >
                        <span style={{ color: theme.colors.accent }}>the quick </span>
                        <span style={{ color: theme.colors.textUntyped }}>brown fox</span>
                    </div>
                </div>
                <div className="flex gap-1 mt-2">
                    {theme.previewColors.slice(1).map((color, i) => (
                        <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full"
                            style={{ background: color }}
                        />
                    ))}
                </div>
            </div>
            <div
                className="px-3 py-2 text-xs font-medium"
                style={{
                    background: theme.colors.card,
                    color: theme.colors.foreground,
                }}
            >
                {theme.name}
            </div>
        </button>
    );
}

function FontRow({
    font,
    isSelected,
    onSelect,
}: {
    font: GoogleFont;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            onClick={onSelect}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer border bg-transparent ${
                isSelected
                    ? 'bg-accent/10 border-accent'
                    : 'border-transparent hover:bg-secondary/50'
            }`}
        >
            <div className="text-xs text-muted-foreground mb-1 tracking-wide">
                {font.name}
                <span className="ml-2 opacity-60">{font.category}</span>
            </div>
            <div
                className="text-2xl truncate text-foreground"
                style={{ fontFamily: fontNameToCss(font.name) }}
            >
                {SAMPLE_TEXT}
            </div>
        </button>
    );
}

type ThemeShowcaseModalProps = {
    onClose: () => void;
};

export const ThemeShowcaseModal = ({ onClose }: ThemeShowcaseModalProps) => {
    const [activeTab, setActiveTab] = useState<'themes' | 'fonts'>('themes');

    const [selectedTheme, setSelectedTheme] = useState<string>(() => {
        const initial = getInitialTheme();
        if (initial === 'custom') {
            const custom = getCustomThemeSettings();
            if (custom) {
                const match = Object.entries(THEME_PRESETS).find(
                    ([, p]) => p.backgroundColor === custom.backgroundColor && p.accentColor === custom.accentColor
                );
                if (match) return match[0];
            }
            return 'CatppuccinMocha';
        }
        return initial;
    });

    const [selectedFont, setSelectedFont] = useState<string>(() => {
        const initial = getInitialTheme();
        if (initial === 'custom') {
            const custom = getCustomThemeSettings();
            if (custom) return custom.font;
        }
        const preset = THEME_PRESETS[initial as PlayerColor['tag']];
        return preset?.font || 'Inter';
    });

    useEffect(() => {
        GOOGLE_FONTS.forEach((f) => loadGoogleFont(f.name));
    }, []);

    const themes = Object.entries(THEME_PRESETS) as [
        PlayerColor['tag'],
        ThemePreset,
    ][];

    const handleThemeSelect = useCallback(
        (tag: string) => {
            setSelectedTheme(tag);
            const preset = THEME_PRESETS[tag as PlayerColor['tag']];
            if (!preset) return;
            if (selectedFont !== preset.font) {
                const font = GOOGLE_FONTS.find((f) => f.name === selectedFont);
                const weight =
                    font && font.weights.includes(400)
                        ? 400
                        : font?.weights[0] || 400;
                applyCustomTheme({
                    ...preset,
                    font: selectedFont,
                    fontWeight: weight,
                });
            } else {
                applyTheme(tag);
            }
        },
        [selectedFont]
    );

    const handleFontSelect = useCallback(
        (fontName: string) => {
            setSelectedFont(fontName);
            const preset = THEME_PRESETS[selectedTheme as PlayerColor['tag']];
            if (!preset) return;
            const font = GOOGLE_FONTS.find((f) => f.name === fontName);
            const weight =
                font && font.weights.includes(400)
                    ? 400
                    : font?.weights[0] || 400;
            if (fontName === preset.font) {
                applyTheme(selectedTheme);
            } else {
                applyCustomTheme({
                    ...preset,
                    font: fontName,
                    fontWeight: weight,
                });
            }
        },
        [selectedTheme]
    );

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Theme & Font Settings</DialogTitle>
                <div className="flex gap-6 px-6 pt-6 pb-0 border-b border-border shrink-0">
                    <button
                        onClick={() => setActiveTab('themes')}
                        className={`pb-3 text-lg font-semibold border-b-2 transition-colors cursor-pointer bg-transparent ${
                            activeTab === 'themes'
                                ? 'border-accent text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Themes
                    </button>
                    <button
                        onClick={() => setActiveTab('fonts')}
                        className={`pb-3 text-lg font-semibold border-b-2 transition-colors cursor-pointer bg-transparent ${
                            activeTab === 'fonts'
                                ? 'border-accent text-foreground'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Fonts
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'themes' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {themes.map(([tag, preset]) => (
                                <ThemeCard
                                    key={tag}
                                    preset={preset}
                                    isSelected={selectedTheme === tag}
                                    onSelect={() => handleThemeSelect(tag)}
                                />
                            ))}
                        </div>
                    )}

                    {activeTab === 'fonts' && (
                        <div className="space-y-1">
                            {GOOGLE_FONTS.map((font) => (
                                <FontRow
                                    key={font.name}
                                    font={font}
                                    isSelected={selectedFont === font.name}
                                    onSelect={() => handleFontSelect(font.name)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
