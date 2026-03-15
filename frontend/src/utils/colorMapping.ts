import { getThemeConfig, type ThemeTag } from "./themes";

export interface ColorConfig {
    primary: string;
    light: string;
    dark: string;
    darker: string;
    darkest: string;
    avatarColors: string[];
    gradient: string;
}

export function getColorConfig(tag: ThemeTag): ColorConfig {
    const theme = getThemeConfig(tag);
    return {
        primary: theme.colors.accentPrimary,
        light: theme.colors.accentLight,
        dark: theme.colors.accentDark,
        darker: theme.colors.accentDark,
        darkest: theme.colors.accentDark,
        avatarColors: theme.avatarColors,
        gradient: theme.gradient,
    };
}

const PLAYER_COLOR_HEX: Record<string, string> = {
    Coral: '#E06C75',
    Teal: '#56B6C2',
    Purple: '#C678DD',
    Green: '#98C379',
    Gold: '#E5C07B',
    Blue: '#61AFEF',
};

export function getPlayerColorHex(playerColorTag: string): string {
    return PLAYER_COLOR_HEX[playerColorTag] ?? '#61AFEF';
}

function hexToHsl(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
    return [h * 360, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
    const hNorm = ((h % 360) + 360) % 360 / 360;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
        const k = (n + hNorm * 12) % 12;
        const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function getPlayerAvatarColors(playerColorTag: string): string[] {
    const hex = getPlayerColorHex(playerColorTag);
    const [h, s, l] = hexToHsl(hex);
    return [
        hslToHex(h, s, l),
        hslToHex(h + 20, Math.min(1, s * 0.85), Math.max(0.25, l - 0.12)),
        hslToHex(h - 15, Math.min(1, s * 0.7), Math.max(0.18, l - 0.22)),
    ];
}

export function getPlayerProgressGradient(playerColorTag: string): string {
    const hex = getPlayerColorHex(playerColorTag);
    const [h, s, l] = hexToHsl(hex);
    const darkColor = hslToHex(h, Math.min(1, s * 0.9), Math.max(0.2, l - 0.15));
    return `linear-gradient(to right, ${darkColor}, ${hex})`;
}
