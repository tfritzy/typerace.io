import Avatar from "boring-avatars";
import { PlayerColor } from "../../module_bindings";
import { getColorConfig } from "../utils/colorMapping";

type PlayerAvatarProps = {
    size: number;
    identity: string;
    color?: PlayerColor;
    isHighlighted?: boolean;
    isLoading?: boolean;
};

export const PlayerAvatar = ({
    size,
    identity,
    color = PlayerColor.Amber,
    isLoading = false
}: PlayerAvatarProps) => {
    const colorConfig = getColorConfig(color);

    return (
        <div
            className={`relative shrink-0 border-2 rounded-full ${isLoading ? 'border-dashed' : ''}`}
            style={{ borderColor: colorConfig.avatarColors[2] }}
        >
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
