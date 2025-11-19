import { PlayerAvatar } from './PlayerAvatar';
import { getColorConfig } from '../utils/colorMapping';
import { PlayerColor } from "../../module_bindings";

type PlayerProgressBarProps = {
    name: string;
    level: number;
    progressIndex: number;
    phraseLength: number;
    identityHash: string;
    isCurrentPlayer?: boolean;
    isLoading?: boolean;
    playerColor?: PlayerColor;
    wpm?: number;
    placement?: number;
};

export const PlayerProgressBar = ({
    name,
    level,
    progressIndex,
    phraseLength,
    identityHash,
    isCurrentPlayer = false,
    isLoading = false,
    playerColor = PlayerColor.Amber,
    wpm,
    placement,
}: PlayerProgressBarProps) => {
    const progressPercentage = (progressIndex / phraseLength) * 100;
    const colorConfig = getColorConfig(playerColor);

    const getPlacementColor = (place: number) => {
        switch (place) {
            case 1: return '#FFD700';
            case 2: return '#C0C0C0';
            case 3: return '#CD7F32';
            default: return '#9CA3AF';
        }
    };

    return (
        <div
            className={`w-full flex items-center gap-5 transition-all duration-500 relative ${isLoading
                ? 'opacity-20'
                : 'opacity-100 animate-[slideInFromLeft_0.5s_ease-out]'
                }`}
        >
            <PlayerAvatar
                size={40}
                identity={identityHash}
                color={playerColor}
                isHighlighted={isCurrentPlayer}
                isLoading={isLoading}
            />

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <span className="text-sm font-semibold text-white/30">Waiting...</span>
                        ) : (
                            <>
                                <span className={`text-sm font-semibold ${isCurrentPlayer ? 'text-white' : 'text-white/70'}`}>
                                    {name}
                                </span>
                                <span className="text-xs font-medium text-white/50">
                                    Lvl {level}
                                </span>
                            </>
                        )}
                    </div>
                    {!isLoading && wpm !== undefined && wpm > 0 && (
                        <span className={`text-sm font-semibold ${isCurrentPlayer ? 'text-white' : 'text-white/70'}`}>
                            {Math.round(wpm)} WPM
                        </span>
                    )}
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                            width: `${Math.min(100, progressPercentage)}%`,
                            background: colorConfig.gradient
                        }}
                    />
                </div>
            </div>

            {placement !== undefined && placement > 0 && (
                <div 
                    className="absolute top-1/2 -translate-y-1/2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
                    style={{
                        backgroundColor: getPlacementColor(placement),
                        color: '#000000'
                    }}
                >
                    {placement}
                </div>
            )}
        </div>
    );
};
