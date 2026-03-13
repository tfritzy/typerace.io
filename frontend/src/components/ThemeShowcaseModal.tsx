import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import {
    THEME_PRESETS,
    applyTheme,
    resolveTheme,
    getInitialTheme,
    getCustomThemeSettings,
    type ThemeSettings,
} from '../utils/themes';

interface ShowcaseTheme {
    tag: string;
    name: string;
    settings: ThemeSettings;
    previewColors: string[];
}

const DARK_THEMES: ShowcaseTheme[] = [
    { tag: 'Dracula', name: 'Dracula', settings: THEME_PRESETS.Dracula, previewColors: THEME_PRESETS.Dracula.previewColors },
    { tag: 'Monokai', name: 'Monokai', settings: THEME_PRESETS.Monokai, previewColors: THEME_PRESETS.Monokai.previewColors },
    { tag: 'Nord', name: 'Nord', settings: THEME_PRESETS.Nord, previewColors: THEME_PRESETS.Nord.previewColors },
    { tag: 'TokyoNight', name: 'Tokyo Night', settings: THEME_PRESETS.TokyoNight, previewColors: THEME_PRESETS.TokyoNight.previewColors },
    { tag: 'GruvboxDark', name: 'Gruvbox Dark', settings: THEME_PRESETS.GruvboxDark, previewColors: THEME_PRESETS.GruvboxDark.previewColors },
    { tag: 'CatppuccinMocha', name: 'Catppuccin Mocha', settings: THEME_PRESETS.CatppuccinMocha, previewColors: THEME_PRESETS.CatppuccinMocha.previewColors },
    {
        tag: 'OneDark', name: 'One Dark',
        settings: { backgroundColor: '#282c34', textColor: '#abb2bf', borderColor: 'rgba(171, 178, 191, 0.1)', accentColor: '#61afef' },
        previewColors: ['#282c34', '#61afef', '#c678dd', '#98c379'],
    },
    {
        tag: 'RosePine', name: 'Rosé Pine',
        settings: { backgroundColor: '#191724', textColor: '#e0def4', borderColor: 'rgba(224, 222, 244, 0.1)', accentColor: '#c4a7e7' },
        previewColors: ['#191724', '#c4a7e7', '#ebbcba', '#9ccfd8'],
    },
    {
        tag: 'AyuDark', name: 'Ayu Dark',
        settings: { backgroundColor: '#0d1017', textColor: '#bfbdb6', borderColor: 'rgba(191, 189, 182, 0.1)', accentColor: '#e6b450' },
        previewColors: ['#0d1017', '#e6b450', '#39bae6', '#aad94c'],
    },
    {
        tag: 'Kanagawa', name: 'Kanagawa',
        settings: { backgroundColor: '#1f1f28', textColor: '#dcd7ba', borderColor: 'rgba(220, 215, 186, 0.1)', accentColor: '#7e9cd8' },
        previewColors: ['#1f1f28', '#7e9cd8', '#957fb8', '#98bb6c'],
    },
    { tag: 'Pico8', name: 'PICO-8', settings: THEME_PRESETS.Pico8, previewColors: THEME_PRESETS.Pico8.previewColors },
    { tag: 'Endesga', name: 'Endesga 32', settings: THEME_PRESETS.Endesga, previewColors: THEME_PRESETS.Endesga.previewColors },
    { tag: 'Sweetie16', name: 'Sweetie 16', settings: THEME_PRESETS.Sweetie16, previewColors: THEME_PRESETS.Sweetie16.previewColors },
];

const LIGHT_THEMES: ShowcaseTheme[] = [
    { tag: 'GitHubLight', name: 'GitHub Light', settings: THEME_PRESETS.GitHubLight, previewColors: THEME_PRESETS.GitHubLight.previewColors },
    { tag: 'SolarizedLight', name: 'Solarized Light', settings: THEME_PRESETS.SolarizedLight, previewColors: THEME_PRESETS.SolarizedLight.previewColors },
    { tag: 'OneLight', name: 'One Light', settings: THEME_PRESETS.OneLight, previewColors: THEME_PRESETS.OneLight.previewColors },
    { tag: 'CatppuccinLatte', name: 'Catppuccin Latte', settings: THEME_PRESETS.CatppuccinLatte, previewColors: THEME_PRESETS.CatppuccinLatte.previewColors },
    { tag: 'GruvboxLight', name: 'Gruvbox Light', settings: THEME_PRESETS.GruvboxLight, previewColors: THEME_PRESETS.GruvboxLight.previewColors },
    { tag: 'RosePineDawn', name: 'Rosé Pine Dawn', settings: THEME_PRESETS.RosePineDawn, previewColors: THEME_PRESETS.RosePineDawn.previewColors },
    {
        tag: 'AyuLight', name: 'Ayu Light',
        settings: { backgroundColor: '#fcfcfc', textColor: '#5c6166', borderColor: 'rgba(92, 97, 102, 0.25)', accentColor: '#ff9940' },
        previewColors: ['#fcfcfc', '#ff9940', '#399ee6', '#86b300'],
    },
    {
        tag: 'NordLight', name: 'Nord Light',
        settings: { backgroundColor: '#eceff4', textColor: '#2e3440', borderColor: 'rgba(46, 52, 64, 0.2)', accentColor: '#5e81ac' },
        previewColors: ['#eceff4', '#5e81ac', '#88c0d0', '#a3be8c'],
    },
    {
        tag: 'TokyoNightLight', name: 'Tokyo Night Light',
        settings: { backgroundColor: '#d5d6db', textColor: '#343b58', borderColor: 'rgba(52, 59, 88, 0.25)', accentColor: '#34548a' },
        previewColors: ['#d5d6db', '#34548a', '#5a4a78', '#33635c'],
    },
    {
        tag: 'MaterialLight', name: 'Material Light',
        settings: { backgroundColor: '#fafafa', textColor: '#546e7a', borderColor: 'rgba(84, 110, 122, 0.25)', accentColor: '#6182b8' },
        previewColors: ['#fafafa', '#6182b8', '#7c4dff', '#91b859'],
    },
    {
        tag: 'Paper', name: 'Paper',
        settings: { backgroundColor: '#f2eede', textColor: '#4d453e', borderColor: 'rgba(77, 69, 62, 0.2)', accentColor: '#d73737' },
        previewColors: ['#f2eede', '#d73737', '#6684e1', '#60ac39'],
    },
    {
        tag: 'QuietLight', name: 'Quiet Light',
        settings: { backgroundColor: '#f5f5f5', textColor: '#333333', borderColor: 'rgba(51, 51, 51, 0.2)', accentColor: '#4078f2' },
        previewColors: ['#f5f5f5', '#4078f2', '#7c4dff', '#2aa198'],
    },
    {
        tag: 'EverforestLight', name: 'Everforest Light',
        settings: { backgroundColor: '#fdf6e3', textColor: '#5c6a72', borderColor: 'rgba(92, 106, 114, 0.25)', accentColor: '#8da101' },
        previewColors: ['#fdf6e3', '#8da101', '#35a77c', '#f85552'],
    },
];

function ThemeCard({
    theme,
    isSelected,
    onSelect,
}: {
    theme: ShowcaseTheme;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const resolved = resolveTheme(theme.settings, theme.name, theme.previewColors);

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
                    background: resolved.colors.background,
                    borderRadius: `8px 8px 0 0`,
                }}
            >
                <div
                    className="p-2 mb-2"
                    style={{
                        background: resolved.colors.card,
                        border: `1px solid ${resolved.colors.border}`,
                        borderRadius: `6px`,
                    }}
                >
                    <div className="text-xs leading-relaxed font-mono">
                        <span style={{ color: resolved.colors.accent }}>the quick </span>
                        <span style={{ color: resolved.colors.textUntyped }}>brown fox</span>
                    </div>
                </div>
                <div className="flex gap-1 mt-2">
                    {resolved.previewColors.slice(1).map((color) => (
                        <div
                            key={color}
                            className="h-1.5 flex-1 rounded-full"
                            style={{ background: color }}
                        />
                    ))}
                </div>
            </div>
            <div
                className="px-3 py-2 text-xs font-medium"
                style={{
                    background: resolved.colors.card,
                    color: resolved.colors.foreground,
                }}
            >
                {theme.name}
            </div>
        </button>
    );
}

type ThemeShowcaseModalProps = {
    open: boolean;
    onClose: () => void;
};

export const ThemeShowcaseModal = ({ open, onClose }: ThemeShowcaseModalProps) => {
    const allThemes = useMemo(() => {
        const map = new Map<string, ShowcaseTheme>();
        for (const t of DARK_THEMES) map.set(t.tag, t);
        for (const t of LIGHT_THEMES) map.set(t.tag, t);
        return map;
    }, []);

    const [selectedTheme, setSelectedTheme] = useState<string>(() => {
        const initial = getInitialTheme();
        if (initial === 'custom') {
            const custom = getCustomThemeSettings();
            if (custom) {
                for (const t of allThemes.values()) {
                    if (
                        t.settings.backgroundColor === custom.backgroundColor &&
                        t.settings.accentColor === custom.accentColor &&
                        t.settings.textColor === custom.textColor
                    ) return t.tag;
                }
            }
            return 'GruvboxDark';
        }
        return initial;
    });

    const handleThemeSelect = (tag: string) => {
        setSelectedTheme(tag);
        applyTheme(tag);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogTitle className="sr-only">Theme Settings</DialogTitle>
                <div className="px-6 pt-6 pb-3 border-b border-border shrink-0">
                    <h2 className="text-lg font-semibold text-foreground">Themes</h2>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                        <div className="p-6 bg-[#1a1a2e]">
                            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-[#a0a0b8]">Dark</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {DARK_THEMES.map((t) => (
                                    <ThemeCard
                                        key={t.tag}
                                        theme={t}
                                        isSelected={selectedTheme === t.tag}
                                        onSelect={() => handleThemeSelect(t.tag)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-[#e8e4dc]">
                            <h3 className="text-sm font-semibold uppercase tracking-wider mb-3 text-[#6b6560]">Light</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {LIGHT_THEMES.map((t) => (
                                    <ThemeCard
                                        key={t.tag}
                                        theme={t}
                                        isSelected={selectedTheme === t.tag}
                                        onSelect={() => handleThemeSelect(t.tag)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
