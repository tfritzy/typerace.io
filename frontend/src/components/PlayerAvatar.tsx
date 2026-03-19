import Avatar from "boring-avatars";
import { Crown, Star } from 'lucide-react';
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
        style.getPropertyValue('--avatar-color-1').trim(),
        style.getPropertyValue('--avatar-color-2').trim(),
        style.getPropertyValue('--avatar-color-3').trim(),
    ];
}

type PlacementConfig = {
    borderWidth: number;
    borderColor: string;
    boxShadow?: string;
    ringAnimation?: string;
    badgeColor: string;
    badgeTextColor: string;
};

function getPlacementConfig(place: number): PlacementConfig {
    switch (place) {
        case 1:
            return {
                borderWidth: 3,
                borderColor: 'var(--medal-gold)',
                boxShadow: '0 0 8px 2px rgba(255, 201, 0, 0.3), 0 0 16px 4px rgba(255, 201, 0, 0.1)',
                ringAnimation: 'goldPulse 3s ease-in-out infinite',
                badgeColor: 'var(--medal-gold)',
                badgeTextColor: '#1a1a2e',
            };
        case 2:
            return {
                borderWidth: 3,
                borderColor: 'var(--medal-silver)',
                boxShadow: '0 0 0 2px rgba(192, 192, 192, 0.15), 0 0 8px 2px rgba(192, 192, 192, 0.12)',
                badgeColor: 'var(--medal-silver)',
                badgeTextColor: '#1a1a2e',
            };
        case 3:
            return {
                borderWidth: 2,
                borderColor: 'var(--medal-bronze)',
                boxShadow: '0 0 6px 1px rgba(205, 127, 50, 0.2)',
                badgeColor: 'var(--medal-bronze)',
                badgeTextColor: '#1a1a2e',
            };
        default:
            return {
                borderWidth: 2,
                borderColor: 'var(--medal-default)',
                badgeColor: 'var(--medal-default)',
                badgeTextColor: '#fff',
            };
    }
}

function MedalSvg({ size, color }: { size: number; color: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M9 1L7 9h10L15 1H9z" fill={color} opacity={0.55} />
            <circle cx="12" cy="15" r="7.5" fill={color} />
            <circle cx="12" cy="15" r="5" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.2" />
        </svg>
    );
}

export const PlayerAvatar = memo(({
    size,
    identity,
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

    const config = placement ? getPlacementConfig(placement) : null;

    const iconSize = size * 0.5;

    return (
        <div
            className={`relative shrink-0 rounded-full ${isLoading ? 'border-dashed' : ''}`}
            style={{
                borderWidth: config?.borderWidth || 2,
                borderStyle: isLoading ? 'dashed' : 'solid',
                borderColor: config?.borderColor || avatarColors[2],
                boxShadow: config?.boxShadow,
                animation: config?.ringAnimation,
            }}
        >
            {placement === 1 && (
                <div
                    className="absolute -top-[14px] left-1/2 -translate-x-1/2 z-10 animate-[crownDescend_0.6s_ease-out]"
                    style={{ filter: 'drop-shadow(0 -1px 6px rgba(255, 201, 0, 0.6))' }}
                >
                    <Crown
                        size={iconSize}
                        fill="var(--medal-gold)"
                        stroke="none"
                    />
                </div>
            )}

            {placement === 1 && (
                <>
                    <div
                        className="absolute z-20 rounded-full animate-[sparkle_2.5s_ease-in-out_infinite_0s]"
                        style={{
                            width: 5, height: 5,
                            backgroundColor: 'var(--medal-gold)',
                            top: -2, right: -2,
                            boxShadow: '0 0 4px 1px rgba(255, 201, 0, 0.5)',
                        }}
                    />
                    <div
                        className="absolute z-20 rounded-full animate-[sparkle_2.5s_ease-in-out_infinite_0.8s]"
                        style={{
                            width: 4, height: 4,
                            backgroundColor: 'var(--medal-gold)',
                            bottom: 2, left: -3,
                            boxShadow: '0 0 4px 1px rgba(255, 201, 0, 0.5)',
                        }}
                    />
                    <div
                        className="absolute z-20 rounded-full animate-[sparkle_2.5s_ease-in-out_infinite_1.6s]"
                        style={{
                            width: 3, height: 3,
                            backgroundColor: 'var(--medal-gold)',
                            top: '50%', right: -4,
                            boxShadow: '0 0 3px 1px rgba(255, 201, 0, 0.4)',
                        }}
                    />
                </>
            )}

            {placement === 2 && (
                <div
                    className="absolute -top-[13px] left-1/2 -translate-x-1/2 z-10 animate-[crownDescend_0.6s_ease-out]"
                    style={{ filter: 'drop-shadow(0 -1px 5px rgba(192, 192, 192, 0.6))' }}
                >
                    <Star
                        size={iconSize}
                        fill="var(--medal-silver)"
                        stroke="none"
                    />
                </div>
            )}

            {placement === 3 && (
                <div
                    className="absolute -top-[14px] left-1/2 -translate-x-1/2 z-10 animate-[crownDescend_0.6s_ease-out]"
                    style={{ filter: 'drop-shadow(0 -1px 4px rgba(205, 127, 50, 0.5))' }}
                >
                    <MedalSvg
                        size={iconSize}
                        color="var(--medal-bronze)"
                    />
                </div>
            )}

            {placement !== undefined && placement > 0 && config && (
                <div
                    className="absolute -bottom-1.5 -right-1.5 z-10 flex items-center justify-center rounded-full"
                    style={{
                        width: size * 0.4,
                        height: size * 0.4,
                        backgroundColor: config.badgeColor,
                        border: '2px solid var(--background)',
                        fontSize: size * 0.2,
                        fontWeight: 800,
                        color: config.badgeTextColor,
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
