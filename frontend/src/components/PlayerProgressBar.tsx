import { PlayerAvatar } from './PlayerAvatar';
import { Bot, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { memo, useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { getPlayerProgressGradient } from '../utils/colorMapping';
import { getInitialTheme } from '../utils/themes';

const AVATAR_ONLY_THRESHOLD = 90;
const NO_WPM_THRESHOLD = 180;
const NO_LEVEL_THRESHOLD = 220;
const NO_BOT_THRESHOLD = 250;
const NAME_MAX_WIDTH_CLASS = 'max-w-[120px]';

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
}: PlayerProgressBarProps) => {
    const progressPercentage = (progressIndex / phraseLength) * 100;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(280);

    const [currentTheme, setCurrentTheme] = useState(getInitialTheme);
    const onThemeChange = useCallback(() => setCurrentTheme(getInitialTheme()), []);
    useEffect(() => {
        window.addEventListener('themechange', onThemeChange);
        return () => window.removeEventListener('themechange', onThemeChange);
    }, [onThemeChange]);

    const progressGradient = useMemo(
        () => playerColorTag
            ? getPlayerProgressGradient(playerColorTag)
            : 'linear-gradient(to right, var(--accent-dark), var(--accent-primary))',
        [playerColorTag, currentTheme]
    );
    useEffect(() => {
        if (!containerRef.current) {
            return;
        }
        const observer = new ResizeObserver(([entry]) => {
            if (entry?.contentRect?.width) {
                setContainerWidth(entry.contentRect.width);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const compactMode = useMemo(() => {
        if (containerWidth <= AVATAR_ONLY_THRESHOLD) return 'avatar';
        if (containerWidth <= NO_WPM_THRESHOLD) return 'noWpm';
        if (containerWidth <= NO_LEVEL_THRESHOLD) return 'noLevel';
        if (containerWidth <= NO_BOT_THRESHOLD) return 'noBot';
        return 'full';
    }, [containerWidth]);
    const showAvatarOnly = compactMode === 'avatar';
    const showBotIndicator = compactMode === 'full' && isBot;
    const showLevel = compactMode === 'full' || compactMode === 'noBot';
    const isCompactEnoughForWpm = compactMode === 'full' || compactMode === 'noBot' || compactMode === 'noLevel';
    const showWpm = !isLoading && isCompactEnoughForWpm && wpm !== undefined && wpm > 0;
    const avatarSize = showAvatarOnly ? 32 : 40;

    return (
        <div ref={containerRef} className={`box w-full rounded-lg relative ${showAvatarOnly ? 'p-2' : 'p-3 sm:p-4'}`}>
        <div
            className={`w-full flex items-center ${showAvatarOnly ? 'justify-center gap-0' : 'gap-3'} transition-all duration-500 ${isLoading
                ? 'opacity-20'
                : 'opacity-100 animate-[slideInFromLeft_0.5s_ease-out]'
                }`}
        >
            {isLoading || isAnonymous ? (
                <PlayerAvatar
                    key="avatar"
                    size={avatarSize}
                    identity={identityHash}
                    isHighlighted={isCurrentPlayer}
                    isLoading={isLoading}
                    placement={placement}
                    playerColorTag={playerColorTag}
                />
            ) : (
                <Link key="avatar-link" to={`/profile/${playerPublicId}`} className="shrink-0">
                    <PlayerAvatar
                        key="avatar"
                        size={avatarSize}
                        identity={identityHash}
                        isHighlighted={isCurrentPlayer}
                        isLoading={isLoading}
                        placement={placement}
                        playerColorTag={playerColorTag}
                    />
                </Link>
            )}

            {!showAvatarOnly && (
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        {isLoading ? (
                            <span className={`text-sm font-semibold text-muted-foreground truncate ${NAME_MAX_WIDTH_CLASS}`}>Waiting...</span>
                        ) : (
                            <>
                                <div className="flex items-center gap-1 min-w-0">
                                    <span className={`text-sm font-semibold truncate ${NAME_MAX_WIDTH_CLASS} ${isCurrentPlayer ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {name}
                                    </span>
                                    {showBotIndicator && (
                                        <div className="group relative">
                                            <Bot className="w-4 h-4 text-muted-foreground" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-card text-foreground text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-10 shadow-lg w-64">
                                                This player is a bot. Share this game with your friends to reduce the amount they need to be added to games.
                                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {showLevel && (<span className="text-xs font-medium text-muted-foreground">
                                    Lvl {level}
                                </span>)}
                            </>
                        )}
                    </div>
                    {showWpm && (
                        <span className={`text-sm font-semibold ${isCurrentPlayer ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {Math.round(wpm)} WPM
                        </span>
                    )}
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
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
            )}
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
