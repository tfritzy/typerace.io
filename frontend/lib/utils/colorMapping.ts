import { PlayerColor } from "@/module_bindings";

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
        primary: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
        darker: '#b91c1c',
        darkest: '#991b1b',
        avatarColors: ['#ef4444', '#6b4a4a', '#4a2d2d'],
        gradient: 'linear-gradient(to right, #dc2626, #ef4444)'
    },
    [PlayerColor.Orange.tag]: {
        primary: '#f97316',
        light: '#fb923c',
        dark: '#ea580c',
        darker: '#c2410c',
        darkest: '#9a3412',
        avatarColors: ['#f97316', '#8b6a4a', '#5c4a36'],
        gradient: 'linear-gradient(to right, #ea580c, #f97316)'
    },
     [PlayerColor.Amber.tag]: {
        primary: '#fbbf24',
        light: '#fcd34d',
        dark: '#f59e0b',
        darker: '#d97706',
        darkest: '#b45309',
        avatarColors: ['#fbbf24', '#8b7355', '#5c4a3a'],
        gradient: 'linear-gradient(to right, #f59e0b, #fbbf24)'
    },
    [PlayerColor.Yellow.tag]: {
        primary: '#eab308',
        light: '#facc15',
        dark: '#ca8a04',
        darker: '#a16207',
        darkest: '#854d0e',
        avatarColors: ['#eab308', '#8b8355', '#5c543a'],
        gradient: 'linear-gradient(to right, #ca8a04, #eab308)'
    },
    [PlayerColor.Lime.tag]: {
        primary: '#84cc16',
        light: '#a3e635',
        dark: '#65a30d',
        darker: '#4d7c0f',
        darkest: '#3f6212',
        avatarColors: ['#84cc16', '#5d6b4a', '#3d4a2d'],
        gradient: 'linear-gradient(to right, #65a30d, #84cc16)'
    },
    [PlayerColor.Green.tag]: {
        primary: '#22c55e',
        light: '#4ade80',
        dark: '#16a34a',
        darker: '#15803d',
        darkest: '#166534',
        avatarColors: ['#22c55e', '#4a5d52', '#2d3e36'],
        gradient: 'linear-gradient(to right, #16a34a, #22c55e)'
    },
    [PlayerColor.Emerald.tag]: {
        primary: '#10b981',
        light: '#34d399',
        dark: '#059669',
        darker: '#047857',
        darkest: '#065f46',
        avatarColors: ['#10b981', '#4a5d56', '#2d3e38'],
        gradient: 'linear-gradient(to right, #059669, #10b981)'
    },
    [PlayerColor.Teal.tag]: {
        primary: '#14b8a6',
        light: '#2dd4bf',
        dark: '#0d9488',
        darker: '#0f766e',
        darkest: '#115e59',
        avatarColors: ['#14b8a6', '#4a5d5c', '#2d3e3d'],
        gradient: 'linear-gradient(to right, #0d9488, #14b8a6)'
    },
    [PlayerColor.Cyan.tag]: {
        primary: '#06b6d4',
        light: '#22d3ee',
        dark: '#0891b2',
        darker: '#0e7490',
        darkest: '#155e75',
        avatarColors: ['#06b6d4', '#4a5d68', '#2d3e47'],
        gradient: 'linear-gradient(to right, #0891b2, #06b6d4)'
    },
    [PlayerColor.Sky.tag]: {
        primary: '#0ea5e9',
        light: '#38bdf8',
        dark: '#0284c7',
        darker: '#0369a1',
        darkest: '#075985',
        avatarColors: ['#0ea5e9', '#4a5a68', '#2d3a47'],
        gradient: 'linear-gradient(to right, #0284c7, #0ea5e9)'
    },
    [PlayerColor.Blue.tag]: {
        primary: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
        darker: '#1d4ed8',
        darkest: '#1e40af',
        avatarColors: ['#3b82f6', '#4a5568', '#2d3748'],
        gradient: 'linear-gradient(to right, #2563eb, #3b82f6)'
    },
    [PlayerColor.Indigo.tag]: {
        primary: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        darker: '#4338ca',
        darkest: '#3730a3',
        avatarColors: ['#6366f1', '#4a4d68', '#2e3047'],
        gradient: 'linear-gradient(to right, #4f46e5, #6366f1)'
    },
    [PlayerColor.Violet.tag]: {
        primary: '#8b5cf6',
        light: '#a78bfa',
        dark: '#7c3aed',
        darker: '#6d28d9',
        darkest: '#5b21b6',
        avatarColors: ['#8b5cf6', '#534a68', '#3a2e47'],
        gradient: 'linear-gradient(to right, #7c3aed, #8b5cf6)'
    },
    [PlayerColor.Purple.tag]: {
        primary: '#a855f7',
        light: '#c084fc',
        dark: '#9333ea',
        darker: '#7e22ce',
        darkest: '#6b21a8',
        avatarColors: ['#a855f7', '#5d4a68', '#3d2e47'],
        gradient: 'linear-gradient(to right, #9333ea, #a855f7)'
    },
    [PlayerColor.Fuchsia.tag]: {
        primary: '#d946ef',
        light: '#e879f9',
        dark: '#c026d3',
        darker: '#a21caf',
        darkest: '#86198f',
        avatarColors: ['#d946ef', '#684a68', '#472e47'],
        gradient: 'linear-gradient(to right, #c026d3, #d946ef)'
    },
    [PlayerColor.Pink.tag]: {
        primary: '#ec4899',
        light: '#f472b6',
        dark: '#db2777',
        darker: '#be185d',
        darkest: '#9f1239',
        avatarColors: ['#ec4899', '#6b4a5d', '#4a2d3d'],
        gradient: 'linear-gradient(to right, #db2777, #ec4899)'
    },
    [PlayerColor.Rose.tag]: {
        primary: '#f43f5e',
        light: '#fb7185',
        dark: '#e11d48',
        darker: '#be123c',
        darkest: '#9f1239',
        avatarColors: ['#f43f5e', '#6b4a52', '#4a2d36'],
        gradient: 'linear-gradient(to right, #e11d48, #f43f5e)'
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
