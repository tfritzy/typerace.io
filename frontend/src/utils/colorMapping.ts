import { type PlayerColor } from "../types/stdb";
import { getThemeConfig, applyTheme, type ThemeConfig } from "./themes";

export interface ColorConfig {
    primary: string;
    light: string;
    dark: string;
    darker: string;
    darkest: string;
    avatarColors: string[];
    gradient: string;
}

export function getColorConfig(color: PlayerColor): ColorConfig {
    const theme = getThemeConfig(color);
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

export function setAccentColor(color: PlayerColor): void {
    applyTheme(color.tag);
}

export { type ThemeConfig };
