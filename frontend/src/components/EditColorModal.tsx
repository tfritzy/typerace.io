import { useMemo, useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { applyTheme, applyCustomTheme, getCustomThemeSettings, DEFAULT_THEME_SETTINGS, GOOGLE_FONTS, loadGoogleFont, fontNameToCss, THEMES, type ThemeSettings } from '../utils/themes';

function cssColorToHex(color: string): string {
    if (color.startsWith('#')) return color;
    const el = document.createElement('div');
    el.style.color = color;
    document.body.appendChild(el);
    const computed = getComputedStyle(el).color;
    document.body.removeChild(el);
    const match = computed.match(/(\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#333333';
    return `#${parseInt(match[1]).toString(16).padStart(2, '0')}${parseInt(match[2]).toString(16).padStart(2, '0')}${parseInt(match[3]).toString(16).padStart(2, '0')}`;
}

type EditColorModalProps = {
    currentColor: string;
    onSave: (color: string, customSettings?: ThemeSettings) => void;
    onClose: () => void;
};

const PIXEL_THEME_TAGS = new Set<PlayerColor['tag']>(['Pico8', 'Endesga', 'Sweetie16']);
const PRESET_BUTTON_BASE = 'border rounded-md px-3 py-2 text-left transition-colors';
const DEFAULT_FONT = GOOGLE_FONTS.find((font) => font.name === 'System UI') || {
    name: 'System UI',
    category: 'sans-serif' as const,
    weights: [400],
};
type ColorFieldKey = 'backgroundColor' | 'textColor' | 'accentColor' | 'borderColor';
const COLOR_FIELDS: Array<{ key: ColorFieldKey; label: string }> = [
    { key: 'backgroundColor', label: 'Background' },
    { key: 'textColor', label: 'Text' },
    { key: 'accentColor', label: 'Accent' },
    { key: 'borderColor', label: 'Border' },
];

function getFontWeightLabel(weight: number): string {
    if (weight >= 700) return 'Bold';
    if (weight >= 500) return 'Medium';
    if (weight <= 300) return 'Light';
    return 'Regular';
}

function isThemeTag(tag: string): tag is PlayerColor['tag'] {
    return tag in THEMES;
}

function ThemePresetSection({
    title,
    themes,
    selectedTheme,
    onSelect,
}: {
    title: string;
    themes: [PlayerColor['tag'], typeof THEMES[keyof typeof THEMES]][];
    selectedTheme: PlayerColor['tag'];
    onSelect: (tag: PlayerColor['tag']) => void;
}) {
    return (
        <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{title}</h4>
            <div className="grid grid-cols-2 gap-2 mb-3">
                {themes.map(([tag, preset]) => (
                    <button
                        key={tag}
                        type="button"
                        className={`${PRESET_BUTTON_BASE} ${selectedTheme === tag ? 'border-primary bg-secondary' : 'border-border hover:border-border-hover'}`}
                        onClick={() => onSelect(tag)}
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm">{preset.name}</span>
                            <div
                                className="w-8 h-5 border border-border rounded-sm flex items-center justify-center gap-[2px]"
                                style={{ backgroundColor: preset.colors.background }}
                            >
                                {preset.previewColors.slice(0, 3).map((color, i) => (
                                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export const EditColorModal = ({ currentColor, onSave, onClose }: EditColorModalProps) => {
    const originalCustom = useMemo(() => getCustomThemeSettings(), []);
    const themeEntries = useMemo(
        () => Object.entries(THEMES) as [PlayerColor['tag'], typeof THEMES[keyof typeof THEMES]][],
        []
    );
    const darkThemes = themeEntries.filter(([tag, theme]) => theme.mode === 'dark' && !PIXEL_THEME_TAGS.has(tag));
    const lightThemes = themeEntries.filter(([, theme]) => theme.mode === 'light');
    const pixelThemes = themeEntries.filter(([tag]) => PIXEL_THEME_TAGS.has(tag));

    const [mode, setMode] = useState<'preset' | 'custom'>(currentColor === 'custom' ? 'custom' : 'preset');
    const [theme, setTheme] = useState<PlayerColor['tag']>(
        currentColor !== 'custom' && isThemeTag(currentColor) ? currentColor : 'CatppuccinMocha'
    );
    const [custom, setCustom] = useState<ThemeSettings>(() => {
        const base = originalCustom || DEFAULT_THEME_SETTINGS;
        return {
            ...base,
            backgroundColor: cssColorToHex(base.backgroundColor),
            textColor: cssColorToHex(base.textColor),
            accentColor: cssColorToHex(base.accentColor),
            borderColor: cssColorToHex(base.borderColor),
        };
    });

    const handlePresetSelect = (tag: PlayerColor['tag']) => {
        setTheme(tag);
        setMode('preset');
        applyTheme(tag);
    };

    const handleCustomUpdate = (updates: Partial<ThemeSettings>) => {
        const updated = { ...custom, ...updates };
        setCustom(updated);
        setMode('custom');
        applyCustomTheme(updated);
    };

    const handleFontChange = (fontName: string) => {
        const selectedFont = GOOGLE_FONTS.find((font) => font.name === fontName);
        if (!selectedFont) return;
        const nextWeight = selectedFont.weights.includes(custom.fontWeight)
            ? custom.fontWeight
            : (selectedFont.weights[0] ?? DEFAULT_FONT.weights[0]);
        handleCustomUpdate({ font: fontName, fontWeight: nextWeight });
    };

    const handleSave = () => {
        if (mode === 'custom') {
            onSave('custom', custom);
        } else {
            onSave(theme);
        }
        onClose();
    };

    const handleCancel = () => {
        try {
            if (originalCustom) {
                localStorage.setItem('customTheme', JSON.stringify(originalCustom));
            } else {
                localStorage.removeItem('customTheme');
            }
        } catch {
        }

        if (currentColor === 'custom' && originalCustom) {
            applyCustomTheme(originalCustom);
        } else {
            applyTheme(currentColor);
        }
        onClose();
    };

    const selectedFont = GOOGLE_FONTS.find((font) => font.name === custom.font) || DEFAULT_FONT;
    const fontWeights = selectedFont.weights;

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) handleCancel(); }}>
            <DialogContent className="min-w-[480px] max-w-[680px]">
                <DialogHeader className="mb-4">
                    <DialogTitle>Change Theme</DialogTitle>
                </DialogHeader>

                <div className="mb-5">
                    <div className="inline-flex border border-border rounded-lg overflow-hidden">
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm transition-colors ${mode === 'preset' ? 'bg-secondary text-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setMode('preset')}
                        >
                            Presets
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm transition-colors ${mode === 'custom' ? 'bg-secondary text-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                            onClick={() => setMode('custom')}
                        >
                            Custom
                        </button>
                    </div>
                </div>

                {mode === 'preset' && (
                    <div className="mb-6 max-h-[420px] overflow-y-auto pr-1">
                        <Label className="mb-2 block">Choose a preset theme</Label>
                        <ThemePresetSection title="Dark" themes={darkThemes} selectedTheme={theme} onSelect={handlePresetSelect} />
                        <ThemePresetSection title="Light" themes={lightThemes} selectedTheme={theme} onSelect={handlePresetSelect} />
                        <ThemePresetSection title="Pixel" themes={pixelThemes} selectedTheme={theme} onSelect={handlePresetSelect} />
                    </div>
                )}

                {mode === 'custom' && (
                    <div className="mb-6">
                        <Label className="mb-3 block">Customize your theme</Label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {COLOR_FIELDS.map((colorField) => (
                                <div key={colorField.key}>
                                    <label className="text-xs text-muted-foreground block mb-1">{colorField.label}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={custom[colorField.key]}
                                            onChange={(e) => handleCustomUpdate({ [colorField.key]: e.target.value })}
                                            className="w-9 h-9 rounded cursor-pointer border border-border bg-transparent"
                                        />
                                        <div className="flex items-center gap-2 bg-input border border-border rounded px-2 py-1.5 flex-1">
                                            <span
                                                className="size-3 rounded-full border border-border"
                                                style={{ backgroundColor: custom[colorField.key] }}
                                            />
                                            <span className="text-xs font-mono text-foreground">
                                                {custom[colorField.key].toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Border Width</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="3"
                                    step="1"
                                    value={custom.borderWidth}
                                    onChange={(e) => handleCustomUpdate({ borderWidth: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <span className="text-xs text-muted-foreground">{custom.borderWidth}px</span>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Border Radius</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="16"
                                    step="2"
                                    value={custom.borderRadius}
                                    onChange={(e) => handleCustomUpdate({ borderRadius: parseInt(e.target.value) })}
                                    className="w-full"
                                />
                                <span className="text-xs text-muted-foreground">{custom.borderRadius}px</span>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Font</label>
                                <select
                                    value={custom.font}
                                    onChange={(e) => handleFontChange(e.target.value)}
                                    onFocus={() => GOOGLE_FONTS.forEach((font) => loadGoogleFont(font.name))}
                                    className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm text-foreground cursor-pointer"
                                >
                                    {GOOGLE_FONTS.map((font) => (
                                        <option
                                            key={font.name}
                                            value={font.name}
                                            style={{ fontFamily: fontNameToCss(font.name) }}
                                        >
                                            {font.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">Font Weight</label>
                                <select
                                    value={custom.fontWeight}
                                    onChange={(e) => handleCustomUpdate({ fontWeight: parseInt(e.target.value) })}
                                    className="w-full bg-input border border-border rounded px-2 py-1.5 text-sm text-foreground cursor-pointer"
                                    style={{ fontFamily: fontNameToCss(custom.font), fontWeight: custom.fontWeight }}
                                >
                                    {fontWeights.map((weight) => (
                                        <option key={weight} value={weight} style={{ fontWeight: weight }}>
                                            {getFontWeightLabel(weight)} ({weight})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
