import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import {
    applyTheme,
    applyCustomTheme,
    getCustomThemeSettings,
    getInitialTheme,
    GOOGLE_FONTS,
    loadGoogleFont,
    fontNameToCss,
    THEMES,
    THEME_PRESETS,
    type ThemeSettings,
} from '../utils/themes';

type ThemeEditorModalProps = {
    currentColor: string;
    onSave: (color: string, customSettings?: ThemeSettings) => void;
    onClose: () => void;
};

const PIXEL_TAGS = new Set<string>(['Pico8', 'Endesga', 'Sweetie16']);

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

function settingsFromPreset(tag: string): ThemeSettings | null {
    const preset = THEME_PRESETS[tag as PlayerColor['tag']];
    if (!preset) return null;
    return {
        backgroundColor: cssColorToHex(preset.backgroundColor),
        textColor: cssColorToHex(preset.textColor),
        accentColor: cssColorToHex(preset.accentColor),
        borderColor: cssColorToHex(preset.borderColor),
        borderWidth: preset.borderWidth,
        borderRadius: preset.borderRadius,
        font: preset.font,
        fontWeight: preset.fontWeight,
    };
}

function FontPicker({ value, onChange }: { value: string; onChange: (font: string) => void }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            GOOGLE_FONTS.forEach((f) => loadGoogleFont(f.name));
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground cursor-pointer text-left flex items-center justify-between hover:border-border-hover transition-colors"
                style={{ fontFamily: fontNameToCss(value) }}
            >
                <span>{value}</span>
                <svg
                    className="text-muted-foreground shrink-0"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points={open ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                </svg>
            </button>
            {open && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {GOOGLE_FONTS.map((font) => (
                        <button
                            key={font.name}
                            type="button"
                            onClick={() => {
                                onChange(font.name);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm cursor-pointer border-0 transition-colors ${
                                value === font.name
                                    ? 'bg-secondary text-foreground'
                                    : 'bg-transparent text-foreground hover:bg-secondary/50'
                            }`}
                            style={{ fontFamily: fontNameToCss(font.name) }}
                        >
                            {font.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ColorField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div>
            <label className="text-xs text-muted-foreground block mb-1.5">{label}</label>
            <div className="flex items-center gap-2">
                <label className="relative shrink-0 cursor-pointer">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                        className="w-9 h-9 rounded-md border border-border"
                        style={{ backgroundColor: value }}
                    />
                </label>
                <div className="flex-1 bg-input border border-border rounded-md px-2.5 py-1.5 flex items-center gap-2">
                    <span
                        className="w-3 h-3 rounded-full border border-border shrink-0"
                        style={{ backgroundColor: value }}
                    />
                    <span className="text-xs font-mono text-foreground">{value.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
}

export const ThemeEditorModal = ({ currentColor, onSave, onClose }: ThemeEditorModalProps) => {
    const originalThemeTag = useRef(getInitialTheme());
    const originalCustomSettings = useRef(getCustomThemeSettings());

    const [selectedPreset, setSelectedPreset] = useState<string | null>(() => {
        if (currentColor === 'custom') return null;
        if (currentColor in THEMES) return currentColor;
        return 'CatppuccinMocha';
    });

    const [settings, setSettings] = useState<ThemeSettings>(() => {
        if (currentColor === 'custom') {
            const custom = getCustomThemeSettings();
            if (custom) {
                return {
                    ...custom,
                    backgroundColor: cssColorToHex(custom.backgroundColor),
                    textColor: cssColorToHex(custom.textColor),
                    accentColor: cssColorToHex(custom.accentColor),
                    borderColor: cssColorToHex(custom.borderColor),
                };
            }
        }
        return settingsFromPreset(currentColor) || settingsFromPreset('CatppuccinMocha')!;
    });

    const themeEntries = useMemo(
        () => Object.entries(THEMES) as [PlayerColor['tag'], (typeof THEMES)[keyof typeof THEMES]][],
        []
    );
    const darkThemes = themeEntries.filter(([tag, t]) => t.mode === 'dark' && !PIXEL_TAGS.has(tag));
    const lightThemes = themeEntries.filter(([, t]) => t.mode === 'light');
    const pixelThemes = themeEntries.filter(([tag]) => PIXEL_TAGS.has(tag));

    const handlePresetSelect = (tag: string) => {
        const presetSettings = settingsFromPreset(tag);
        if (!presetSettings) return;
        setSelectedPreset(tag);
        setSettings(presetSettings);
        applyTheme(tag);
    };

    const handleSettingChange = (updates: Partial<ThemeSettings>) => {
        const updated = { ...settings, ...updates };
        setSettings(updated);
        setSelectedPreset(null);
        applyCustomTheme(updated);
    };

    const handleFontChange = (fontName: string) => {
        const font = GOOGLE_FONTS.find((f) => f.name === fontName);
        if (!font) return;
        const weight = font.weights.includes(400) ? 400 : font.weights[0];
        handleSettingChange({ font: fontName, fontWeight: weight });
    };

    const handleSave = () => {
        if (selectedPreset && selectedPreset in THEME_PRESETS) {
            onSave(selectedPreset);
        } else {
            onSave('custom', settings);
        }
        onClose();
    };

    const handleCancel = () => {
        try {
            if (originalCustomSettings.current) {
                localStorage.setItem('customTheme', JSON.stringify(originalCustomSettings.current));
            } else {
                localStorage.removeItem('customTheme');
            }
        } catch {
        }

        const tag = originalThemeTag.current;
        if (tag === 'custom' && originalCustomSettings.current) {
            applyCustomTheme(originalCustomSettings.current);
        } else {
            applyTheme(tag);
        }
        onClose();
    };

    const sections = [
        { label: 'Dark', themes: darkThemes },
        { label: 'Light', themes: lightThemes },
        { label: 'Pixel', themes: pixelThemes },
    ];

    return (
        <Dialog open={true} onOpenChange={(open) => { if (!open) handleCancel(); }}>
            <DialogContent className="min-w-[520px] max-w-[680px]">
                <DialogHeader className="mb-2">
                    <DialogTitle>Theme Editor</DialogTitle>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-y-auto pr-1">
                    <div className="mb-4">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Presets
                        </div>
                        <div className="space-y-3">
                            {sections.map((section) => (
                                <div key={section.label}>
                                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                                        {section.label}
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {section.themes.map(([tag, theme]) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handlePresetSelect(tag)}
                                                className={`border rounded-md px-2 py-1.5 text-left transition-all cursor-pointer ${
                                                    selectedPreset === tag
                                                        ? 'border-primary bg-secondary ring-1 ring-primary/30'
                                                        : 'border-border hover:border-border-hover'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="shrink-0 w-7 h-5 flex items-center justify-center gap-[2px] border border-border/50 rounded-sm"
                                                        style={{ backgroundColor: theme.colors.background }}
                                                    >
                                                        {theme.previewColors.slice(0, 3).map((color, i) => (
                                                            <span
                                                                key={i}
                                                                className="w-1 h-1 rounded-full"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-foreground truncate">
                                                        {theme.name}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-border my-4" />

                    <div className="mb-4">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            Customize
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <ColorField
                                label="Background"
                                value={settings.backgroundColor}
                                onChange={(v) => handleSettingChange({ backgroundColor: v })}
                            />
                            <ColorField
                                label="Text"
                                value={settings.textColor}
                                onChange={(v) => handleSettingChange({ textColor: v })}
                            />
                            <ColorField
                                label="Accent"
                                value={settings.accentColor}
                                onChange={(v) => handleSettingChange({ accentColor: v })}
                            />
                            <ColorField
                                label="Border"
                                value={settings.borderColor}
                                onChange={(v) => handleSettingChange({ borderColor: v })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1.5">
                                    Border Radius
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="16"
                                        step="2"
                                        value={settings.borderRadius}
                                        onChange={(e) =>
                                            handleSettingChange({ borderRadius: parseInt(e.target.value) })
                                        }
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-muted-foreground w-8 text-right">
                                        {settings.borderRadius}px
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1.5">
                                    Border Width
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        min="0"
                                        max="3"
                                        step="1"
                                        value={settings.borderWidth}
                                        onChange={(e) =>
                                            handleSettingChange({ borderWidth: parseInt(e.target.value) })
                                        }
                                        className="flex-1"
                                    />
                                    <span className="text-xs text-muted-foreground w-8 text-right">
                                        {settings.borderWidth}px
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground block mb-1.5">Font</label>
                            <FontPicker value={settings.font} onChange={handleFontChange} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
