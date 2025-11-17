import { PlayerColor } from "../../module_bindings";

export interface ColorConfig {
    primary: string;
    light: string;
    dark: string;
    darker: string;
    darkest: string;
    avatarColors: string[];
    gradient: string;
}

export const COLOR_CONFIGS: Record<PlayerColor['tag'], ColorConfig> = {
    [PlayerColor.Red.tag]: {
        primary: '#f87171',
        light: '#fca5a5',
        dark: '#ef4444',
        darker: '#dc2626',
        darkest: '#b91c1c',
        avatarColors: ['#f87171', '#6b4a4a', '#b38f8f', '#4a2d2d', '#d4a3a3'],
        gradient: 'linear-gradient(to right, #ef4444, #f87171)'
    },
    [PlayerColor.Orange.tag]: {
        primary: '#fb923c',
        light: '#fdba74',
        dark: '#f97316',
        darker: '#ea580c',
        darkest: '#c2410c',
        avatarColors: ['#fb923c', '#8b6a4a', '#d49a74', '#5c4a36', '#a6825d'],
        gradient: 'linear-gradient(to right, #f97316, #fb923c)'
    },
    [PlayerColor.Amber.tag]: {
        primary: '#fbbf24',
        light: '#fcd34d',
        dark: '#f59e0b',
        darker: '#d97706',
        darkest: '#b45309',
        avatarColors: ['#fbbf24', '#8b7355', '#d4a574', '#5c4a3a', '#a67c52'],
        gradient: 'linear-gradient(to right, #f59e0b, #fbbf24)'
    },
    [PlayerColor.Lime.tag]: {
        primary: '#a3e635',
        light: '#bef264',
        dark: '#84cc16',
        darker: '#65a30d',
        darkest: '#4d7c0f',
        avatarColors: ['#a3e635', '#5d6b4a', '#8fa37d', '#3d4a2d', '#b8c89b'],
        gradient: 'linear-gradient(to right, #84cc16, #a3e635)'
    },
    [PlayerColor.Green.tag]: {
        primary: '#34d399',
        light: '#6ee7b7',
        dark: '#10b981',
        darker: '#059669',
        darkest: '#047857',
        avatarColors: ['#34d399', '#4a5d52', '#7d9b8f', '#2d3e36', '#9bc4b5'],
        gradient: 'linear-gradient(to right, #10b981, #34d399)'
    },
    [PlayerColor.Cyan.tag]: {
        primary: '#22d3ee',
        light: '#67e8f9',
        dark: '#06b6d4',
        darker: '#0891b2',
        darkest: '#0e7490',
        avatarColors: ['#22d3ee', '#4a5d68', '#7d9ba8', '#2d3e47', '#9bc4d4'],
        gradient: 'linear-gradient(to right, #06b6d4, #22d3ee)'
    },
    [PlayerColor.Blue.tag]: {
        primary: '#60a5fa',
        light: '#93c5fd',
        dark: '#3b82f6',
        darker: '#2563eb',
        darkest: '#1d4ed8',
        avatarColors: ['#60a5fa', '#4a5568', '#7d8fa3', '#2d3748', '#9fb3c8'],
        gradient: 'linear-gradient(to right, #3b82f6, #60a5fa)'
    },
    [PlayerColor.Indigo.tag]: {
        primary: '#818cf8',
        light: '#a5b4fc',
        dark: '#6366f1',
        darker: '#4f46e5',
        darkest: '#4338ca',
        avatarColors: ['#818cf8', '#4a4d68', '#8f92b3', '#2e3047', '#a3a6c8'],
        gradient: 'linear-gradient(to right, #6366f1, #818cf8)'
    },
    [PlayerColor.Purple.tag]: {
        primary: '#c084fc',
        light: '#d8b4fe',
        dark: '#a855f7',
        darker: '#9333ea',
        darkest: '#7e22ce',
        avatarColors: ['#c084fc', '#5d4a68', '#9d8fb3', '#3d2e47', '#b8a3c8'],
        gradient: 'linear-gradient(to right, #a855f7, #c084fc)'
    },
    [PlayerColor.Pink.tag]: {
        primary: '#f472b6',
        light: '#f9a8d4',
        dark: '#ec4899',
        darker: '#db2777',
        darkest: '#be185d',
        avatarColors: ['#f472b6', '#6b4a5d', '#b38fa3', '#4a2d3d', '#d4a3b8'],
        gradient: 'linear-gradient(to right, #ec4899, #f472b6)'
    }
};

export function getColorConfig(color: PlayerColor): ColorConfig {
    return COLOR_CONFIGS[color.tag] || COLOR_CONFIGS[PlayerColor.Amber.tag];
}

export function setAccentColor(color: PlayerColor): void {
    console.log("setting accent color to", color);
    const config = getColorConfig(color);
    const root = document.documentElement;
    root.style.setProperty('--color-accent', config.primary);
    root.style.setProperty('--color-accent-light', config.light);
    root.style.setProperty('--color-accent-dark', config.dark);
}
