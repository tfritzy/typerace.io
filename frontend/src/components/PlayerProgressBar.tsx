import { PlayerAvatar } from './PlayerAvatar';
import { Bot, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo, useMemo } from 'react';
import { getPlayerProgressGradient } from '../utils/colorMapping';

type PlayerProgressBarProps = {
    name: string;
    level: number;
    progressIndex: number;
    phraseLength: number;
    identityHash: string;
    playerPublicId: string;
    isCurrentPlayer?: boolean;
    isLoading?: boolean;
    wpm?: number;
    placement?: number;
    isBot?: boolean;
    isAnonymous?: boolean;
    onKick?: () => void;
    playerColorTag?: string;
    photoUrl?: string | null;
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
    wpm,
    placement,
    isBot = false,
    isAnonymous = false,
    onKick,
    playerColorTag,
    photoUrl,
}: PlayerProgressBarProps) => {
    const progressPercentage = (progressIndex / phraseLength) * 100;
    const progressGradient = useMemo(
        () => playerColorTag
            ? getPlayerProgressGradient(playerColorTag)
            : 'linear-gradient(to right, var(--accent-dark), var(--accent-primary))',
        [playerColorTag]
    );

    return (
        <div className="box w-full rounded-lg px-4 py-3 sm:px-8 sm:py-6 relative">
        <div
            className={`w-full flex items-center gap-5 transition-all duration-500 ${isLoading
                ? 'opacity-20'
                : 'opacity-100 animate-[slideInFromLeft_0.5s_ease-out]'
                }`}
        >
            {isLoading || isAnonymous ? (
                <PlayerAvatar
                    key="avatar"
                    size={40}
                    identity={identityHash}
                    isLoading={isLoading}
                    placement={placement}
                    playerColorTag={playerColorTag}
                    photoUrl={photoUrl}
                />
            ) : (
                <Link key="avatar-link" to={`/profile/${playerPublicId}`} className="shrink-0">
                    <PlayerAvatar
                        key="avatar"
                        size={40}
                        identity={identityHash}
                        isLoading={isLoading}
                        placement={placement}
                        playerColorTag={playerColorTag}
                        photoUrl={photoUrl}
                    />
                </Link>
            )}

            <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <span className="text-sm font-semibold text-muted-foreground">Waiting...</span>
                        ) : (
                            <>
                                <div className="flex items-center gap-1">
                                    <span className={`text-sm font-semibold ${isCurrentPlayer ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {name}
                                    </span>
                                    {isBot && (
                                        <div className="group relative">
                                            <Bot className="w-4 h-4 text-muted-foreground" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-card text-foreground text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg w-64">
                                                This player is a bot. Share this game with your friends to reduce the amount they need to be added to games.
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">
                                    Lvl {level}
                                </span>
                            </>
                        )}
                    </div>
                    {!isLoading && wpm !== undefined && wpm > 0 && (
                        <span className={`text-sm font-semibold ${isCurrentPlayer ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {Math.round(wpm)} WPM
                        </span>
                    )}
                </div>
                <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{
                            width: `${Math.min(100, progressPercentage)}%`,
                            background: progressGradient,
                            opacity: isCurrentPlayer ? 1 : 0.35
                        }}
                    />
                </div>
            </div>
            {onKick && (
                <button
                    onClick={onKick}
                    className="absolute right-2 top-2 p-0.5 rounded-full bg-card text-muted-foreground opacity-50 hover:opacity-100 hover:text-foreground transition-all duration-200 cursor-pointer"
                    aria-label="Kick player"
                >
                    <X size={14} />
                </button>
            )}
        </div>
        </div>
    );
});
