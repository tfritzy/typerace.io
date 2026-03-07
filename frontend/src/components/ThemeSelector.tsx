import { useState, useRef, useEffect } from 'react';
import { type PlayerColor } from '../types/stdb';
import { THEMES, applyTheme, type ResolvedTheme } from '../utils/themes';

type ThemeSelectorProps = {
    selectedTheme?: PlayerColor['tag'];
    onThemeSelect: (theme: PlayerColor['tag']) => void;
};

function ThemeOption({ theme, isSelected, onSelect }: {
    theme: ResolvedTheme;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            onClick={onSelect}
            className={`w-full border-0 cursor-pointer text-left flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 transition-colors ${isSelected ? 'bg-secondary' : 'bg-transparent'}`}
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
    );
}

export const ThemeSelector = ({ selectedTheme, onThemeSelect }: ThemeSelectorProps) => {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const themes = Object.entries(THEMES) as [PlayerColor['tag'], typeof THEMES[keyof typeof THEMES]][];

    const pixelTags = new Set(['Pico8', 'Endesga', 'Sweetie16']);
    const darkThemes = themes.filter(([tag, t]) => t.mode === 'dark' && !pixelTags.has(tag));
    const lightThemes = themes.filter(([, t]) => t.mode === 'light');
    const pixelThemes = themes.filter(([tag]) => pixelTags.has(tag));

    const currentTheme = selectedTheme && selectedTheme in THEMES
        ? THEMES[selectedTheme]
        : THEMES.CatppuccinMocha;

    useEffect(() => {
        if (!open) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    const handleSelect = (tag: PlayerColor['tag']) => {
        applyTheme(tag);
        onThemeSelect(tag);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="w-full bg-input text-foreground border border-border rounded-lg px-3 py-2 text-sm cursor-pointer outline-none flex items-center justify-between gap-3 hover:border-[var(--border-hover)] transition-colors"
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
                <svg className="text-muted-foreground shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                </svg>
            </button>

            {open && (
                <div
                    className="absolute z-50 w-full mt-1 border border-border bg-popover shadow-lg overflow-y-auto rounded-lg max-h-80"
                >
                    <div className="px-3 pt-2 pb-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Dark</span>
                    </div>
                    {darkThemes.map(([tag, theme]) => (
                        <ThemeOption
                            key={tag}
                            theme={theme}
                            isSelected={selectedTheme === tag}
                            onSelect={() => handleSelect(tag)}
                        />
                    ))}

                    <div className="px-3 pt-2 pb-1 border-t border-border mt-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Light</span>
                    </div>
                    {lightThemes.map(([tag, theme]) => (
                        <ThemeOption
                            key={tag}
                            theme={theme}
                            isSelected={selectedTheme === tag}
                            onSelect={() => handleSelect(tag)}
                        />
                    ))}

                    <div className="px-3 pt-2 pb-1 border-t border-border mt-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pixel</span>
                    </div>
                    {pixelThemes.map(([tag, theme]) => (
                        <ThemeOption
                            key={tag}
                            theme={theme}
                            isSelected={selectedTheme === tag}
                            onSelect={() => handleSelect(tag)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
