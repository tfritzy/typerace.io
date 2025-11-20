import Avatar from "boring-avatars";
import { PlayerColor } from "../../module_bindings";
import { getColorConfig } from "../utils/colorMapping";
import { Crown, Award } from 'lucide-react';

type PlayerAvatarProps = {
    size: number;
    identity: string;
    color?: PlayerColor;
    isHighlighted?: boolean;
    isLoading?: boolean;
    placement?: number;
};

export const PlayerAvatar = ({
    size,
    identity,
    color = PlayerColor.Amber,
    isLoading = false,
    placement
}: PlayerAvatarProps) => {
    const colorConfig = getColorConfig(color);

    const getCrownColor = (place: number) => {
        if (place === 1) return '#FFC900';
        return null;
    };

    const getMedalColor = (place: number) => {
        if (place === 1) return '#FFC900';
        if (place === 2) return '#C0C0C0';
        if (place === 3) return '#CD7F32';
        if (place > 3) return '#9CA3AF';
        return null;
    };

    const getBorderColor = (place: number) => {
        if (place === 1) return '#FFC900';
        if (place === 2) return '#C0C0C0';
        if (place === 3) return '#CD7F32';
        return null;
    };

    const crownColor = placement ? getCrownColor(placement) : null;
    const medalColor = placement ? getMedalColor(placement) : null;
    const borderColor = placement ? getBorderColor(placement) : null;

    return (
        <div
            className={`relative shrink-0 border-2 rounded-full ${isLoading ? 'border-dashed' : ''}`}
            style={{ borderColor: borderColor || colorConfig.avatarColors[2] }}
        >
            {crownColor && (
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 animate-[crownDescend_0.6s_ease-out]"
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
                    className="bg-white/5 rounded-full"
                    style={{ width: size, height: size }}
                />
            ) : (
                <Avatar
                    size={size}
                    name={identity}
                    variant="beam"
                    colors={colorConfig.avatarColors}
                />
            )}
        </div>
    );
};
