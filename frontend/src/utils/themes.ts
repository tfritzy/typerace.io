import { type PlayerColor } from "../types/stdb";

export interface ThemeSettings {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    accentColor: string;
    font: string;
    fontWeight: number;
}

export interface ThemePreset extends ThemeSettings {
    name: string;
    previewColors: string[];
}

export interface ResolvedTheme {
    name: string;
    mode: 'light' | 'dark';
    colors: {
        background: string;
        foreground: string;
        card: string;
        cardForeground: string;
        popover: string;
        popoverForeground: string;
        primary: string;
        primaryForeground: string;
        secondary: string;
        secondaryForeground: string;
        muted: string;
        mutedForeground: string;
        accent: string;
        accentForeground: string;
        accentPrimary: string;
        accentLight: string;
        accentDark: string;
        destructive: string;
        destructiveForeground: string;
        border: string;
        input: string;
        ring: string;
        gridLine: string;
        textCompleted: string;
        textUntyped: string;
        borderHover: string;
    };
    avatarColors: string[];
    previewColors: string[];
    gradient: string;
}

export type ThemeConfig = ResolvedTheme;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const h = hex.replace('#', '');
    return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16),
    };
}

function luminance(hex: string): number {
    const { r, g, b } = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function adjustBrightness(hex: string, amount: number): string {
    const { r, g, b } = hexToRgb(hex);
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return `#${clamp(r + amount).toString(16).padStart(2, '0')}${clamp(g + amount).toString(16).padStart(2, '0')}${clamp(b + amount).toString(16).padStart(2, '0')}`;
}

function adjustAccent(hex: string, amount: number): string {
    const { r, g, b } = hexToRgb(hex);
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    if (amount > 0) {
        return `#${clamp(r + (255 - r) * amount).toString(16).padStart(2, '0')}${clamp(g + (255 - g) * amount).toString(16).padStart(2, '0')}${clamp(b + (255 - b) * amount).toString(16).padStart(2, '0')}`;
    }
    const factor = 1 + amount;
    return `#${clamp(r * factor).toString(16).padStart(2, '0')}${clamp(g * factor).toString(16).padStart(2, '0')}${clamp(b * factor).toString(16).padStart(2, '0')}`;
}

export function resolveTheme(settings: ThemeSettings, name: string, previewColors: string[]): ResolvedTheme {
    const isDark = luminance(settings.backgroundColor) < 0.5;
    const fg = hexToRgb(settings.textColor);
    const fgRgba = `${fg.r}, ${fg.g}, ${fg.b}`;
    const card = isDark ? adjustBrightness(settings.backgroundColor, 12) : adjustBrightness(settings.backgroundColor, -10);
    const popover = isDark ? adjustBrightness(settings.backgroundColor, 20) : adjustBrightness(settings.backgroundColor, -10);
    const input = isDark ? adjustBrightness(settings.backgroundColor, -8) : adjustBrightness(settings.backgroundColor, -5);
    const accentLight = adjustAccent(settings.accentColor, 0.2);
    const accentDark = adjustAccent(settings.accentColor, -0.25);
    const contrastForAccent = luminance(settings.accentColor) > 0.5 ? '#000000' : '#ffffff';

    return {
        name,
        mode: isDark ? 'dark' : 'light',
        colors: {
            background: settings.backgroundColor,
            foreground: settings.textColor,
            card,
            cardForeground: settings.textColor,
            popover,
            popoverForeground: settings.textColor,
            primary: settings.accentColor,
            primaryForeground: contrastForAccent,
            secondary: isDark ? `rgba(${fgRgba}, 0.08)` : `rgba(${fgRgba}, 0.06)`,
            secondaryForeground: isDark ? `rgba(${fgRgba}, 0.9)` : `rgba(${fgRgba}, 0.8)`,
            muted: `rgba(${fgRgba}, 0.04)`,
            mutedForeground: `rgba(${fgRgba}, 0.5)`,
            accent: settings.accentColor,
            accentForeground: contrastForAccent,
            accentPrimary: settings.accentColor,
            accentLight,
            accentDark,
            destructive: isDark ? '#f85149' : '#d1242f',
            destructiveForeground: isDark ? settings.textColor : '#ffffff',
            border: settings.borderColor,
            input,
            ring: settings.accentColor,
            gridLine: `rgba(${fgRgba}, 0.06)`,
            textCompleted: isDark ? `rgba(${fgRgba}, 0.15)` : `rgba(${fgRgba}, 0.2)`,
            textUntyped: isDark ? `rgba(${fgRgba}, 0.35)` : `rgba(${fgRgba}, 0.4)`,
            borderHover: isDark ? `rgba(${fgRgba}, 0.25)` : `rgba(${fgRgba}, 0.25)`,
        },
        avatarColors: [settings.accentColor, accentDark, isDark ? popover : card],
        previewColors,
        gradient: `linear-gradient(to right, ${accentDark}, ${settings.accentColor})`,
    };
}

const DEFAULT_DARK_THEME_TAG: PlayerColor['tag'] = 'GitHubDark';
const DEFAULT_LIGHT_THEME_TAG: PlayerColor['tag'] = 'GitHubLight';

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    backgroundColor: '#0d1117',
    textColor: '#f0f6fc',
    borderColor: 'rgba(240, 246, 252, 0.1)',
    borderWidth: 1,
    borderRadius: 8,
    accentColor: '#4493f8',
    font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontWeight: 400,
};

export const THEME_PRESETS: Record<PlayerColor['tag'], ThemePreset> = {
    GitHubDark: {
        name: 'GitHub Dark',
        backgroundColor: '#0d1117',
        textColor: '#f0f6fc',
        borderColor: 'rgba(240, 246, 252, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#4493f8',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#0d1117', '#4493f8', '#3fb950', '#f85149'],
    },
    Dracula: {
        name: 'Dracula',
        backgroundColor: '#282a36',
        textColor: '#f8f8f2',
        borderColor: 'rgba(248, 248, 242, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#bd93f9',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#282a36', '#bd93f9', '#ff79c6', '#50fa7b'],
    },
    Monokai: {
        name: 'Monokai',
        backgroundColor: '#272822',
        textColor: '#f8f8f2',
        borderColor: 'rgba(248, 248, 242, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#a6e22e',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#272822', '#a6e22e', '#f92672', '#66d9ef'],
    },
    Nord: {
        name: 'Nord',
        backgroundColor: '#2e3440',
        textColor: '#eceff4',
        borderColor: 'rgba(236, 239, 244, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#88c0d0',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#2e3440', '#88c0d0', '#81a1c1', '#5e81ac'],
    },
    OneDark: {
        name: 'One Dark',
        backgroundColor: '#282c34',
        textColor: '#abb2bf',
        borderColor: 'rgba(171, 178, 191, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#61afef',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#282c34', '#61afef', '#98c379', '#e06c75'],
    },
    SolarizedDark: {
        name: 'Solarized Dark',
        backgroundColor: '#002b36',
        textColor: '#839496',
        borderColor: 'rgba(131, 148, 150, 0.12)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#2aa198',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#002b36', '#2aa198', '#268bd2', '#b58900'],
    },
    TokyoNight: {
        name: 'Tokyo Night',
        backgroundColor: '#1a1b26',
        textColor: '#a9b1d6',
        borderColor: 'rgba(169, 177, 214, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#7aa2f7',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#1a1b26', '#7aa2f7', '#bb9af7', '#7dcfff'],
    },
    Cobalt2: {
        name: 'Cobalt 2',
        backgroundColor: '#193549',
        textColor: '#e1efff',
        borderColor: 'rgba(225, 239, 255, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#ffc600',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#193549', '#ffc600', '#0088ff', '#ff628c'],
    },
    GruvboxDark: {
        name: 'Gruvbox Dark',
        backgroundColor: '#282828',
        textColor: '#ebdbb2',
        borderColor: 'rgba(235, 219, 178, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#fabd2f',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#282828', '#fabd2f', '#b8bb26', '#fb4934'],
    },
    GitHubLight: {
        name: 'GitHub Light',
        backgroundColor: '#ffffff',
        textColor: '#1f2328',
        borderColor: 'rgba(31, 35, 40, 0.15)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#0969da',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#ffffff', '#0969da', '#1a7f37', '#d1242f'],
    },
    SolarizedLight: {
        name: 'Solarized Light',
        backgroundColor: '#fdf6e3',
        textColor: '#657b83',
        borderColor: 'rgba(101, 123, 131, 0.15)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#268bd2',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#fdf6e3', '#268bd2', '#2aa198', '#b58900'],
    },
    OneLight: {
        name: 'One Light',
        backgroundColor: '#fafafa',
        textColor: '#383a42',
        borderColor: 'rgba(56, 58, 66, 0.12)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#4078f2',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#fafafa', '#4078f2', '#50a14f', '#e45649'],
    },
    CatppuccinLatte: {
        name: 'Catppuccin Latte',
        backgroundColor: '#eff1f5',
        textColor: '#4c4f69',
        borderColor: 'rgba(76, 79, 105, 0.12)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#8839ef',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#eff1f5', '#8839ef', '#1e66f5', '#40a02b'],
    },
    GruvboxLight: {
        name: 'Gruvbox Light',
        backgroundColor: '#fbf1c7',
        textColor: '#3c3836',
        borderColor: 'rgba(60, 56, 54, 0.15)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#b57614',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#fbf1c7', '#b57614', '#79740e', '#9d0006'],
    },
    AyuLight: {
        name: 'Ayu Light',
        backgroundColor: '#fafafa',
        textColor: '#575f66',
        borderColor: 'rgba(87, 95, 102, 0.12)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#ff9940',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#fafafa', '#ff9940', '#399ee6', '#86b300'],
    },
    RosePineDawn: {
        name: 'Rosé Pine Dawn',
        backgroundColor: '#faf4ed',
        textColor: '#575279',
        borderColor: 'rgba(87, 82, 121, 0.12)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#907aa9',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#faf4ed', '#907aa9', '#d7827e', '#56949f'],
    },
    TokyoNightDay: {
        name: 'Tokyo Night Day',
        backgroundColor: '#e6e7ed',
        textColor: '#343b59',
        borderColor: 'rgba(52, 59, 89, 0.15)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#2959aa',
        font: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
        fontWeight: 400,
        previewColors: ['#e6e7ed', '#2959aa', '#587539', '#8f5e15'],
    },
};

export const THEMES: Record<PlayerColor['tag'], ResolvedTheme> = Object.fromEntries(
    Object.entries(THEME_PRESETS).map(([key, preset]) => [
        key,
        resolveTheme(preset, preset.name, preset.previewColors),
    ])
) as Record<PlayerColor['tag'], ResolvedTheme>;

export function resolveCustomTheme(settings: ThemeSettings): ResolvedTheme {
    return resolveTheme(settings, 'Custom', [settings.backgroundColor, settings.accentColor]);
}

export function getThemeConfig(color: PlayerColor): ThemeConfig {
    if (color.tag in THEMES) {
        return THEMES[color.tag];
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? THEMES[DEFAULT_DARK_THEME_TAG] : THEMES[DEFAULT_LIGHT_THEME_TAG];
}

export function getInitialTheme(): string {
    try {
        const saved = localStorage.getItem('selectedTheme');
        if (saved && saved in THEMES) return saved;
        const custom = localStorage.getItem('customTheme');
        if (custom) return 'custom';
    } catch (_e) {
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? DEFAULT_DARK_THEME_TAG : DEFAULT_LIGHT_THEME_TAG;
}

export function getCustomThemeSettings(): ThemeSettings | null {
    try {
        const raw = localStorage.getItem('customTheme');
        if (raw) return JSON.parse(raw) as ThemeSettings;
    } catch (_e) {
    }
    return null;
}

export function applyTheme(colorTag: string): void {
    let theme: ResolvedTheme;
    if (colorTag === 'custom') {
        const custom = getCustomThemeSettings();
        theme = custom ? resolveCustomTheme(custom) : THEMES[DEFAULT_DARK_THEME_TAG];
    } else if (colorTag in THEMES) {
        theme = THEMES[colorTag as PlayerColor['tag']];
    } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? THEMES[DEFAULT_DARK_THEME_TAG] : THEMES[DEFAULT_LIGHT_THEME_TAG];
    }
    applyResolvedTheme(theme, colorTag);
}

export function applyCustomTheme(settings: ThemeSettings): void {
    const theme = resolveCustomTheme(settings);
    try {
        localStorage.setItem('customTheme', JSON.stringify(settings));
    } catch (_e) {
    }
    applyResolvedTheme(theme, 'custom');
}

function applyResolvedTheme(theme: ResolvedTheme, tag: string): void {
    const root = document.documentElement;

    root.style.setProperty('--background', theme.colors.background);
    root.style.setProperty('--foreground', theme.colors.foreground);
    root.style.setProperty('--card', theme.colors.card);
    root.style.setProperty('--card-foreground', theme.colors.cardForeground);
    root.style.setProperty('--popover', theme.colors.popover);
    root.style.setProperty('--popover-foreground', theme.colors.popoverForeground);
    root.style.setProperty('--primary', theme.colors.primary);
    root.style.setProperty('--primary-foreground', theme.colors.primaryForeground);
    root.style.setProperty('--secondary', theme.colors.secondary);
    root.style.setProperty('--secondary-foreground', theme.colors.secondaryForeground);
    root.style.setProperty('--muted', theme.colors.muted);
    root.style.setProperty('--muted-foreground', theme.colors.mutedForeground);
    root.style.setProperty('--accent', theme.colors.accent);
    root.style.setProperty('--accent-foreground', theme.colors.accentForeground);
    root.style.setProperty('--accent-primary', theme.colors.accentPrimary);
    root.style.setProperty('--accent-light', theme.colors.accentLight);
    root.style.setProperty('--accent-dark', theme.colors.accentDark);
    root.style.setProperty('--destructive', theme.colors.destructive);
    root.style.setProperty('--destructive-foreground', theme.colors.destructiveForeground);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--input', theme.colors.input);
    root.style.setProperty('--ring', theme.colors.ring);
    root.style.setProperty('--grid-line', theme.colors.gridLine);
    root.style.setProperty('--text-completed', theme.colors.textCompleted);
    root.style.setProperty('--text-untyped', theme.colors.textUntyped);
    root.style.setProperty('--border-hover', theme.colors.borderHover);

    root.style.setProperty('--color-accent', theme.colors.accentPrimary);
    root.style.setProperty('--color-accent-light', theme.colors.accentLight);
    root.style.setProperty('--color-accent-dark', theme.colors.accentDark);
    root.style.setProperty('--color-bg-primary', theme.colors.background);
    root.style.setProperty('--color-white', theme.colors.foreground);
    root.style.setProperty('--color-box-bg', theme.colors.card);
    root.style.setProperty('--color-box-border', theme.colors.border);

    try {
        localStorage.setItem('selectedTheme', tag);
    } catch (_e) {
    }
}

export { DEFAULT_THEME_SETTINGS };
