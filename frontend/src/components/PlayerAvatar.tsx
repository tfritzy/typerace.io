import Avatar from "boring-avatars";
import { Crown } from 'lucide-react';
import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { buildAvatarPalette, getAvatarBorderColor, getPlayerAvatarColors, getPlayerColorHex } from "../utils/colorMapping";

type PlayerAvatarProps = {
    size: number;
    identity: string;
    isHighlighted?: boolean;
    isLoading?: boolean;
    placement?: number;
    playerColorTag?: string;
};

function getPrimaryAvatarColorFromCSS(): string {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--avatar-color-1').trim() || '#fabd2f';
}

export const PlayerAvatar = memo(({
    size,
    identity,
    isLoading = false,
    placement,
    playerColorTag
}: PlayerAvatarProps) => {
    const [primaryHex, setPrimaryHex] = useState(getPrimaryAvatarColorFromCSS);

    const onThemeChange = useCallback(() => {
        setPrimaryHex(getPrimaryAvatarColorFromCSS());
    }, []);

    useEffect(() => {
        window.addEventListener('themechange', onThemeChange);
        return () => window.removeEventListener('themechange', onThemeChange);
    }, [onThemeChange]);

    const avatarColors = useMemo(
        () => playerColorTag ? getPlayerAvatarColors(playerColorTag) : buildAvatarPalette(primaryHex),
        [playerColorTag, primaryHex]
    );

    const avatarBorderColor = useMemo(
        () => getAvatarBorderColor(playerColorTag ? getPlayerColorHex(playerColorTag) : primaryHex),
        [playerColorTag, primaryHex]
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
            className={`relative shrink-0 border-2 rounded-full ${isLoading ? 'border-dashed' : ''}`}
            style={{ borderColor: borderColor || avatarBorderColor }}
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
                <Avatar
                    size={size}
                    name={identity}
                    variant="beam"
                    colors={avatarColors}
                />
            )}
        </div>
    );
});
