export type ThemeTag =
  | "Dracula"
  | "Cobalt2"
  | "EverforestDark"
  | "GitHubDarkDimmed"
  | "NightOwl"
  | "Monokai"
  | "Nord"
  | "TokyoNight"
  | "GruvboxDark"
  | "CatppuccinMocha"
  | "OneDark"
  | "AyuDark"
  | "Kanagawa"
  | "Pico8"
  | "Endesga"
  | "Sweetie16";

export interface ThemeSettings {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderHoverColor?: string;
  accentColor: string;
}

export interface ThemePreset extends ThemeSettings {
  name: string;
  previewColors: string[];
}

export interface ResolvedTheme {
  name: string;
  mode: "light" | "dark";
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
  const h = hex.replace("#", "");
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
  return `#${clamp(r + amount)
    .toString(16)
    .padStart(2, "0")}${clamp(g + amount)
    .toString(16)
    .padStart(2, "0")}${clamp(b + amount)
    .toString(16)
    .padStart(2, "0")}`;
}

function adjustAccent(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  if (amount > 0) {
    return `#${clamp(r + (255 - r) * amount)
      .toString(16)
      .padStart(2, "0")}${clamp(g + (255 - g) * amount)
      .toString(16)
      .padStart(2, "0")}${clamp(b + (255 - b) * amount)
      .toString(16)
      .padStart(2, "0")}`;
  }
  const factor = 1 + amount;
  return `#${clamp(r * factor)
    .toString(16)
    .padStart(2, "0")}${clamp(g * factor)
    .toString(16)
    .padStart(2, "0")}${clamp(b * factor)
    .toString(16)
    .padStart(2, "0")}`;
}

export function resolveTheme(
  settings: ThemeSettings,
  name: string,
  previewColors: string[],
): ResolvedTheme {
  const isDark = luminance(settings.backgroundColor) < 0.5;
  const fg = hexToRgb(settings.textColor);
  const fgRgba = `${fg.r}, ${fg.g}, ${fg.b}`;
  const background = isDark
    ? settings.backgroundColor
    : adjustBrightness(settings.backgroundColor, -10);
  const card = isDark
    ? adjustBrightness(settings.backgroundColor, 12)
    : settings.backgroundColor;
  const popover = isDark
    ? adjustBrightness(settings.backgroundColor, 20)
    : settings.backgroundColor;
  const input = isDark
    ? adjustBrightness(settings.backgroundColor, -8)
    : adjustBrightness(settings.backgroundColor, -5);
  const accentLight = adjustAccent(settings.accentColor, 0.2);
  const accentDark = adjustAccent(settings.accentColor, -0.25);
  const contrastForAccent =
    luminance(settings.accentColor) > 0.5 ? "#000000" : "#ffffff";

  return {
    name,
    mode: isDark ? "dark" : "light",
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
      secondaryForeground: isDark
        ? `rgba(${fgRgba}, 0.9)`
        : `rgba(${fgRgba}, 0.8)`,
      muted: `rgba(${fgRgba}, 0.04)`,
      mutedForeground: `rgba(${fgRgba}, 0.5)`,
      accent: settings.accentColor,
      accentForeground: contrastForAccent,
      accentPrimary: settings.accentColor,
      accentLight,
      accentDark,
      destructive: isDark ? "#f85149" : "#d1242f",
      destructiveForeground: isDark ? settings.textColor : "#ffffff",
      border: settings.borderColor,
      input,
      ring: settings.accentColor,
      gridLine: `rgba(${fgRgba}, 0.06)`,
      textCompleted: isDark ? `rgba(${fgRgba}, 0.15)` : `rgba(${fgRgba}, 0.2)`,
      textUntyped: isDark ? `rgba(${fgRgba}, 0.35)` : `rgba(${fgRgba}, 0.4)`,
      borderHover:
        settings.borderHoverColor ?? `rgba(${fgRgba}, 0.25)`,
    },
    avatarColors: [settings.accentColor, accentDark, isDark ? popover : card],
    previewColors,
    gradient: `linear-gradient(to right, ${accentDark}, ${settings.accentColor})`,
  };
}

const DEFAULT_THEME_TAG: ThemeTag = "Kanagawa";

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  backgroundColor: "#282828",
  textColor: "#ebdbb2",
  borderColor: "rgba(235, 219, 178, 0.1)",
  accentColor: "#fabd2f",
};

export const THEME_PRESETS: Record<ThemeTag, ThemePreset> = {
  EverforestDark: {
    name: "Everforest Dark",
    backgroundColor: "#2d353b",
    textColor: "#d3c6aa",
    borderColor: "#475258",
    accentColor: "#a7c080",
    previewColors: ["#2d353b", "#a7c080", "#7fbbb3", "#e67e80"],
  },
  GitHubDarkDimmed: {
    name: "GitHub Dark",
    backgroundColor: "#22272e",
    textColor: "#adbac7",
    borderColor: "#444c56",
    accentColor: "#57ab5a",
    previewColors: ["#22272e", "#57ab5a", "#539bf5", "#986ee2"],
  },
  NightOwl: {
    name: "Night Owl",
    backgroundColor: "#011627",
    textColor: "#d6deeb",
    borderColor: "#122d42",
    accentColor: "#82aaff",
    previewColors: ["#011627", "#82aaff", "#c792ea", "#7fdbca"],
  },
  Cobalt2: {
    name: "Cobalt2",
    backgroundColor: "#122738",
    textColor: "#ffffff",
    borderColor: "#0d3a58",
    borderHoverColor: "#ffc600",
    accentColor: "#ffc600",
    previewColors: ["#122738", "#ffc600", "#0088ff", "#ff628c"],
  },
  Dracula: {
    name: "Dracula",
    backgroundColor: "#282a36",
    textColor: "#f8f8f2",
    borderColor: "rgba(248, 248, 242, 0.1)",
    accentColor: "#bd93f9",
    previewColors: ["#282a36", "#bd93f9", "#ff79c6", "#50fa7b"],
  },
  Monokai: {
    name: "Monokai",
    backgroundColor: "#272822",
    textColor: "#f8f8f2",
    borderColor: "rgba(248, 248, 242, 0.1)",
    accentColor: "#a6e22e",
    previewColors: ["#272822", "#a6e22e", "#f92672", "#66d9ef"],
  },
  Nord: {
    name: "Nord",
    backgroundColor: "#2e3440",
    textColor: "#eceff4",
    borderColor: "rgba(236, 239, 244, 0.1)",
    accentColor: "#88c0d0",
    previewColors: ["#2e3440", "#88c0d0", "#81a1c1", "#5e81ac"],
  },
  TokyoNight: {
    name: "Tokyo Night",
    backgroundColor: "#1a1b26",
    textColor: "#a9b1d6",
    borderColor: "rgba(169, 177, 214, 0.1)",
    accentColor: "#7aa2f7",
    previewColors: ["#1a1b26", "#7aa2f7", "#bb9af7", "#7dcfff"],
  },
  GruvboxDark: {
    name: "Gruvbox Dark",
    backgroundColor: "#282828",
    textColor: "#ebdbb2",
    borderColor: "rgba(235, 219, 178, 0.1)",
    accentColor: "#fabd2f",
    previewColors: ["#282828", "#fabd2f", "#b8bb26", "#fb4934"],
  },
  CatppuccinMocha: {
    name: "Catppuccin Mocha",
    backgroundColor: "#1e1e2e",
    textColor: "#cdd6f4",
    borderColor: "rgba(205, 214, 244, 0.1)",
    accentColor: "#cba6f7",
    previewColors: ["#1e1e2e", "#cba6f7", "#89b4fa", "#a6e3a1"],
  },
  OneDark: {
    name: "One Dark",
    backgroundColor: "#282c34",
    textColor: "#abb2bf",
    borderColor: "rgba(171, 178, 191, 0.1)",
    accentColor: "#61afef",
    previewColors: ["#282c34", "#61afef", "#c678dd", "#98c379"],
  },
  AyuDark: {
    name: "Ayu Dark",
    backgroundColor: "#0d1017",
    textColor: "#bfbdb6",
    borderColor: "rgba(191, 189, 182, 0.1)",
    accentColor: "#e6b450",
    previewColors: ["#0d1017", "#e6b450", "#39bae6", "#aad94c"],
  },
  Kanagawa: {
    name: "Kanagawa",
    backgroundColor: "#1f1f28",
    textColor: "#dcd7ba",
    borderColor: "rgba(220, 215, 186, 0.1)",
    accentColor: "#7e9cd8",
    previewColors: ["#1f1f28", "#7e9cd8", "#957fb8", "#98bb6c"],
  },
  Pico8: {
    name: "PICO-8",
    backgroundColor: "#1D2B53",
    textColor: "#FFF1E8",
    borderColor: "rgba(255, 241, 232, 0.20)",
    accentColor: "#29ADFF",
    previewColors: ["#1D2B53", "#FFF1E8", "#29ADFF", "#FF77A8"],
  },
  Endesga: {
    name: "Endesga 32",
    backgroundColor: "#10141f",
    textColor: "#c5dbd4",
    borderColor: "rgba(197, 219, 212, 0.20)",
    accentColor: "#f77622",
    previewColors: ["#10141f", "#c5dbd4", "#f77622", "#e43b44"],
  },
  Sweetie16: {
    name: "Sweetie 16",
    backgroundColor: "#1a1c2c",
    textColor: "#f4f4f4",
    borderColor: "rgba(244, 244, 244, 0.20)",
    accentColor: "#b13e53",
    previewColors: ["#1a1c2c", "#f4f4f4", "#b13e53", "#41a6f6"],
  },
};

export const THEMES: Record<ThemeTag, ResolvedTheme> = Object.fromEntries(
  Object.entries(THEME_PRESETS).map(([key, preset]) => [
    key,
    resolveTheme(preset, preset.name, preset.previewColors),
  ]),
) as Record<ThemeTag, ResolvedTheme>;

export function resolveCustomTheme(settings: ThemeSettings): ResolvedTheme {
  return resolveTheme(settings, "Custom", [
    settings.backgroundColor,
    settings.accentColor,
  ]);
}

export function getThemeConfig(tag: ThemeTag): ThemeConfig {
  if (tag in THEMES) {
    return THEMES[tag];
  }
  return THEMES[DEFAULT_THEME_TAG];
}

export function getInitialTheme(): string {
  try {
    const saved = localStorage.getItem("selectedTheme");
    if (saved && saved in THEMES) return saved;
    const custom = localStorage.getItem("customTheme");
    if (custom) return "custom";
  } catch (_e) {}

  return DEFAULT_THEME_TAG;
}

export function getCustomThemeSettings(): ThemeSettings | null {
  try {
    const raw = localStorage.getItem("customTheme");
    if (raw) return JSON.parse(raw) as ThemeSettings;
  } catch (_e) {}
  return null;
}

export function applyTheme(colorTag: string): void {
  applyThemeByTag(colorTag, true);
}

export function previewTheme(colorTag: string): void {
  applyThemeByTag(colorTag, false);
}

function applyThemeByTag(colorTag: string, persist: boolean): void {
  let theme: ResolvedTheme;
  if (colorTag === "custom") {
    const custom = getCustomThemeSettings();
    theme = custom ? resolveCustomTheme(custom) : THEMES[DEFAULT_THEME_TAG];
  } else if (colorTag in THEMES) {
    theme = THEMES[colorTag as ThemeTag];
  } else {
    theme = THEMES[DEFAULT_THEME_TAG];
  }
  applyResolvedTheme(theme, colorTag, persist);
}

export function applyCustomTheme(settings: ThemeSettings): void {
  const theme = resolveCustomTheme(settings);
  try {
    localStorage.setItem("customTheme", JSON.stringify(settings));
  } catch (_e) {}
  applyResolvedTheme(theme, "custom");
}

// "tr" lettermark in Leckerli One, converted to a path so the favicon
// renders without needing the font to be loaded.
const FAVICON_GLYPH_PATH =
  "m 96.280383,367.24 q -4.84,-11.88 -7.04,-27.28 -2.2,-15.84 -2.2,-44 0,-28.16 10.56,-76.12 h -19.8 q -5.28,0 -5.28,-4.4 0,-10.56 1.76,-17.16 2.2,-7.04 9.68,-15.84 h 10.56 q 6.159997,0 13.199997,-0.44 21.12,-67.76 43.12,-67.76 17.6,0.44 24.64,22.44 1.76,6.16 3.96,13.2 l -18.04,31.68 q 30.8,0.88 38.72,0.88 8.36,0 8.8,1.76 0.88,1.32 0.88,4.4 0,7.92 -3.96,19.8 -3.52,11.88 -8.36,11.44 l -44,-2.2 q -9.24,53.68 -9.24,88.88 0,35.2 10.12,35.2 8.36,0 30.36,-13.64 22,-14.08 31.68,-26.84 9.68,-12.76 15.84,-12.76 6.16,0 6.16,14.96 0,14.96 -10.56,30.8 -10.56,15.4 -26.84,28.6 -15.84,12.76 -35.64,21.12 -19.36,8.36 -33.88,8.36 -14.52,0 -22.44,-6.6 -7.48,-7.04 -12.759997,-18.48 z m 184.359747,-50.16 2.64,53.68 q 0,10.56 -11,18.92 -11,8.36 -29.92,8.36 -11,0 -15.4,-11.44 -3.96,-11.44 -3.96,-33.44 0,-46.2 4.4,-72.16 4.84,-26.4 18.48,-53.24 -20.24,-19.36 -20.24,-33.44 0,-29.48 31.68,-29.48 16.28,0 28.6,17.16 8.8,11.88 12.76,27.72 6.16,2.2 15.4,2.2 12.76,0 29.48,-8.36 l 11.44,-5.72 q 5.28,-2.64 9.24,-2.64 12.76,0 25.52,37.4 -3.96,17.16 -8.8,33 -4.4,15.84 -10.56,38.28 -6.16,22.44 -6.6,30.36 0,7.48 4.84,7.48 6.6,0 16.28,-8.36 9.68,-8.36 19.36,-18.04 9.68,-10.12 17.6,-18.48 8.36,-8.36 11.44,-8.36 6.16,0 6.16,14.96 0,30.36 -26.84,59.84 -26.4,29.48 -60.72,29.04 -20.24,0 -30.36,-16.28 -10.12,-16.28 -10.56,-39.6 0,-46.2 20.68,-87.56 -9.68,3.96 -22,3.96 -11.88,0 -17.16,-0.88 -3.96,16.72 -7.92,33.88 -3.96,16.72 -3.96,31.24 z";

function updateFavicon(theme: ResolvedTheme): void {
  const favicon = document.querySelector<HTMLLinkElement>("#theme-favicon");
  if (!favicon) return;

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
    `<rect width="512" height="512" fill="${theme.colors.background}"/>`,
    `<path d="${FAVICON_GLYPH_PATH}" fill="${theme.colors.accentPrimary}"/>`,
    "</svg>",
  ].join("");

  favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function applyResolvedTheme(
  theme: ResolvedTheme,
  tag: string,
  persist = true,
): void {
  const root = document.documentElement;
  const fg = hexToRgb(theme.colors.foreground);

  root.style.setProperty("--background", theme.colors.background);
  root.style.setProperty("--foreground", theme.colors.foreground);
  root.style.setProperty("--card", theme.colors.card);
  root.style.setProperty("--card-foreground", theme.colors.cardForeground);
  root.style.setProperty("--popover", theme.colors.popover);
  root.style.setProperty(
    "--popover-foreground",
    theme.colors.popoverForeground,
  );
  root.style.setProperty("--primary", theme.colors.primary);
  root.style.setProperty(
    "--primary-foreground",
    theme.colors.primaryForeground,
  );
  root.style.setProperty("--secondary", theme.colors.secondary);
  root.style.setProperty(
    "--secondary-foreground",
    theme.colors.secondaryForeground,
  );
  root.style.setProperty("--muted", theme.colors.muted);
  root.style.setProperty("--muted-foreground", theme.colors.mutedForeground);
  root.style.setProperty("--accent", theme.colors.accent);
  root.style.setProperty("--accent-foreground", theme.colors.accentForeground);
  root.style.setProperty("--accent-primary", theme.colors.accentPrimary);
  root.style.setProperty("--accent-light", theme.colors.accentLight);
  root.style.setProperty("--accent-dark", theme.colors.accentDark);
  root.style.setProperty("--destructive", theme.colors.destructive);
  root.style.setProperty(
    "--destructive-foreground",
    theme.colors.destructiveForeground,
  );
  root.style.setProperty("--border", theme.colors.border);
  root.style.setProperty("--input", theme.colors.input);
  root.style.setProperty("--ring", theme.colors.ring);
  root.style.setProperty("--grid-line", theme.colors.gridLine);
  root.style.setProperty("--text-completed", theme.colors.textCompleted);
  root.style.setProperty("--text-untyped", theme.colors.textUntyped);
  root.style.setProperty("--border-hover", theme.colors.borderHover);

  root.style.setProperty("--color-accent", theme.colors.accentPrimary);
  root.style.setProperty("--color-accent-light", theme.colors.accentLight);
  root.style.setProperty("--color-accent-dark", theme.colors.accentDark);
  root.style.setProperty("--color-bg-primary", theme.colors.background);
  root.style.setProperty("--color-white", theme.colors.foreground);
  const ioOpacity = theme.mode === "light" ? 0.45 : 0.25;
  root.style.setProperty(
    "--color-white-25",
    `rgba(${fg.r}, ${fg.g}, ${fg.b}, ${ioOpacity})`,
  );
  root.style.setProperty("--color-box-bg", theme.colors.card);
  root.style.setProperty("--color-box-border", theme.colors.border);

  root.style.setProperty("--avatar-color-1", theme.avatarColors[0]);
  root.style.setProperty("--avatar-color-2", theme.avatarColors[1]);
  root.style.setProperty("--avatar-color-3", theme.avatarColors[2]);

  root.style.setProperty("--border-width", "1px");
  root.style.setProperty("--radius", "8px");

  root.dataset.mode = theme.mode;
  updateFavicon(theme);

  if (persist) {
    try {
      localStorage.setItem("selectedTheme", tag);
    } catch (_e) {}
  }

  window.dispatchEvent(new Event("themechange"));
}

export { DEFAULT_THEME_SETTINGS };
