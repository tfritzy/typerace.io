import Avatar from "boring-avatars";
import { PlayerColor } from "../../module_bindings";
import { getColorConfig } from "../utils/colorMapping";

type PlayerAvatarProps = {
    size: number;
    identity: string;
    color?: PlayerColor;
};

export const PlayerAvatar = ({ size, identity, color = PlayerColor.Amber }: PlayerAvatarProps) => {
    const colorConfig = getColorConfig(color);

    return (
        <Avatar
            size={size}
            name={identity}
            variant="bauhaus"
            colors={colorConfig.avatarColors}
        />
    );
};
