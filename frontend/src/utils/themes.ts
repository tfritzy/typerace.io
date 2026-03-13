export type ThemeTag =
    | 'Dracula'
    | 'Monokai'
    | 'Nord'
    | 'TokyoNight'
    | 'GruvboxDark'
    | 'CatppuccinMocha'
    | 'GitHubLight'
    | 'SolarizedLight'
    | 'OneLight'
    | 'CatppuccinLatte'
    | 'GruvboxLight'
    | 'RosePineDawn'
    | 'Pico8'
    | 'Endesga'
    | 'Sweetie16';

export interface ThemeSettings {
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    accentColor: string;
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
    const background = isDark ? settings.backgroundColor : adjustBrightness(settings.backgroundColor, -10);
    const card = isDark ? adjustBrightness(settings.backgroundColor, 12) : settings.backgroundColor;
    const popover = isDark ? adjustBrightness(settings.backgroundColor, 20) : settings.backgroundColor;
    const input = isDark ? adjustBrightness(settings.backgroundColor, -8) : adjustBrightness(settings.backgroundColor, -5);
    const accentLight = adjustAccent(settings.accentColor, 0.2);
    const accentDark = adjustAccent(settings.accentColor, -0.25);
    const contrastForAccent = luminance(settings.accentColor) > 0.5 ? '#000000' : '#ffffff';

    return {
        name,
        mode: isDark ? 'dark' : 'light',
        colors: {
            background,
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

const DEFAULT_DARK_THEME_TAG: ThemeTag = 'GruvboxDark';
const DEFAULT_LIGHT_THEME_TAG: ThemeTag = 'GruvboxLight';

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    backgroundColor: '#282828',
    textColor: '#ebdbb2',
    borderColor: 'rgba(235, 219, 178, 0.1)',
    accentColor: '#fabd2f',
};

export const THEME_PRESETS: Record<ThemeTag, ThemePreset> = {
    Dracula: {
        name: 'Dracula',
        backgroundColor: '#282a36',
        textColor: '#f8f8f2',
        borderColor: 'rgba(248, 248, 242, 0.1)',
        accentColor: '#bd93f9',
        previewColors: ['#282a36', '#bd93f9', '#ff79c6', '#50fa7b'],
    },
    Monokai: {
        name: 'Monokai',
        backgroundColor: '#272822',
        textColor: '#f8f8f2',
        borderColor: 'rgba(248, 248, 242, 0.1)',
        accentColor: '#a6e22e',
        previewColors: ['#272822', '#a6e22e', '#f92672', '#66d9ef'],
    },
    Nord: {
        name: 'Nord',
        backgroundColor: '#2e3440',
        textColor: '#eceff4',
        borderColor: 'rgba(236, 239, 244, 0.1)',
        accentColor: '#88c0d0',
        previewColors: ['#2e3440', '#88c0d0', '#81a1c1', '#5e81ac'],
    },
    TokyoNight: {
        name: 'Tokyo Night',
        backgroundColor: '#1a1b26',
        textColor: '#a9b1d6',
        borderColor: 'rgba(169, 177, 214, 0.1)',
        accentColor: '#7aa2f7',
        previewColors: ['#1a1b26', '#7aa2f7', '#bb9af7', '#7dcfff'],
    },
    GruvboxDark: {
        name: 'Gruvbox Dark',
        backgroundColor: '#282828',
        textColor: '#ebdbb2',
        borderColor: 'rgba(235, 219, 178, 0.1)',
        accentColor: '#fabd2f',
        previewColors: ['#282828', '#fabd2f', '#b8bb26', '#fb4934'],
    },
    CatppuccinMocha: {
        name: 'Catppuccin Mocha',
        backgroundColor: '#1e1e2e',
        textColor: '#cdd6f4',
        borderColor: 'rgba(205, 214, 244, 0.1)',
        accentColor: '#cba6f7',
        previewColors: ['#1e1e2e', '#cba6f7', '#89b4fa', '#a6e3a1'],
    },
    GitHubLight: {
        name: 'GitHub Light',
        backgroundColor: '#ffffff',
        textColor: '#1f2328',
        borderColor: 'rgba(31, 35, 40, 0.25)',
        accentColor: '#0969da',
        previewColors: ['#ffffff', '#0969da', '#1a7f37', '#d1242f'],
    },
    SolarizedLight: {
        name: 'Solarized Light',
        backgroundColor: '#fdf6e3',
        textColor: '#657b83',
        borderColor: 'rgba(101, 123, 131, 0.25)',
        accentColor: '#268bd2',
        previewColors: ['#fdf6e3', '#268bd2', '#2aa198', '#b58900'],
    },
    OneLight: {
        name: 'One Light',
        backgroundColor: '#fafafa',
        textColor: '#383a42',
        borderColor: 'rgba(56, 58, 66, 0.25)',
        accentColor: '#4078f2',
        previewColors: ['#fafafa', '#4078f2', '#50a14f', '#e45649'],
    },
    CatppuccinLatte: {
        name: 'Catppuccin Latte',
        backgroundColor: '#eff1f5',
        textColor: '#4c4f69',
        borderColor: 'rgba(76, 79, 105, 0.25)',
        accentColor: '#8839ef',
        previewColors: ['#eff1f5', '#8839ef', '#1e66f5', '#40a02b'],
    },
    GruvboxLight: {
        name: 'Gruvbox Light',
        backgroundColor: '#fbf1c7',
        textColor: '#3c3836',
        borderColor: 'rgba(60, 56, 54, 0.25)',
        accentColor: '#b57614',
        previewColors: ['#fbf1c7', '#b57614', '#79740e', '#9d0006'],
    },
    RosePineDawn: {
        name: 'Rosé Pine Dawn',
        backgroundColor: '#faf4ed',
        textColor: '#575279',
        borderColor: 'rgba(87, 82, 121, 0.25)',
        accentColor: '#907aa9',
        previewColors: ['#faf4ed', '#907aa9', '#d7827e', '#56949f'],
    },
    Pico8: {
        name: 'PICO-8',
        backgroundColor: '#1D2B53',
        textColor: '#FFF1E8',
        borderColor: 'rgba(255, 241, 232, 0.20)',
        accentColor: '#29ADFF',
        previewColors: ['#1D2B53', '#FFF1E8', '#29ADFF', '#FF77A8'],
    },
    Endesga: {
        name: 'Endesga 32',
        backgroundColor: '#10141f',
        textColor: '#c5dbd4',
        borderColor: 'rgba(197, 219, 212, 0.20)',
        accentColor: '#f77622',
        previewColors: ['#10141f', '#c5dbd4', '#f77622', '#e43b44'],
    },
    Sweetie16: {
        name: 'Sweetie 16',
        backgroundColor: '#1a1c2c',
        textColor: '#f4f4f4',
        borderColor: 'rgba(244, 244, 244, 0.20)',
        accentColor: '#b13e53',
        previewColors: ['#1a1c2c', '#f4f4f4', '#b13e53', '#41a6f6'],
    },
};

export const THEMES: Record<ThemeTag, ResolvedTheme> = Object.fromEntries(
    Object.entries(THEME_PRESETS).map(([key, preset]) => [
        key,
        resolveTheme(preset, preset.name, preset.previewColors),
    ])
) as Record<ThemeTag, ResolvedTheme>;

export function resolveCustomTheme(settings: ThemeSettings): ResolvedTheme {
    return resolveTheme(settings, 'Custom', [settings.backgroundColor, settings.accentColor]);
}

export function getThemeConfig(tag: ThemeTag): ThemeConfig {
    if (tag in THEMES) {
        return THEMES[tag];
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
        theme = THEMES[colorTag as ThemeTag];
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
    const fg = hexToRgb(theme.colors.foreground);

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
    const ioOpacity = theme.mode === 'light' ? 0.45 : 0.25;
    root.style.setProperty('--color-white-25', `rgba(${fg.r}, ${fg.g}, ${fg.b}, ${ioOpacity})`);
    root.style.setProperty('--color-box-bg', theme.colors.card);
    root.style.setProperty('--color-box-border', theme.colors.border);

    root.style.setProperty('--avatar-color-1', theme.avatarColors[0]);
    root.style.setProperty('--avatar-color-2', theme.avatarColors[1]);
    root.style.setProperty('--avatar-color-3', theme.avatarColors[2]);

    root.style.setProperty('--border-width', '1px');
    root.style.setProperty('--radius', '8px');

    root.dataset.mode = theme.mode;

    try {
        localStorage.setItem('selectedTheme', tag);
    } catch (_e) {
    }

    window.dispatchEvent(new Event('themechange'));
}

export { DEFAULT_THEME_SETTINGS };
