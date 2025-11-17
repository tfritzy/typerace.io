import Avatar from "boring-avatars";
import { PlayerColor } from '../../module_bindings/player_color';
import { getColorConfig } from '../utils/colorMapping';

type PlayerProgressBarProps = {
    name: string;
    level: number;
    progress: number;
    phraseLength: number;
    identityHash: string;
    isCurrentPlayer?: boolean;
    isLoading?: boolean;
    playerColor?: PlayerColor;
};

export const PlayerProgressBar = ({
    name,
    level,
    progress,
    phraseLength,
    identityHash,
    isCurrentPlayer = false,
    isLoading = false,
    playerColor = PlayerColor.Amber,
}: PlayerProgressBarProps) => {
    const progressPercentage = (progress / phraseLength) * 100;
    const colorConfig = getColorConfig(playerColor);
    
    const gradient = isCurrentPlayer 
        ? colorConfig.gradient 
        : `linear-gradient(to right, ${colorConfig.darker}, ${colorConfig.dark})`;

    return (
        <div
            className={`w-full flex items-center gap-5 transition-all duration-500 ${isLoading
                ? 'opacity-20'
                : 'opacity-100 animate-[slideInFromLeft_0.5s_ease-out]'
                }`}
        >
            <div 
                className={`relative shrink-0 border-2 rounded-full ${isLoading ? 'border-dashed' : ''}`}
                style={{ borderColor: isCurrentPlayer ? colorConfig.primary : 'rgba(255, 255, 255, 0.3)' }}
            >
                {isLoading ? (
                    <div className="w-10 h-10 bg-white/5 rounded-full" />
                ) : (
                    <Avatar
                        size={40}
                        name={identityHash}
                        variant="pixel"
                        colors={colorConfig.avatarColors}
                    />
                )}
            </div>

            <div className="flex-1 flex flex-col gap-2">
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
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{ 
                            width: `${Math.min(100, progressPercentage)}%`,
                            background: gradient
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
