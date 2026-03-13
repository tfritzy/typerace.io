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
