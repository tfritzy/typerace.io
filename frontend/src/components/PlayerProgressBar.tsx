import { PlayerAvatar } from './PlayerAvatar';
import { getColorConfig } from '../utils/colorMapping';
import { type PlayerColor } from "../types/stdb";
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo } from 'react';
import { getOrdinalPlacement } from '../utils/formatters';

type PlayerProgressBarProps = {
    name: string;
    level: number;
    progressIndex: number;
    phraseLength: number;
    identityHash: string;
    playerPublicId: string;
    isCurrentPlayer?: boolean;
    isLoading?: boolean;
    playerColor?: PlayerColor;
    wpm?: number;
    placement?: number;
    isBot?: boolean;
    isAnonymous?: boolean;
};

const PLACEMENT_COLORS = {
    first: '#FFC900',
    second: '#C0C0C0',
    third: '#CD7F32',
    other: '#9CA3AF'
};

const PLACEMENT_BANNER_POSITION = {
    top: '-0.75rem',
    right: '-2rem'
};

const getPlacementColor = (place: number) => {
    if (place === 1) return PLACEMENT_COLORS.first;
    if (place === 2) return PLACEMENT_COLORS.second;
    if (place === 3) return PLACEMENT_COLORS.third;
    return PLACEMENT_COLORS.other;
};

export const PlayerProgressBar = memo(({
    name,
    level,
    progressIndex,
    phraseLength,
    identityHash,
    playerPublicId,
    isCurrentPlayer = false,
    isLoading = false,
    playerColor = { tag: "Amber" } as PlayerColor,
    wpm,
    placement,
    isBot = false,
    isAnonymous = false,
}: PlayerProgressBarProps) => {
    const progressPercentage = (progressIndex / phraseLength) * 100;
    const colorConfig = getColorConfig(playerColor);
    const placementValue = placement ?? 0;
    const showPlacementBanner = placementValue > 0 && progressIndex >= phraseLength;

    return (
        <div
            className={`w-full flex items-center gap-5 transition-all duration-500 relative ${isLoading
                ? 'opacity-20'
                : 'opacity-100 animate-[slideInFromLeft_0.5s_ease-out]'
                }`}
        >
            {showPlacementBanner && (
                <div
                    className="absolute pointer-events-none"
                    style={PLACEMENT_BANNER_POSITION}
                >
                    <div
                        className="px-6 py-1 text-[10px] font-semibold text-slate-900 rotate-45 shadow-md"
                        style={{ backgroundColor: getPlacementColor(placementValue) }}
                        aria-label={`Finished in ${getOrdinalPlacement(placementValue)} place`}
                    >
                        {getOrdinalPlacement(placementValue)}
                    </div>
                </div>
            )}
            {isLoading || isAnonymous ? (
                <PlayerAvatar
                    key="avatar"
                    size={40}
                    identity={identityHash}
                    color={playerColor}
                    isHighlighted={isCurrentPlayer}
                    isLoading={isLoading}
                    placement={placement}
                />
            ) : (
                <Link key="avatar-link" to={`/profile/${playerPublicId}`} className="shrink-0">
                    <PlayerAvatar
                        key="avatar"
                        size={40}
                        identity={identityHash}
                        color={playerColor}
                        isHighlighted={isCurrentPlayer}
                        isLoading={isLoading}
                        placement={placement}
                    />
                </Link>
            )}

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <span className="text-sm font-semibold text-white/30">Waiting...</span>
                        ) : (
                            <>
                                <div className="flex items-center gap-1">
                                    <span className={`text-sm font-semibold ${isCurrentPlayer ? 'text-white' : 'text-white/70'}`}>
                                        {name}
                                    </span>
                                    {isBot && (
                                        <div className="group relative">
                                            <Bot className="w-4 h-4 text-white/50" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-(--color-box-bg) text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg w-64">
                                                This player is a bot. Share this game with your friends to reduce the amount they need to be added to games.
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-(--color-box-bg)"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
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
        </div>
    );
});
