import { useEffect, useMemo, useRef, useState } from 'react';
import type { PlayerColor } from '../types/stdb';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
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
} from '../utils/themes';

function ThemeDropdown({
    value,
    onChange,
}: {
    value: string;
    onChange: (tag: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const themes = useMemo(
        () => Object.entries(THEMES) as [PlayerColor['tag'], (typeof THEMES)[keyof typeof THEMES]][],
        []
    );

    const pixelTags = new Set(['Pico8', 'Endesga', 'Sweetie16']);
    const darkThemes = themes.filter(([tag, t]) => t.mode === 'dark' && !pixelTags.has(tag));
    const lightThemes = themes.filter(([, t]) => t.mode === 'light');
    const pixelThemes = themes.filter(([tag]) => pixelTags.has(tag));

    const currentTheme = value in THEMES ? THEMES[value as keyof typeof THEMES] : THEMES.CatppuccinMocha;

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
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer text-left flex items-center justify-between gap-3 hover:border-border-hover transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div
                        className="shrink-0 w-9 h-6 flex items-center justify-center gap-[3px] border border-border"
                        style={{
                            borderRadius: `${Math.min(currentTheme.borderRadius, 6)}px`,
                            background: currentTheme.colors.background,
                        }}
                    >
                        {currentTheme.previewColors.slice(0, 4).map((color, i) => (
                            <div key={i} className="size-1.5 rounded-full" style={{ background: color }} />
                        ))}
                    </div>
                    <span>{currentTheme.name}</span>
                </div>
                <svg
                    className="text-muted-foreground shrink-0"
                    width="16"
                    height="16"
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
                <div className="absolute z-50 w-full mt-1 border border-border bg-popover shadow-lg overflow-y-auto rounded-lg max-h-80">
                    <div className="px-3 pt-2 pb-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dark</span>
                    </div>
                    {darkThemes.map(([tag, theme]) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => {
                                onChange(tag);
                                setOpen(false);
                            }}
                            className={`w-full border-0 cursor-pointer text-left flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 transition-colors ${
                                value === tag ? 'bg-secondary' : 'bg-transparent'
                            }`}
                        >
                            <div
                                className="shrink-0 w-9 h-6 flex items-center justify-center gap-[3px] border border-border"
                                style={{
                                    borderRadius: `${Math.min(theme.borderRadius, 6)}px`,
                                    background: theme.colors.background,
                                }}
                            >
                                {theme.previewColors.slice(0, 4).map((color, i) => (
                                    <div key={i} className="size-1.5 rounded-full" style={{ background: color }} />
                                ))}
                            </div>
                            <span className="text-sm text-foreground">{theme.name}</span>
                        </button>
                    ))}

                    <div className="px-3 pt-2 pb-1 border-t border-border mt-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Light</span>
                    </div>
                    {lightThemes.map(([tag, theme]) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => {
                                onChange(tag);
                                setOpen(false);
                            }}
                            className={`w-full border-0 cursor-pointer text-left flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 transition-colors ${
                                value === tag ? 'bg-secondary' : 'bg-transparent'
                            }`}
                        >
                            <div
                                className="shrink-0 w-9 h-6 flex items-center justify-center gap-[3px] border border-border"
                                style={{
                                    borderRadius: `${Math.min(theme.borderRadius, 6)}px`,
                                    background: theme.colors.background,
                                }}
                            >
                                {theme.previewColors.slice(0, 4).map((color, i) => (
                                    <div key={i} className="size-1.5 rounded-full" style={{ background: color }} />
                                ))}
                            </div>
                            <span className="text-sm text-foreground">{theme.name}</span>
                        </button>
                    ))}

                    <div className="px-3 pt-2 pb-1 border-t border-border mt-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pixel</span>
                    </div>
                    {pixelThemes.map(([tag, theme]) => (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => {
                                onChange(tag);
                                setOpen(false);
                            }}
                            className={`w-full border-0 cursor-pointer text-left flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 transition-colors ${
                                value === tag ? 'bg-secondary' : 'bg-transparent'
                            }`}
                        >
                            <div
                                className="shrink-0 w-9 h-6 flex items-center justify-center gap-[3px] border border-border"
                                style={{
                                    borderRadius: `${Math.min(theme.borderRadius, 6)}px`,
                                    background: theme.colors.background,
                                }}
                            >
                                {theme.previewColors.slice(0, 4).map((color, i) => (
                                    <div key={i} className="size-1.5 rounded-full" style={{ background: color }} />
                                ))}
                            </div>
                            <span className="text-sm text-foreground">{theme.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function FontDropdown({ value, onChange }: { value: string; onChange: (font: string) => void }) {
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
                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground cursor-pointer text-left flex items-center justify-between hover:border-border-hover transition-colors"
                style={{ fontFamily: fontNameToCss(value) }}
            >
                <span>{value}</span>
                <svg
                    className="text-muted-foreground shrink-0"
                    width="16"
                    height="16"
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

export const SettingsPage = () => {
    const [selectedPreset, setSelectedPreset] = useState<string>(() => {
        const tag = getInitialTheme();
        if (tag in THEMES) return tag;
        return 'CatppuccinMocha';
    });

    const [selectedFont, setSelectedFont] = useState<string>(() => {
        const tag = getInitialTheme();
        if (tag === 'custom') {
            const custom = getCustomThemeSettings();
            if (custom) return custom.font;
        }
        const preset = THEME_PRESETS[tag as PlayerColor['tag']];
        return preset?.font || 'Inter';
    });

    const handleThemeSelect = (tag: string) => {
        setSelectedPreset(tag);
        applyTheme(tag);
        const preset = THEME_PRESETS[tag as PlayerColor['tag']];
        if (preset) {
            applyCustomTheme({ ...preset, font: selectedFont });
        }
    };

    const handleFontChange = (fontName: string) => {
        const font = GOOGLE_FONTS.find((f) => f.name === fontName);
        if (!font) return;
        setSelectedFont(fontName);
        const preset = THEME_PRESETS[selectedPreset as PlayerColor['tag']];
        if (preset) {
            const weight = font.weights.includes(400) ? 400 : font.weights[0];
            applyCustomTheme({ ...preset, font: fontName, fontWeight: weight });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <Header />

            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center px-4 pb-12">
                <div className="content-container max-w-lg">
                    <h1 className="text-foreground text-2xl font-bold m-0 mb-8 mt-4">Settings</h1>

                    <div className="space-y-5">
                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                Theme
                            </label>
                            <ThemeDropdown value={selectedPreset} onChange={handleThemeSelect} />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                                Font
                            </label>
                            <FontDropdown value={selectedFont} onChange={handleFontChange} />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};
