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
  Coral: "#E06C75",
  Red: "#EF4444",
  Orange: "#F97316",
  Rose: "#F43F5E",
  Teal: "#56B6C2",
  Cyan: "#06B6D4",
  Purple: "#C678DD",
  Violet: "#8B5CF6",
  Indigo: "#6366F1",
  Fuchsia: "#D946EF",
  Pink: "#EC4899",
  Green: "#98C379",
  Lime: "#84CC16",
  Emerald: "#10B981",
  Gold: "#E5C07B",
  Amber: "#F59E0B",
  Yellow: "#EAB308",
  Blue: "#61AFEF",
  Sky: "#0EA5E9",
};

const THEME_PLAYER_COLORS: Record<ThemeTag, Record<string, string>> = {
  OneDark: { ...PLAYER_COLOR_HEX },
  Dracula: {
    Coral: "#ff6e6e",
    Red: "#ff5555",
    Orange: "#ffb86c",
    Rose: "#ff79c6",
    Teal: "#50e8c0",
    Cyan: "#8be9fd",
    Purple: "#bd93f9",
    Violet: "#9580ff",
    Indigo: "#7070f1",
    Fuchsia: "#e466ff",
    Pink: "#ff92d0",
    Green: "#50fa7b",
    Lime: "#88ff70",
    Emerald: "#3ce8a0",
    Gold: "#f0d878",
    Amber: "#ffd580",
    Yellow: "#f1fa8c",
    Blue: "#6e9eff",
    Sky: "#62d6ff",
  },
  Monokai: {
    Coral: "#ff6b6b",
    Red: "#f92672",
    Orange: "#fd971f",
    Rose: "#ff4488",
    Teal: "#4ec9b0",
    Cyan: "#66d9ef",
    Purple: "#ae81ff",
    Violet: "#9966ff",
    Indigo: "#6666ff",
    Fuchsia: "#e040e0",
    Pink: "#ff6eb4",
    Green: "#a6e22e",
    Lime: "#c0ff40",
    Emerald: "#30d080",
    Gold: "#d4c060",
    Amber: "#ffa940",
    Yellow: "#e6db74",
    Blue: "#5599ee",
    Sky: "#55c8e8",
  },
  Nord: {
    Coral: "#d4727c",
    Red: "#bf616a",
    Orange: "#d08770",
    Rose: "#c46070",
    Teal: "#8fbcbb",
    Cyan: "#93d3e4",
    Purple: "#b48ead",
    Violet: "#a08cc0",
    Indigo: "#7b88b0",
    Fuchsia: "#c47aaf",
    Pink: "#c28097",
    Green: "#a3be8c",
    Lime: "#b4c87a",
    Emerald: "#7db89b",
    Gold: "#d9b878",
    Amber: "#d9a76a",
    Yellow: "#ebcb8b",
    Blue: "#81a1c1",
    Sky: "#5e81ac",
  },
  TokyoNight: {
    Coral: "#f0776f",
    Red: "#f7768e",
    Orange: "#ff9e64",
    Rose: "#f24e8f",
    Teal: "#73daca",
    Cyan: "#2ac3de",
    Purple: "#bb9af7",
    Violet: "#9d7cf4",
    Indigo: "#7b7ff0",
    Fuchsia: "#d465e8",
    Pink: "#f589b5",
    Green: "#9ece6a",
    Lime: "#b5e046",
    Emerald: "#53d68a",
    Gold: "#d4a050",
    Amber: "#f0a848",
    Yellow: "#e0af68",
    Blue: "#7aa2f7",
    Sky: "#7dcfff",
  },
  GruvboxDark: {
    Coral: "#f06858",
    Red: "#fb4934",
    Orange: "#fe8019",
    Rose: "#d65080",
    Teal: "#689d6a",
    Cyan: "#8ec07c",
    Purple: "#d3869b",
    Violet: "#b16286",
    Indigo: "#7060a8",
    Fuchsia: "#cc60a0",
    Pink: "#e49090",
    Green: "#b8bb26",
    Lime: "#c8cc3a",
    Emerald: "#6aab70",
    Gold: "#d9b030",
    Amber: "#e09030",
    Yellow: "#fabd2f",
    Blue: "#83a598",
    Sky: "#7dbbaa",
  },
  CatppuccinMocha: {
    Coral: "#eba0ac",
    Red: "#f38ba8",
    Orange: "#fab387",
    Rose: "#e88da0",
    Teal: "#94e2d5",
    Cyan: "#89dceb",
    Purple: "#cba6f7",
    Violet: "#b4befe",
    Indigo: "#7287d6",
    Fuchsia: "#e0a0e8",
    Pink: "#f5c2e7",
    Green: "#a6e3a1",
    Lime: "#c0ea90",
    Emerald: "#6dd8a0",
    Gold: "#e8c878",
    Amber: "#f0a860",
    Yellow: "#f9e2af",
    Blue: "#89b4fa",
    Sky: "#74c7ec",
  },
  RosePine: {
    Coral: "#e0727e",
    Red: "#eb6f92",
    Orange: "#ea9d6f",
    Rose: "#ebbcba",
    Teal: "#6db5a8",
    Cyan: "#9ccfd8",
    Purple: "#c4a7e7",
    Violet: "#a88ed4",
    Indigo: "#7a8bc0",
    Fuchsia: "#d080c0",
    Pink: "#ebb5c0",
    Green: "#89c28a",
    Lime: "#a6c870",
    Emerald: "#5bba8a",
    Gold: "#f6c177",
    Amber: "#e8a860",
    Yellow: "#ebd090",
    Blue: "#5e97c0",
    Sky: "#7ec0d0",
  },
  AyuDark: {
    Coral: "#f08070",
    Red: "#f07178",
    Orange: "#ff8f40",
    Rose: "#e85080",
    Teal: "#6dc7a8",
    Cyan: "#95e6cb",
    Purple: "#d2a6ff",
    Violet: "#b080e8",
    Indigo: "#7b80e0",
    Fuchsia: "#e060cc",
    Pink: "#f090b0",
    Green: "#aad94c",
    Lime: "#c0e838",
    Emerald: "#50c880",
    Gold: "#e6b450",
    Amber: "#f0a030",
    Yellow: "#ffb454",
    Blue: "#39bae6",
    Sky: "#59c2ff",
  },
  Kanagawa: {
    Coral: "#d0646e",
    Red: "#c34043",
    Orange: "#ffa066",
    Rose: "#d27e99",
    Teal: "#7aa89f",
    Cyan: "#a3d4d5",
    Purple: "#957fb8",
    Violet: "#8070b0",
    Indigo: "#6a80b8",
    Fuchsia: "#b870a8",
    Pink: "#e090a8",
    Green: "#98bb6c",
    Lime: "#b0c858",
    Emerald: "#70a880",
    Gold: "#d4a868",
    Amber: "#e0a858",
    Yellow: "#e6c384",
    Blue: "#7e9cd8",
    Sky: "#7fb4ca",
  },
  Pico8: {
    Coral: "#FF6E59",
    Red: "#FF004D",
    Orange: "#FFA300",
    Rose: "#FF77A8",
    Teal: "#008751",
    Cyan: "#29ADFF",
    Purple: "#83769C",
    Violet: "#754665",
    Indigo: "#065AB5",
    Fuchsia: "#BE1250",
    Pink: "#FF9D81",
    Green: "#00E436",
    Lime: "#A8E72E",
    Emerald: "#00B543",
    Gold: "#F3EF7D",
    Amber: "#FF6C24",
    Yellow: "#FFEC27",
    Blue: "#29ADFF",
    Sky: "#29ADFF",
  },
  Endesga: {
    Coral: "#f6757a",
    Red: "#e43b44",
    Orange: "#f77622",
    Rose: "#b55088",
    Teal: "#30a898",
    Cyan: "#2ce8f5",
    Purple: "#9060a8",
    Violet: "#68386c",
    Indigo: "#124e89",
    Fuchsia: "#d050a0",
    Pink: "#e8b796",
    Green: "#63c74d",
    Lime: "#a0d840",
    Emerald: "#3e8948",
    Gold: "#feae34",
    Amber: "#d77643",
    Yellow: "#fee761",
    Blue: "#0099db",
    Sky: "#40c0e8",
  },
  Sweetie16: {
    Coral: "#e06060",
    Red: "#b13e53",
    Orange: "#ef7d57",
    Rose: "#d04868",
    Teal: "#257179",
    Cyan: "#73eff7",
    Purple: "#7b3880",
    Violet: "#5d275d",
    Indigo: "#29366f",
    Fuchsia: "#c040a0",
    Pink: "#f090a0",
    Green: "#a7f070",
    Lime: "#c8f050",
    Emerald: "#38b764",
    Gold: "#ffcd75",
    Amber: "#e0a050",
    Yellow: "#f0e060",
    Blue: "#3b5dc9",
    Sky: "#41a6f6",
  },
};

function getCurrentThemeTag(): string {
  try {
    return localStorage.getItem("selectedTheme") ?? "TokyoNight";
  } catch {
    return "TokyoNight";
  }
}

export function getPlayerColorHex(playerColorTag: string): string {
  const themeTag = getCurrentThemeTag();
  const themeColors = THEME_PLAYER_COLORS[themeTag as ThemeTag];
  if (themeColors?.[playerColorTag]) {
    return themeColors[playerColorTag];
  }
  return PLAYER_COLOR_HEX[playerColorTag] ?? "#61AFEF";
}

export function getThemePlayerColorList(): string[] {
  const themeTag = getCurrentThemeTag();
  const themeColors =
    THEME_PLAYER_COLORS[themeTag as ThemeTag] ?? PLAYER_COLOR_HEX;
  return Object.values(themeColors);
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
  const hNorm = (((h % 360) + 360) % 360) / 360;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hNorm * 12) % 12;
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(Math.max(0, Math.min(1, c)) * 255)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function getDisplayColorHex(
  playerColorTag: string | undefined,
  isCurrentPlayer: boolean,
): string {
  if (isCurrentPlayer) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--accent-primary")
      .trim();
  }
  return getPlayerColorHex(playerColorTag ?? "");
}

export function getPlayerAvatarColors(playerColorTag: string): string[] {
  const hex = getPlayerColorHex(playerColorTag);
  const [h] = hexToHsl(hex);
  return [hex, hslToHex(h, 0.15, 0.22), hslToHex(h, 0.08, 0.15)];
}

export function getPlayerProgressGradient(playerColorTag: string): string {
  const hex = getPlayerColorHex(playerColorTag);
  const [h, s, l] = hexToHsl(hex);
  const darkColor = hslToHex(h, Math.min(1, s * 0.9), Math.max(0.2, l - 0.15));
  return `linear-gradient(to right, ${darkColor}, ${hex})`;
}
