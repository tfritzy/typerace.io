import { type PlayerColor } from "../types/stdb";

export interface GoogleFont {
    name: string;
    category: 'sans-serif' | 'serif' | 'monospace' | 'display';
    weights: number[];
}

export const GOOGLE_FONTS: GoogleFont[] = [
    { name: 'System UI', category: 'sans-serif', weights: [200, 400, 500, 700] },
    { name: 'Inter', category: 'sans-serif', weights: [200, 400, 500, 700] },
    { name: 'Roboto', category: 'sans-serif', weights: [200, 400, 500, 700] },
    { name: 'Open Sans', category: 'sans-serif', weights: [200, 400, 500, 700] },
    { name: 'Nunito', category: 'sans-serif', weights: [200, 400, 500, 700] },
    { name: 'Poppins', category: 'sans-serif', weights: [200, 400, 500, 700] },
    { name: 'Lato', category: 'sans-serif', weights: [200, 400, 700] },
    { name: 'Work Sans', category: 'sans-serif', weights: [200, 400, 500, 700] },
    { name: 'DM Sans', category: 'sans-serif', weights: [200, 400, 500, 700] },
    { name: 'Fira Code', category: 'monospace', weights: [400, 500, 700] },
    { name: 'JetBrains Mono', category: 'monospace', weights: [200, 400, 500, 700] },
    { name: 'Source Code Pro', category: 'monospace', weights: [200, 400, 500, 700] },
    { name: 'IBM Plex Mono', category: 'monospace', weights: [200, 400, 500, 700] },
    { name: 'Space Mono', category: 'monospace', weights: [400, 700] },
    { name: 'Inconsolata', category: 'monospace', weights: [200, 400, 500, 700] },
    { name: 'Merriweather', category: 'serif', weights: [400, 700] },
    { name: 'Playfair Display', category: 'serif', weights: [400, 500, 700] },
    { name: 'Lora', category: 'serif', weights: [400, 500, 700] },
    { name: 'Source Serif 4', category: 'serif', weights: [200, 400, 500, 700] },
    { name: 'Press Start 2P', category: 'display', weights: [400] },
    { name: 'VT323', category: 'display', weights: [400] },
    { name: 'Silkscreen', category: 'display', weights: [400, 700] },
];

const loadedFonts = new Set<string>();

export function loadGoogleFont(fontName: string, weight?: number): void {
    if (fontName === 'System UI') return;
    const font = GOOGLE_FONTS.find(f => f.name === fontName);
    if (!font) return;
    const weights = weight ? [weight] : font.weights;
    const key = `${fontName}:${weights.join(',')}`;
    if (loadedFonts.has(key)) return;
    loadedFonts.add(key);
    const family = fontName.replace(/ /g, '+');
    const wghtParam = weights.join(';');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@${wghtParam}&display=swap`;
    document.head.appendChild(link);
}

export function fontNameToCss(name: string): string {
    if (name === 'System UI') return 'system-ui, sans-serif';
    const font = GOOGLE_FONTS.find(f => f.name === name);
    if (!font) return `'${name}', sans-serif`;
    const fallback = font.category === 'monospace' ? 'monospace'
                   : font.category === 'serif' ? 'serif'
                   : 'sans-serif';
    return `'${name}', ${fallback}`;
}

const MONO_PAIRINGS: Record<string, string> = {
    'System UI': 'JetBrains Mono',
    'Inter': 'JetBrains Mono',
    'Roboto': 'IBM Plex Mono',
    'Open Sans': 'Source Code Pro',
    'Nunito': 'JetBrains Mono',
    'Poppins': 'JetBrains Mono',
    'Lato': 'Source Code Pro',
    'Work Sans': 'IBM Plex Mono',
    'DM Sans': 'JetBrains Mono',
    'Fira Code': 'Fira Code',
    'JetBrains Mono': 'JetBrains Mono',
    'Source Code Pro': 'Source Code Pro',
    'IBM Plex Mono': 'IBM Plex Mono',
    'Space Mono': 'Space Mono',
    'Inconsolata': 'Inconsolata',
    'Merriweather': 'Source Code Pro',
    'Playfair Display': 'Source Code Pro',
    'Lora': 'Source Code Pro',
    'Source Serif 4': 'Source Code Pro',
    'Press Start 2P': 'Press Start 2P',
    'VT323': 'VT323',
    'Silkscreen': 'Silkscreen',
};

export function getMonoPairing(fontName: string): string {
    return MONO_PAIRINGS[fontName] || 'JetBrains Mono';
}

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
    fontName: string;
    font: string;
    monoFontName: string;
    monoFont: string;
    fontWeight: number;
    borderWidth: number;
    borderRadius: number;
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

    const monoFontName = getMonoPairing(settings.font);

    return {
        name,
        mode: isDark ? 'dark' : 'light',
        fontName: settings.font,
        font: fontNameToCss(settings.font),
        monoFontName,
        monoFont: fontNameToCss(monoFontName),
        fontWeight: settings.fontWeight,
        borderWidth: settings.borderWidth,
        borderRadius: settings.borderRadius,
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

const DEFAULT_DARK_THEME_TAG: PlayerColor['tag'] = 'CatppuccinMocha';
const DEFAULT_LIGHT_THEME_TAG: PlayerColor['tag'] = 'GitHubLight';

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    backgroundColor: '#1e1e2e',
    textColor: '#cdd6f4',
    borderColor: 'rgba(205, 214, 244, 0.1)',
    borderWidth: 1,
    borderRadius: 8,
    accentColor: '#cba6f7',
    font: 'Inter',
    fontWeight: 400,
};

export const THEME_PRESETS: Record<PlayerColor['tag'], ThemePreset> = {
    Dracula: {
        name: 'Dracula',
        backgroundColor: '#282a36',
        textColor: '#f8f8f2',
        borderColor: 'rgba(248, 248, 242, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#bd93f9',
        font: 'Fira Code',
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
        font: 'Source Code Pro',
        fontWeight: 400,
        previewColors: ['#272822', '#a6e22e', '#f92672', '#66d9ef'],
    },
    Nord: {
        name: 'Nord',
        backgroundColor: '#2e3440',
        textColor: '#eceff4',
        borderColor: 'rgba(236, 239, 244, 0.1)',
        borderWidth: 1,
        borderRadius: 12,
        accentColor: '#88c0d0',
        font: 'Inter',
        fontWeight: 400,
        previewColors: ['#2e3440', '#88c0d0', '#81a1c1', '#5e81ac'],
    },
    TokyoNight: {
        name: 'Tokyo Night',
        backgroundColor: '#1a1b26',
        textColor: '#a9b1d6',
        borderColor: 'rgba(169, 177, 214, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#7aa2f7',
        font: 'Inter',
        fontWeight: 400,
        previewColors: ['#1a1b26', '#7aa2f7', '#bb9af7', '#7dcfff'],
    },
    GruvboxDark: {
        name: 'Gruvbox Dark',
        backgroundColor: '#282828',
        textColor: '#ebdbb2',
        borderColor: 'rgba(235, 219, 178, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#fabd2f',
        font: 'Inter',
        fontWeight: 400,
        previewColors: ['#282828', '#fabd2f', '#b8bb26', '#fb4934'],
    },
    CatppuccinMocha: {
        name: 'Catppuccin Mocha',
        backgroundColor: '#1e1e2e',
        textColor: '#cdd6f4',
        borderColor: 'rgba(205, 214, 244, 0.1)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#cba6f7',
        font: 'Inter',
        fontWeight: 400,
        previewColors: ['#1e1e2e', '#cba6f7', '#89b4fa', '#a6e3a1'],
    },
    GitHubLight: {
        name: 'GitHub Light',
        backgroundColor: '#ffffff',
        textColor: '#1f2328',
        borderColor: 'rgba(31, 35, 40, 0.25)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#0969da',
        font: 'Inter',
        fontWeight: 400,
        previewColors: ['#ffffff', '#0969da', '#1a7f37', '#d1242f'],
    },
    SolarizedLight: {
        name: 'Solarized Light',
        backgroundColor: '#fdf6e3',
        textColor: '#657b83',
        borderColor: 'rgba(101, 123, 131, 0.25)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#268bd2',
        font: 'Inter',
        fontWeight: 400,
        previewColors: ['#fdf6e3', '#268bd2', '#2aa198', '#b58900'],
    },
    OneLight: {
        name: 'One Light',
        backgroundColor: '#fafafa',
        textColor: '#383a42',
        borderColor: 'rgba(56, 58, 66, 0.25)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#4078f2',
        font: 'Inter',
        fontWeight: 400,
        previewColors: ['#fafafa', '#4078f2', '#50a14f', '#e45649'],
    },
    CatppuccinLatte: {
        name: 'Catppuccin Latte',
        backgroundColor: '#eff1f5',
        textColor: '#4c4f69',
        borderColor: 'rgba(76, 79, 105, 0.25)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#8839ef',
        font: 'Nunito',
        fontWeight: 400,
        previewColors: ['#eff1f5', '#8839ef', '#1e66f5', '#40a02b'],
    },
    GruvboxLight: {
        name: 'Gruvbox Light',
        backgroundColor: '#fbf1c7',
        textColor: '#3c3836',
        borderColor: 'rgba(60, 56, 54, 0.25)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#b57614',
        font: 'Inter',
        fontWeight: 400,
        previewColors: ['#fbf1c7', '#b57614', '#79740e', '#9d0006'],
    },
    RosePineDawn: {
        name: 'Rosé Pine Dawn',
        backgroundColor: '#faf4ed',
        textColor: '#575279',
        borderColor: 'rgba(87, 82, 121, 0.25)',
        borderWidth: 1,
        borderRadius: 8,
        accentColor: '#907aa9',
        font: 'Lora',
        fontWeight: 400,
        previewColors: ['#faf4ed', '#907aa9', '#d7827e', '#56949f'],
    },
    Mainframe: {
        name: 'Mainframe',
        backgroundColor: '#0a0a0a',
        textColor: '#33ff33',
        borderColor: '#33ff33',
        borderWidth: 2,
        borderRadius: 0,
        accentColor: '#33ff33',
        font: 'Press Start 2P',
        fontWeight: 700,
        previewColors: ['#0a0a0a', '#33ff33', '#00cc00', '#009900'],
    },
    Cyberdeck: {
        name: 'Cyberdeck',
        backgroundColor: '#000033',
        textColor: '#00ccff',
        borderColor: '#0066ff',
        borderWidth: 2,
        borderRadius: 0,
        accentColor: '#00ccff',
        font: 'VT323',
        fontWeight: 700,
        previewColors: ['#000033', '#00ccff', '#0066ff', '#ff6600'],
    },
    RedAlert: {
        name: 'Red Alert',
        backgroundColor: '#1a0000',
        textColor: '#ff4444',
        borderColor: '#ff4444',
        borderWidth: 2,
        borderRadius: 0,
        accentColor: '#ff4444',
        font: 'Silkscreen',
        fontWeight: 700,
        previewColors: ['#1a0000', '#ff4444', '#ff8800', '#ffcc00'],
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
    loadGoogleFont(theme.fontName, theme.fontWeight);
    if (theme.monoFontName !== theme.fontName) {
        loadGoogleFont(theme.monoFontName);
    }
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

    root.style.setProperty('--font-family', theme.font);
    root.style.setProperty('--font-family-mono', theme.monoFont);
    root.style.setProperty('--font-weight', String(theme.fontWeight));
    root.style.setProperty('--border-width', `${theme.borderWidth}px`);
    root.style.setProperty('--radius', `${theme.borderRadius}px`);

    try {
        localStorage.setItem('selectedTheme', tag);
    } catch (_e) {
    }
}

export { DEFAULT_THEME_SETTINGS };
