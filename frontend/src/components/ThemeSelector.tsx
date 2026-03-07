import { useEffect } from 'react';
import { type PlayerColor } from '../types/stdb';
import { THEMES, loadGoogleFont, type ResolvedTheme } from '../utils/themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

type ThemeSelectorProps = {
    selectedTheme?: PlayerColor['tag'];
    onThemeSelect: (theme: PlayerColor['tag']) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function ThemePreviewCard({ theme, isSelected, onSelect }: {
    theme: ResolvedTheme;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const progressWidth = 65;
    return (
        <button
            onClick={onSelect}
            className="w-full border-0 cursor-pointer text-left transition-transform hover:scale-[1.02]"
            style={{
                background: theme.colors.background,
                borderRadius: `${theme.borderRadius}px`,
                border: `${theme.borderWidth}px solid ${isSelected ? theme.colors.accentPrimary : theme.colors.border}`,
                padding: '12px',
                fontFamily: theme.font,
                fontWeight: theme.fontWeight,
                outline: isSelected ? `2px solid ${theme.colors.accentPrimary}` : 'none',
                outlineOffset: '2px',
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: theme.colors.foreground, fontSize: '13px', fontWeight: 600 }}>{theme.name}</span>
                <span style={{ color: theme.colors.mutedForeground, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{theme.mode}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: `${theme.borderRadius}px`,
                    background: theme.gradient,
                    flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: theme.colors.foreground, fontSize: '11px', fontWeight: 600 }}>Player</span>
                        <span style={{ color: theme.colors.mutedForeground, fontSize: '11px' }}>72 WPM</span>
                    </div>
                    <div style={{
                        width: '100%',
                        height: '6px',
                        background: theme.colors.secondary,
                        borderRadius: `${theme.borderRadius}px`,
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${progressWidth}%`,
                            height: '100%',
                            borderRadius: `${theme.borderRadius}px`,
                            background: theme.gradient,
                        }} />
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
                {theme.previewColors.map((color, i) => (
                    <div key={i} style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: `${Math.min(theme.borderRadius, 7)}px`,
                        background: color,
                        border: `1px solid ${theme.colors.border}`,
                    }} />
                ))}
            </div>
        </button>
    );
}

export const ThemeSelector = ({ selectedTheme, onThemeSelect, open, onOpenChange }: ThemeSelectorProps) => {
    const themes = Object.entries(THEMES) as [PlayerColor['tag'], typeof THEMES[keyof typeof THEMES]][];

    const darkThemes = themes.filter(([, t]) => t.mode === 'dark');
    const lightThemes = themes.filter(([, t]) => t.mode === 'light');

    useEffect(() => {
        if (!open) return;
        const uniqueFonts = new Set(themes.map(([, t]) => t.fontName));
        uniqueFonts.forEach(fontName => loadGoogleFont(fontName));
    }, [open, themes]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[700px] max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle>Choose Theme</DialogTitle>
                </DialogHeader>

                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Dark Themes</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {darkThemes.map(([tag, theme]) => (
                            <ThemePreviewCard
                                key={tag}
                                theme={theme}
                                isSelected={selectedTheme === tag}
                                onSelect={() => onThemeSelect(tag)}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Light Themes</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {lightThemes.map(([tag, theme]) => (
                            <ThemePreviewCard
                                key={tag}
                                theme={theme}
                                isSelected={selectedTheme === tag}
                                onSelect={() => onThemeSelect(tag)}
                            />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
