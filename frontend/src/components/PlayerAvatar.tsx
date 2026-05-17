import Avatar from "boring-avatars";
import { Crown } from 'lucide-react';
import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { getPlayerAvatarColors } from "../utils/colorMapping";

type PlayerAvatarProps = {
    size: number;
    identity: string;
    isHighlighted?: boolean;
    isLoading?: boolean;
    placement?: number;
    playerColorTag?: string;
};

function getAvatarColorsFromCSS(): string[] {
    const style = getComputedStyle(document.documentElement);
    return [
        style.getPropertyValue('--accent-light').trim(),
        style.getPropertyValue('--avatar-color-1').trim(),
        style.getPropertyValue('--accent-dark').trim(),
        style.getPropertyValue('--avatar-color-2').trim(),
        style.getPropertyValue('--avatar-color-3').trim(),
    ];
}

export const PlayerAvatar = memo(({
    size,
    identity,
    isHighlighted = false,
    isLoading = false,
    placement,
    playerColorTag
}: PlayerAvatarProps) => {
    const [fallbackColors, setFallbackColors] = useState(getAvatarColorsFromCSS);

    const onThemeChange = useCallback(() => {
        setFallbackColors(getAvatarColorsFromCSS());
    }, []);

    useEffect(() => {
        window.addEventListener('themechange', onThemeChange);
        return () => window.removeEventListener('themechange', onThemeChange);
    }, [onThemeChange]);

    const avatarColors = useMemo(
        () => playerColorTag ? getPlayerAvatarColors(playerColorTag) : fallbackColors,
        [playerColorTag, fallbackColors]
    );

    const getCrownColor = (place: number) => {
        if (place === 1) return 'var(--medal-gold)';
        return null;
    };

    const getMedalColor = (place: number) => {
        if (place === 1) return 'var(--medal-gold)';
        if (place === 2) return 'var(--medal-silver)';
        if (place === 3) return 'var(--medal-bronze)';
        if (place > 3) return 'var(--medal-default)';
        return null;
    };

    const getBorderColor = (place: number) => {
        if (place === 1) return 'var(--medal-gold)';
        if (place === 2) return 'var(--medal-silver)';
        if (place === 3) return 'var(--medal-bronze)';
        return null;
    };

    const crownColor = placement ? getCrownColor(placement) : null;
    const medalColor = placement ? getMedalColor(placement) : null;
    const borderColor = placement ? getBorderColor(placement) : null;

    return (
        <div
            className={`relative shrink-0 rounded-full border-2 p-0.5 transition-all duration-200 ${isLoading ? 'border-dashed' : ''}`}
            style={{
                borderColor: borderColor || avatarColors[1],
                background: `linear-gradient(135deg, ${avatarColors[0]}, ${avatarColors[2]})`,
                boxShadow: isHighlighted
                    ? `0 0 0 2px var(--background), 0 0 ${Math.max(10, size * 0.4)}px ${avatarColors[0]}55`
                    : `0 2px ${Math.max(8, size * 0.25)}px rgba(0, 0, 0, 0.18)`,
            }}
        >
            {crownColor && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 z-10 animate-[crownDescend_0.6s_ease-out]"
                    style={{ top: -(size * 0.35), filter: `drop-shadow(0 -1px 6px ${crownColor})` }}
                >
                    <Crown
                        size={size * 0.5}
                        fill={crownColor}
                        stroke="none"
                        strokeWidth={1.5}
                    />
                </div>
            )}
            {medalColor && placement && (
                <div
                    className="absolute -bottom-1 -right-0.5 z-10 flex items-center justify-center rounded-full"
                    style={{
                        width: size * 0.4,
                        height: size * 0.4,
                        backgroundColor: medalColor,
                        border: '2px solid var(--background)',
                        fontSize: size * 0.2,
                        fontWeight: 800,
                        color: placement > 3 ? '#fff' : '#1a1a2e',
                        lineHeight: 1,
                    }}
                >
                    {placement}
                </div>
            )}
            {isLoading ? (
                <div
                    className="bg-muted rounded-full"
                    style={{ width: size, height: size }}
                />
            ) : (
                <div className="rounded-full overflow-hidden bg-card">
                    <Avatar
                        size={size}
                        name={identity}
                        variant="marble"
                        colors={avatarColors}
                    />
                </div>
            )}
        </div>
    );
});
