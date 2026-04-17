import { useEffect } from "react";
import { applyThemeOverride, restoreSelectedTheme } from "../utils/themes";
import type { GameTheme } from "./gameThemes";

export function useGameTheme(theme: GameTheme | undefined): void {
    useEffect(() => {
        if (!theme) return;
        applyThemeOverride(
            {
                backgroundColor: theme.backgroundColor,
                textColor: theme.textColor,
                borderColor: theme.borderColor,
                accentColor: theme.accentColor,
            },
            `game:${theme.name}`
        );
        return () => {
            restoreSelectedTheme();
        };
    }, [theme]);
}
