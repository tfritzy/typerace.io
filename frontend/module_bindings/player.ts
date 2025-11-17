import { PlayerColor } from './player_color';

export interface Player {
    id: any;
    name: string;
    color: PlayerColor;
    totalGames: number;
    wins: number;
    level: number;
    xp: number;
    isBot: boolean;
    botConfig?: any;
}
