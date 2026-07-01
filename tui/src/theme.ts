interface Theme {
  bg0_h: string;
  bg0_s: string;
  bg0: string;
  bg1: string;
  bg2: string;
  fg0: string;
  fg1: string;
  red: string;
  accent: string;
}

export const gruvbox: Theme = {
  bg0_h: "#1d2021",
  bg0_s: "#32302f",
  bg0: "#282828",
  bg1: "#3c3836",
  bg2: "#504945",
  fg0: "#fbf1c7",
  fg1: "#ebdbb2",
  red: "#fb4934",
  accent: "#fabd2f",
} as const;

export let THEME = gruvbox;
