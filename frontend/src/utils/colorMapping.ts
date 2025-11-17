export enum PlayerColor {
    Amber = 0,
    Blue = 1,
    Green = 2,
    Purple = 3,
    Red = 4,
    Pink = 5,
    Cyan = 6,
    Orange = 7,
    Lime = 8,
    Indigo = 9
}

export interface ColorConfig {
    primary: string;
    light: string;
    dark: string;
    darker: string;
    darkest: string;
    avatarColors: string[];
    gradient: string;
}

export const COLOR_CONFIGS: Record<PlayerColor, ColorConfig> = {
    [PlayerColor.Amber]: {
        primary: '#fbbf24',
        light: '#fcd34d',
        dark: '#f59e0b',
        darker: '#d97706',
        darkest: '#b45309',
        avatarColors: ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e'],
        gradient: 'linear-gradient(to right, #f59e0b, #fbbf24)'
    },
    [PlayerColor.Blue]: {
        primary: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        darker: '#1d4ed8',
        darkest: '#1e40af',
        avatarColors: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
        gradient: 'linear-gradient(to right, #2563eb, #3b82f6)'
    },
    [PlayerColor.Green]: {
        primary: '#10b981',
        light: '#34d399',
        dark: '#059669',
        darker: '#047857',
        darkest: '#065f46',
        avatarColors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b'],
        gradient: 'linear-gradient(to right, #059669, #10b981)'
    },
    [PlayerColor.Purple]: {
        primary: '#a855f7',
        light: '#c084fc',
        dark: '#9333ea',
        darker: '#7e22ce',
        darkest: '#6b21a8',
        avatarColors: ['#a855f7', '#9333ea', '#7e22ce', '#6b21a8', '#581c87'],
        gradient: 'linear-gradient(to right, #9333ea, #a855f7)'
    },
    [PlayerColor.Red]: {
        primary: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        darker: '#b91c1c',
        darkest: '#991b1b',
        avatarColors: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'],
        gradient: 'linear-gradient(to right, #dc2626, #ef4444)'
    },
    [PlayerColor.Pink]: {
        primary: '#ec4899',
        light: '#f472b6',
        dark: '#db2777',
        darker: '#be185d',
        darkest: '#9f1239',
        avatarColors: ['#ec4899', '#db2777', '#be185d', '#9f1239', '#831843'],
        gradient: 'linear-gradient(to right, #db2777, #ec4899)'
    },
    [PlayerColor.Cyan]: {
        primary: '#06b6d4',
        light: '#22d3ee',
        dark: '#0891b2',
        darker: '#0e7490',
        darkest: '#155e75',
        avatarColors: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63'],
        gradient: 'linear-gradient(to right, #0891b2, #06b6d4)'
    },
    [PlayerColor.Orange]: {
        primary: '#f97316',
        light: '#fb923c',
        dark: '#ea580c',
        darker: '#c2410c',
        darkest: '#9a3412',
        avatarColors: ['#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12'],
        gradient: 'linear-gradient(to right, #ea580c, #f97316)'
    },
    [PlayerColor.Lime]: {
        primary: '#84cc16',
        light: '#a3e635',
        dark: '#65a30d',
        darker: '#4d7c0f',
        darkest: '#3f6212',
        avatarColors: ['#84cc16', '#65a30d', '#4d7c0f', '#3f6212', '#365314'],
        gradient: 'linear-gradient(to right, #65a30d, #84cc16)'
    },
    [PlayerColor.Indigo]: {
        primary: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        darker: '#4338ca',
        darkest: '#3730a3',
        avatarColors: ['#6366f1', '#4f46e5', '#4338ca', '#3730a3', '#312e81'],
        gradient: 'linear-gradient(to right, #4f46e5, #6366f1)'
    }
};

export function getColorConfig(color: PlayerColor): ColorConfig {
    return COLOR_CONFIGS[color] || COLOR_CONFIGS[PlayerColor.Amber];
}

export function setAccentColor(color: PlayerColor): void {
    const config = getColorConfig(color);
    const root = document.documentElement;
    root.style.setProperty('--color-accent', config.primary);
    root.style.setProperty('--color-accent-light', config.light);
    root.style.setProperty('--color-accent-dark', config.dark);
}
