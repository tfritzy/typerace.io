import Avatar from "boring-avatars";
import { Crown, Award } from 'lucide-react';
import { memo, useState, useEffect, useCallback } from "react";

type PlayerAvatarProps = {
    size: number;
    identity: string;
    isHighlighted?: boolean;
    isLoading?: boolean;
    placement?: number;
};

function getAvatarColorsFromCSS(): string[] {
    const style = getComputedStyle(document.documentElement);
    return [
        style.getPropertyValue('--avatar-color-1').trim(),
        style.getPropertyValue('--avatar-color-2').trim(),
        style.getPropertyValue('--avatar-color-3').trim(),
    ];
}

export const PlayerAvatar = memo(({
    size,
    identity,
    isLoading = false,
    placement
}: PlayerAvatarProps) => {
    const [avatarColors, setAvatarColors] = useState(getAvatarColorsFromCSS);

    const onThemeChange = useCallback(() => {
        setAvatarColors(getAvatarColorsFromCSS());
    }, []);

    useEffect(() => {
        window.addEventListener('themechange', onThemeChange);
        return () => window.removeEventListener('themechange', onThemeChange);
    }, [onThemeChange]);

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
            style={{ borderColor: borderColor || avatarColors[2] }}
        >
            {crownColor && (
                <div
                    className="absolute -top-[14px] left-1/2 -translate-x-1/2 z-10 animate-[crownDescend_0.6s_ease-out]"
                    style={{ filter: `drop-shadow(0 -1px 6px ${crownColor})` }}
                >
                    <Crown
                        size={size * 0.5}
                        fill={crownColor}
                        stroke="none"
                        strokeWidth={1.5}
                    />
                </div>
            )}
            {medalColor && (
                <div
                    className="absolute -bottom-1 right-1 z-10"
                    style={{ filter: `drop-shadow(0 0px 3px rgba(0, 0, 0, .4))` }}
                >
                    <Award
                        size={size * 0.35}
                        fill={medalColor}
                        stroke='none'
                        strokeWidth={2}
                    />
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
