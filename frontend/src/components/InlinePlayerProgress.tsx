import Avatar from "boring-avatars";
import { PlayerColor } from '../../module_bindings/player_color';
import { getColorConfig } from '../utils/colorMapping';

type InlinePlayerProgressProps = {
    name: string;
    level: number;
    progress: number;
    phraseLength: number;
    identityHash: string;
    playerColor?: PlayerColor;
};

export const InlinePlayerProgress = ({
    name,
    level,
    progress,
    phraseLength,
    identityHash,
    playerColor = PlayerColor.Amber,
}: InlinePlayerProgressProps) => {
    const colorConfig = getColorConfig(playerColor);
    
    return (
        <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
                <div 
                    className="relative shrink-0 border-2 rounded-full"
                    style={{ borderColor: `${colorConfig.primary}99` }}
                >
                    <Avatar
                        size={36}
                        name={identityHash}
                        variant="pixel"
                        colors={colorConfig.avatarColors}
                    />
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-white/90">
                        {name}
                    </span>
                    <span className="text-xs text-white/40">
                        Lvl {level}
                    </span>
                </div>

                <div className="ml-auto text-xs font-mono text-white/50 tabular-nums">
                    {progress}/{phraseLength}
                </div>
            </div>
        </div>
    );
};
