import { useEffect } from 'react';
import { PlayerColor, setAccentColor, getColorConfig } from '../utils/colorMapping';

export function usePlayerColor(playerColor: PlayerColor | undefined) {
    useEffect(() => {
        if (playerColor !== undefined) {
            setAccentColor(playerColor);
        }
    }, [playerColor]);

    return playerColor !== undefined ? getColorConfig(playerColor) : null;
}
