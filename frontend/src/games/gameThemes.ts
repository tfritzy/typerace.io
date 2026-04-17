import type { ThemeSettings } from "../utils/themes";

export interface GameTheme extends ThemeSettings {
    name: string;
}

export const GAME_THEMES: Record<string, GameTheme> = {
    "cosmic-defense": {
        name: "Cosmic Defense",
        backgroundColor: "#0a0210",
        textColor: "#ede4f7",
        borderColor: "rgba(237, 228, 247, 0.14)",
        accentColor: "#fbbf24",
    },
};

export function getGameTheme(slug: string): GameTheme | undefined {
    return GAME_THEMES[slug];
}
